import Anthropic from '@anthropic-ai/sdk';
import { config, getAgentConfig } from '../config';
import { MessageHistory, AgentDecision, EmojiReactionDecision } from '../types';
import {
  getSystemPrompt,
  getEmojiDecisionPrompt,
  getResponseDecisionPrompt,
} from '../prompts/system-prompt';
import logger from '../utils/logger';

class ClaudeService {
  private client: Anthropic;
  private systemPrompt: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
    this.systemPrompt = getSystemPrompt(getAgentConfig());
  }

  async generateResponse(
    messages: MessageHistory[],
    currentMessage: string
  ): Promise<string> {
    try {
      const formattedMessages = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Add current message
      formattedMessages.push({
        role: 'user',
        content: currentMessage,
      });

      logger.info('Generating Claude response', {
        messageCount: formattedMessages.length,
      });

      const response = await this.client.messages.create({
        model: config.anthropic.model,
        max_tokens: 2048,
        system: this.systemPrompt,
        messages: formattedMessages as Anthropic.MessageParam[],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      const responseText = textContent && 'text' in textContent ? textContent.text : '';

      logger.info('Claude response generated', {
        length: responseText.length,
        usage: response.usage,
      });

      return responseText;
    } catch (error) {
      logger.error('Error generating Claude response:', error);
      throw error;
    }
  }

  async decideAction(
    messages: MessageHistory[],
    currentMessage: string
  ): Promise<AgentDecision> {
    try {
      const prompt = getResponseDecisionPrompt(messages, currentMessage);

      const response = await this.client.messages.create({
        model: config.anthropic.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      const responseText = textContent && 'text' in textContent ? textContent.text : '{}';

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('No JSON found in decision response, defaulting to respond');
        return {
          action: 'respond',
          reasoning: 'Failed to parse decision, defaulting to respond',
          should_show_typing: true,
          response_type: 'text',
        };
      }

      const decision = JSON.parse(jsonMatch[0]);

      logger.info('Action decision made', decision);

      return {
        action: decision.action || 'respond',
        reasoning: decision.reasoning || '',
        should_show_typing: decision.should_show_typing || false,
        should_show_recording: decision.should_show_recording || false,
        response_type: decision.response_type || 'text',
        estimated_typing_duration: decision.estimated_response_time_ms || 2000,
      };
    } catch (error) {
      logger.error('Error deciding action:', error);
      // Default to respond on error
      return {
        action: 'respond',
        reasoning: 'Error in decision making, defaulting to respond',
        should_show_typing: true,
        response_type: 'text',
      };
    }
  }

  async decideEmojiReaction(
    messageContent: string,
    conversationContext: string
  ): Promise<EmojiReactionDecision> {
    try {
      const prompt = getEmojiDecisionPrompt(messageContent, conversationContext);

      const response = await this.client.messages.create({
        model: config.anthropic.model,
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      const responseText = textContent && 'text' in textContent ? textContent.text : '{}';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          should_react: false,
          reasoning: 'Failed to parse emoji decision',
          confidence: 0,
        };
      }

      const decision = JSON.parse(jsonMatch[0]);

      logger.info('Emoji reaction decision', decision);

      return {
        should_react: decision.should_react || false,
        emoji: decision.emoji || undefined,
        reasoning: decision.reasoning || '',
        confidence: decision.confidence || 0,
      };
    } catch (error) {
      logger.error('Error deciding emoji reaction:', error);
      return {
        should_react: false,
        reasoning: 'Error in emoji decision',
        confidence: 0,
      };
    }
  }

  updateSystemPrompt(chatwootKnowledge?: string) {
    this.systemPrompt = getSystemPrompt(getAgentConfig(), chatwootKnowledge);
    logger.info('System prompt updated with Chatwoot knowledge');
  }
}

export default new ClaudeService();
