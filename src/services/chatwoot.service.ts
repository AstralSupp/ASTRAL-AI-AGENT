import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import logger from '../utils/logger';
import FormData from 'form-data';

class ChatwootService {
  private client: AxiosInstance;
  private accountId: string;
  private inboxId: string;

  constructor() {
    this.accountId = config.chatwoot.accountId;
    this.inboxId = config.chatwoot.inboxId;

    this.client = axios.create({
      baseURL: `${config.chatwoot.url}/api/v1`,
      headers: {
        api_access_token: config.chatwoot.apiToken,
        'Content-Type': 'application/json',
      },
    });
  }

  async sendMessage(conversationId: number, content: string, messageType: 'outgoing' | 'incoming' = 'outgoing') {
    try {
      logger.info('Sending message to Chatwoot', {
        conversationId,
        contentLength: content.length,
      });

      const response = await this.client.post(
        `/accounts/${this.accountId}/conversations/${conversationId}/messages`,
        {
          content,
          message_type: messageType,
          private: false,
        }
      );

      logger.info('Message sent successfully', { messageId: response.data.id });

      return response.data;
    } catch (error) {
      logger.error('Error sending message to Chatwoot:', error);
      throw error;
    }
  }

  async sendAudioMessage(conversationId: number, audioBuffer: Buffer, format = 'mp3') {
    try {
      logger.info('Sending audio message to Chatwoot', {
        conversationId,
        audioSize: audioBuffer.length,
      });

      const formData = new FormData();
      formData.append('content', 'Audio message');
      formData.append('message_type', 'outgoing');
      formData.append('private', 'false');
      formData.append('attachments[]', audioBuffer, {
        filename: `voice-message.${format}`,
        contentType: `audio/${format}`,
      });

      const response = await this.client.post(
        `/accounts/${this.accountId}/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            api_access_token: config.chatwoot.apiToken,
          },
        }
      );

      logger.info('Audio message sent successfully', { messageId: response.data.id });

      return response.data;
    } catch (error) {
      logger.error('Error sending audio message to Chatwoot:', error);
      throw error;
    }
  }

  async toggleTypingStatus(conversationId: number, typingStatus: 'on' | 'off') {
    try {
      await this.client.post(
        `/accounts/${this.accountId}/conversations/${conversationId}/toggle_typing_status`,
        {
          typing_status: typingStatus,
        }
      );

      logger.debug('Typing status toggled', { conversationId, typingStatus });
    } catch (error) {
      logger.error('Error toggling typing status:', error);
      // Don't throw - typing indicator is not critical
    }
  }

  async addMessageReaction(conversationId: number, messageId: number, emoji: string) {
    try {
      logger.info('Adding emoji reaction to message', {
        conversationId,
        messageId,
        emoji,
      });

      // Note: Chatwoot's API endpoint for reactions may vary by version
      // This is a common pattern, adjust if needed
      const response = await this.client.post(
        `/accounts/${this.accountId}/conversations/${conversationId}/messages/${messageId}/reactions`,
        {
          emoji,
        }
      );

      logger.info('Emoji reaction added successfully');

      return response.data;
    } catch (error) {
      logger.error('Error adding emoji reaction:', error);
      // Don't throw - reactions are not critical
    }
  }

  async getConversation(conversationId: number) {
    try {
      const response = await this.client.get(
        `/accounts/${this.accountId}/conversations/${conversationId}`
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching conversation:', error);
      throw error;
    }
  }

  async getConversationMessages(conversationId: number) {
    try {
      const response = await this.client.get(
        `/accounts/${this.accountId}/conversations/${conversationId}/messages`
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching conversation messages:', error);
      throw error;
    }
  }

  async updateConversationStatus(conversationId: number, status: 'open' | 'resolved' | 'pending') {
    try {
      const response = await this.client.post(
        `/accounts/${this.accountId}/conversations/${conversationId}/toggle_status`,
        {
          status,
        }
      );

      logger.info('Conversation status updated', { conversationId, status });

      return response.data;
    } catch (error) {
      logger.error('Error updating conversation status:', error);
      throw error;
    }
  }

  async assignConversation(conversationId: number, agentId?: number) {
    try {
      const response = await this.client.post(
        `/accounts/${this.accountId}/conversations/${conversationId}/assignments`,
        {
          assignee_id: agentId,
        }
      );

      logger.info('Conversation assigned', { conversationId, agentId });

      return response.data;
    } catch (error) {
      logger.error('Error assigning conversation:', error);
      throw error;
    }
  }

  async searchConversations(query: string) {
    try {
      const response = await this.client.get(
        `/accounts/${this.accountId}/conversations/search`,
        {
          params: {
            q: query,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error searching conversations:', error);
      throw error;
    }
  }
}

export default new ChatwootService();
