import { MessageBurst, ChatwootMessage } from '../types';
import { config } from '../config';
import { sleep, isMessageLikelyComplete } from '../utils/helpers';
import databaseService from './database.service';
import logger from '../utils/logger';

class MessageBurstService {
  private activeBursts: Map<number, NodeJS.Timeout> = new Map();

  async handleIncomingMessage(conversationId: number, message: ChatwootMessage): Promise<boolean> {
    try {
      // Check if there's an active burst for this conversation
      let burst = await databaseService.getActiveMessageBurst(conversationId);

      const now = new Date();

      if (!burst) {
        // Create new burst
        burst = await databaseService.createMessageBurst({
          conversation_id: conversationId,
          message_ids: [message.id],
          first_message_at: now,
          last_message_at: now,
        });

        logger.info('Created new message burst', {
          conversationId,
          burstId: burst.id,
        });
      } else {
        // Update existing burst
        const messageIds = [...(burst.message_ids || []), message.id];
        await databaseService.updateMessageBurst(burst.id, {
          message_ids: messageIds,
          last_message_at: now,
        });

        logger.info('Updated message burst', {
          conversationId,
          burstId: burst.id,
          messageCount: messageIds.length,
        });
      }

      // Clear existing timer if any
      if (this.activeBursts.has(conversationId)) {
        clearTimeout(this.activeBursts.get(conversationId)!);
      }

      // Check if message seems complete
      const seemsComplete = isMessageLikelyComplete(message.content);

      // Set timer to mark burst as complete
      const delay = seemsComplete
        ? config.messaging.burstDelayMs
        : config.messaging.burstDelayMs * 1.5;

      const timer = setTimeout(async () => {
        await this.completeBurst(conversationId, burst!.id);
        this.activeBursts.delete(conversationId);
      }, delay);

      this.activeBursts.set(conversationId, timer);

      // Return false to indicate we should wait
      return false;
    } catch (error) {
      logger.error('Error handling message burst:', error);
      // On error, process immediately
      return true;
    }
  }

  private async completeBurst(conversationId: number, burstId: number) {
    try {
      await databaseService.updateMessageBurst(burstId, {
        is_complete: true,
      });

      logger.info('Message burst completed', {
        conversationId,
        burstId,
      });

      // Emit event or trigger processing
      // This is where you'd call the message processor
      await this.processBurst(conversationId, burstId);
    } catch (error) {
      logger.error('Error completing burst:', error);
    }
  }

  async processBurst(conversationId: number, burstId: number) {
    try {
      logger.info('Processing message burst', { conversationId, burstId });

      // Mark as processed
      await databaseService.updateMessageBurst(burstId, {
        processed: true,
      });

      // Return signal to process the conversation
      return { conversationId, burstId };
    } catch (error) {
      logger.error('Error processing burst:', error);
      throw error;
    }
  }

  async shouldProcessImmediately(message: ChatwootMessage): Promise<boolean> {
    // Process immediately if:
    // 1. Message is a question
    // 2. Message seems urgent
    // 3. Message contains urgent keywords

    const urgentKeywords = [
      'urgente',
      'emergência',
      'ajuda',
      'problema',
      'agora',
      'rápido',
      'socorro',
    ];

    const content = message.content.toLowerCase();

    if (content.includes('?')) {
      return true;
    }

    if (urgentKeywords.some((keyword) => content.includes(keyword))) {
      return true;
    }

    return false;
  }

  clearBurst(conversationId: number) {
    if (this.activeBursts.has(conversationId)) {
      clearTimeout(this.activeBursts.get(conversationId)!);
      this.activeBursts.delete(conversationId);
    }
  }
}

export default new MessageBurstService();
