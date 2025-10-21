import { ChatwootWebhook, ChatwootMessage, AgentDecision } from '../types';
import supabaseService from './supabase.service';
import chatwootService from './chatwoot.service';
import claudeService from './claude.service';
import openaiService from './openai.service';
import elevenlabsService from './elevenlabs.service';
import messageBurstService from './message-burst.service';
import logger from '../utils/logger';
import {
  calculateTypingDuration,
  calculateRecordingDuration,
  sleep,
  getHumanLikeDelay,
  shouldConsiderEmojiReaction,
} from '../utils/helpers';
import { config } from '../config';

class MessageProcessorService {
  async processWebhook(webhook: ChatwootWebhook) {
    try {
      logger.info('Processing webhook', {
        event: webhook.event,
        conversationId: webhook.conversation.id,
        messageType: webhook.message_type,
      });

      // Only process incoming messages
      if (webhook.message_type !== 'incoming') {
        logger.debug('Skipping outgoing message');
        return;
      }

      // Ignore messages from agents
      if (webhook.sender?.type === 'agent') {
        logger.debug('Skipping agent message');
        return;
      }

      // Store conversation and message
      await this.storeConversationData(webhook);

      // Handle message burst detection
      const shouldProcessNow = await messageBurstService.shouldProcessImmediately({
        id: webhook.id,
        content: webhook.content,
        message_type: webhook.message_type,
        content_type: webhook.content_type,
        created_at: Date.now(),
        private: false,
        source_id: webhook.conversation.contact_inbox.source_id,
      });

      if (!shouldProcessNow) {
        const burstComplete = await messageBurstService.handleIncomingMessage(
          webhook.conversation.id,
          {
            id: webhook.id,
            content: webhook.content,
            message_type: webhook.message_type,
            content_type: webhook.content_type,
            created_at: Date.now(),
            private: false,
            source_id: webhook.conversation.contact_inbox.source_id,
          }
        );

        if (!burstComplete) {
          logger.info('Waiting for message burst to complete');
          // The burst service will trigger processing when complete
          return;
        }
      }

      // Process the message
      await this.processMessage(webhook);
    } catch (error) {
      logger.error('Error processing webhook:', error);
      throw error;
    }
  }

  private async storeConversationData(webhook: ChatwootWebhook) {
    try {
      // Store/update conversation
      await supabaseService.upsertConversation({
        id: webhook.conversation.id,
        contact_id: webhook.conversation.meta.sender.id,
        contact_name: webhook.conversation.meta.sender.name,
        contact_phone: webhook.conversation.meta.sender.phone_number || '',
        account_id: webhook.account.id,
        inbox_id: webhook.conversation.inbox_id,
        status: webhook.conversation.status,
      });

      // Determine content - handle audio transcription if needed
      let messageContent = webhook.content;
      if (webhook.content_type === 'audio' && webhook.content_attributes?.file_url) {
        logger.info('Transcribing audio message');
        messageContent = await openaiService.transcribeAudio(
          webhook.content_attributes.file_url
        );
        logger.info('Audio transcribed', { transcription: messageContent });
      }

      // Store message
      await supabaseService.insertMessage({
        id: webhook.id,
        conversation_id: webhook.conversation.id,
        message_type: 'incoming',
        content_type: webhook.content_type,
        content: messageContent,
        role: 'user',
        content_attributes: webhook.content_attributes || {},
      });
    } catch (error) {
      logger.error('Error storing conversation data:', error);
      throw error;
    }
  }

  private async processMessage(webhook: ChatwootWebhook) {
    try {
      const conversationId = webhook.conversation.id;

      // Get conversation context
      const context = await supabaseService.getConversationContext(conversationId);
      if (!context) {
        logger.error('Could not fetch conversation context');
        return;
      }

      // Get message content (transcribed if audio)
      const messageContent = context.messages[context.messages.length - 1]?.content || webhook.content;

      // Decide what action to take
      const decision = await claudeService.decideAction(
        context.messages.slice(0, -1), // All messages except current
        messageContent
      );

      // Log the decision
      await supabaseService.logAgentDecision({
        conversation_id: conversationId,
        message_id: webhook.id,
        decision_type: decision.action,
        reasoning: decision.reasoning,
        metadata: decision,
      });

      logger.info('Agent decision', { decision });

      // Execute based on decision
      if (decision.action === 'wait') {
        logger.info('Waiting for more messages');
        return;
      }

      if (decision.action === 'react') {
        await this.handleEmojiReaction(conversationId, webhook.id, messageContent, context.messages);
        return;
      }

      if (decision.action === 'respond') {
        await this.handleResponse(
          conversationId,
          messageContent,
          context.messages,
          decision,
          webhook.content_type === 'audio'
        );
      }
    } catch (error) {
      logger.error('Error processing message:', error);
      throw error;
    }
  }

