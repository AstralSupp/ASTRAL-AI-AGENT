import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { ConversationContext, MessageHistory, AgentDecision } from '../types';
import logger from '../utils/logger';

class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(config.supabase.url, config.supabase.serviceKey);
  }

  async upsertConversation(conversationData: {
    id: number;
    contact_id: number;
    contact_name: string;
    contact_phone: string;
    account_id: number;
    inbox_id: number;
    status: string;
    metadata?: Record<string, any>;
  }) {
    const { data, error } = await this.client
      .from('conversations')
      .upsert(conversationData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      logger.error('Error upserting conversation:', error);
      throw error;
    }

    return data;
  }

  async insertMessage(messageData: {
    id: number;
    conversation_id: number;
    message_type: 'incoming' | 'outgoing';
    content_type: 'text' | 'audio' | 'image' | 'video' | 'file';
    content: string;
    role: 'user' | 'assistant';
    content_attributes?: Record<string, any>;
  }) {
    const { data, error } = await this.client
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      logger.error('Error inserting message:', error);
      throw error;
    }

    return data;
  }

  async getConversationHistory(conversationId: number, limit = 20): Promise<MessageHistory[]> {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching conversation history:', error);
      throw error;
    }

    return (data || [])
      .reverse()
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        message_type: msg.content_type === 'audio' ? 'audio' : 'text',
        timestamp: new Date(msg.created_at),
        message_id: msg.id,
      }));
  }

  async getConversationContext(conversationId: number): Promise<ConversationContext | null> {
    const { data: conversation, error: convError } = await this.client
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      logger.error('Error fetching conversation:', convError);
      return null;
    }

    const messages = await this.getConversationHistory(conversationId);

    return {
      conversation_id: conversation.id,
      contact_id: conversation.contact_id,
      contact_name: conversation.contact_name,
      contact_phone: conversation.contact_phone,
      messages,
      created_at: new Date(conversation.created_at),
      updated_at: new Date(conversation.updated_at),
      metadata: conversation.metadata || {},
    };
  }

  async createMessageBurst(burstData: {
    conversation_id: number;
    message_ids: number[];
    first_message_at: Date;
    last_message_at: Date;
  }) {
    const { data, error } = await this.client
      .from('message_bursts')
      .insert(burstData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating message burst:', error);
      throw error;
    }

    return data;
  }

  async updateMessageBurst(burstId: number, updates: { last_message_at?: Date; is_complete?: boolean; processed?: boolean; message_ids?: number[] }) {
    const { data, error } = await this.client
      .from('message_bursts')
      .update(updates)
      .eq('id', burstId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating message burst:', error);
      throw error;
    }

    return data;
  }

  async getActiveMessageBurst(conversationId: number) {
    const { data, error } = await this.client
      .from('message_bursts')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_complete', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching active message burst:', error);
      throw error;
    }

    return data;
  }

  async logAgentDecision(decision: {
    conversation_id: number;
    message_id?: number;
    decision_type: 'respond' | 'wait' | 'react' | 'think';
    reasoning: string;
    action_taken?: string;
    metadata?: Record<string, any>;
  }) {
    const { data, error } = await this.client
      .from('agent_decisions')
      .insert(decision)
      .select()
      .single();

    if (error) {
      logger.error('Error logging agent decision:', error);
      throw error;
    }

    return data;
  }

  async getChatwootKnowledge(query?: string, limit = 10) {
    let queryBuilder = this.client.from('chatwoot_knowledge').select('*');

    if (query) {
      queryBuilder = queryBuilder.textSearch('content', query);
    }

    const { data, error } = await queryBuilder.limit(limit);

    if (error) {
      logger.error('Error fetching Chatwoot knowledge:', error);
      throw error;
    }

    return data || [];
  }

  async upsertChatwootKnowledge(knowledgeData: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }) {
    const { data, error } = await this.client
      .from('chatwoot_knowledge')
      .upsert(knowledgeData, { onConflict: 'title' })
      .select()
      .single();

    if (error) {
      logger.error('Error upserting Chatwoot knowledge:', error);
      throw error;
    }

    return data;
  }
}

export default new SupabaseService();