  private async handleEmojiReaction(
    conversationId: number,
    messageId: number,
    messageContent: string,
    history: any[]
  ) {
    try {
      if (!shouldConsiderEmojiReaction(messageContent)) {
        logger.debug('Message does not warrant emoji consideration');
        return;
      }

      const conversationContext = history
        .slice(-3)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      const emojiDecision = await claudeService.decideEmojiReaction(
        messageContent,
        conversationContext
      );

      if (emojiDecision.should_react && emojiDecision.emoji) {
        // Add human-like delay
        await sleep(getHumanLikeDelay(1000));

        await chatwootService.addMessageReaction(conversationId, messageId, emojiDecision.emoji);

        logger.info('Added emoji reaction', {
          conversationId,
          messageId,
          emoji: emojiDecision.emoji,
        });
      }
    } catch (error) {
      logger.error('Error handling emoji reaction:', error);
      // Don't throw - reactions are not critical
    }
  }

  private async handleResponse(
    conversationId: number,
    messageContent: string,
    history: any[],
    decision: AgentDecision,
    isAudioInput: boolean
  ) {
    try {
      // Generate response
      const response = await claudeService.generateResponse(history, messageContent);

      if (!response) {
        logger.error('No response generated');
        return;
      }

      // Determine if should send as audio (if input was audio or decision says so)
      const sendAsAudio = isAudioInput || decision.response_type === 'audio';

      // Show typing or recording indicator
      if (decision.should_show_typing || decision.should_show_recording) {
        await chatwootService.toggleTypingStatus(conversationId, 'on');

        // Calculate duration
        const duration = sendAsAudio
          ? calculateRecordingDuration(response.length, config.messaging.maxTypingIndicatorMs)
          : calculateTypingDuration(
              response.length,
              config.messaging.typingSpeedCps,
              config.messaging.maxTypingIndicatorMs
            );

        // Wait for human-like duration
        await sleep(getHumanLikeDelay(duration));

        await chatwootService.toggleTypingStatus(conversationId, 'off');
      }

      // Send response
      if (sendAsAudio) {
        await this.sendAudioResponse(conversationId, response);
      } else {
        await this.sendTextResponse(conversationId, response);
      }

      // Store response in database
      const sentMessage = await chatwootService.sendMessage(conversationId, response);
      await supabaseService.insertMessage({
        id: sentMessage.id,
        conversation_id: conversationId,
        message_type: 'outgoing',
        content_type: sendAsAudio ? 'audio' : 'text',
        content: response,
        role: 'assistant',
      });

      logger.info('Response sent successfully', {
        conversationId,
        responseType: sendAsAudio ? 'audio' : 'text',
        length: response.length,
      });
    } catch (error) {
      logger.error('Error handling response:', error);
      throw error;
    }
  }

  private async sendTextResponse(conversationId: number, text: string) {
    await chatwootService.sendMessage(conversationId, text);
  }

  private async sendAudioResponse(conversationId: number, text: string) {
    try {
      // Convert text to speech
      const audioResult = await elevenlabsService.textToSpeech(text);

      if (!audioResult.audio_buffer) {
        logger.error('No audio buffer generated, falling back to text');
        await this.sendTextResponse(conversationId, text);
        return;
      }

      // Send audio message
      await chatwootService.sendAudioMessage(
        conversationId,
        audioResult.audio_buffer,
        audioResult.format
      );

      logger.info('Audio message sent', {
        conversationId,
        duration: audioResult.duration_ms,
        format: audioResult.format,
      });
    } catch (error) {
      logger.error('Error sending audio response, falling back to text:', error);
      await this.sendTextResponse(conversationId, text);
    }
  }
}

export default new MessageProcessorService();
