import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import { ConversationContext, MessageHistory, AgentDecision } from '../types';
import logger from '../utils/logger';

class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });

    // Test connection
    this.testConnection();
  }

  private async testConnection() {
    try {
      const client = await this.pool.connect();
      logger.info('Database connection established successfully');
      client.release();
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      logger.error('Database query error:', { text, error });
      throw error;
    }
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
    const query = `
      INSERT INTO conversations (id, contact_id, contact_name, contact_phone, account_id, inbox_id, status, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id)
      DO UPDATE SET
        contact_name = EXCLUDED.contact_name,
        contact_phone = EXCLUDED.contact_phone,
        status = EXCLUDED.status,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      conversationData.id,
      conversationData.contact_id,
      conversationData.contact_name,
      conversationData.contact_phone,
      conversationData.account_id,
      conversationData.inbox_id,
      conversationData.status,
      JSON.stringify(conversationData.metadata || {}),
    ];

    const result = await this.query(query, values);
    return result.rows[0];
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
    const query = `
      INSERT INTO messages (id, conversation_id, message_type, content_type, content, role, content_attributes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
      RETURNING *
    `;

    const values = [
      messageData.id,
      messageData.conversation_id,
      messageData.message_type,
      messageData.content_type,
      messageData.content,
      messageData.role,
      JSON.stringify(messageData.content_attributes || {}),
    ];

    const result = await this.query(query, values);
    return result.rows[0];
  }

  async getConversationHistory(conversationId: number, limit = 20): Promise<MessageHistory[]> {
    const query = `
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await this.query(query, [conversationId, limit]);

    return result.rows
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
    const query = 'SELECT * FROM conversations WHERE id = $1';
    const result = await this.query(query, [conversationId]);

    if (result.rows.length === 0) {
      return null;
    }

    const conversation = result.rows[0];
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
    const query = `
      INSERT INTO message_bursts (conversation_id, message_ids, first_message_at, last_message_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      burstData.conversation_id,
      burstData.message_ids,
      burstData.first_message_at,
      burstData.last_message_at,
    ];

    const result = await this.query(query, values);
    return result.rows[0];
  }

  async updateMessageBurst(
    burstId: number,
    updates: {
      last_message_at?: Date;
      is_complete?: boolean;
      processed?: boolean;
      message_ids?: number[];
    }
  ) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.last_message_at) {
      fields.push(`last_message_at = $${paramIndex++}`);
      values.push(updates.last_message_at);
    }
    if (updates.is_complete !== undefined) {
      fields.push(`is_complete = $${paramIndex++}`);
      values.push(updates.is_complete);
    }
    if (updates.processed !== undefined) {
      fields.push(`processed = $${paramIndex++}`);
      values.push(updates.processed);
    }
    if (updates.message_ids) {
      fields.push(`message_ids = $${paramIndex++}`);
      values.push(updates.message_ids);
    }

    values.push(burstId);

    const query = `
      UPDATE message_bursts
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.query(query, values);
    return result.rows[0];
  }

  async getActiveMessageBurst(conversationId: number) {
    const query = `
      SELECT * FROM message_bursts
      WHERE conversation_id = $1 AND is_complete = false
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await this.query(query, [conversationId]);
    return result.rows[0] || null;
  }

  async logAgentDecision(decision: {
    conversation_id: number;
    message_id?: number;
    decision_type: 'respond' | 'wait' | 'react' | 'think';
    reasoning: string;
    action_taken?: string;
    metadata?: Record<string, any>;
  }) {
    const query = `
      INSERT INTO agent_decisions (conversation_id, message_id, decision_type, reasoning, action_taken, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      decision.conversation_id,
      decision.message_id || null,
      decision.decision_type,
      decision.reasoning,
      decision.action_taken || null,
      JSON.stringify(decision.metadata || {}),
    ];

    const result = await this.query(query, values);
    return result.rows[0];
  }

  async getChatwootKnowledge(searchQuery?: string, limit = 10) {
    let query = 'SELECT * FROM chatwoot_knowledge';
    const values: any[] = [];

    if (searchQuery) {
      query += ` WHERE content ILIKE $1 OR title ILIKE $1 LIMIT $2`;
      values.push(`%${searchQuery}%`, limit);
    } else {
      query += ` LIMIT $1`;
      values.push(limit);
    }

    const result = await this.query(query, values);
    return result.rows;
  }

  async upsertChatwootKnowledge(knowledgeData: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }) {
    const query = `
      INSERT INTO chatwoot_knowledge (title, content, category, tags, metadata)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (title)
      DO UPDATE SET
        content = EXCLUDED.content,
        category = EXCLUDED.category,
        tags = EXCLUDED.tags,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      knowledgeData.title,
      knowledgeData.content,
      knowledgeData.category || null,
      knowledgeData.tags || [],
      JSON.stringify(knowledgeData.metadata || {}),
    ];

    const result = await this.query(query, values);
    return result.rows[0];
  }

  // Admin dashboard queries
  async getRecentLogs(limit = 100) {
    const query = `
      SELECT
        ad.*,
        c.contact_name,
        m.content as message_content
      FROM agent_decisions ad
      LEFT JOIN conversations c ON ad.conversation_id = c.id
      LEFT JOIN messages m ON ad.message_id = m.id
      ORDER BY ad.created_at DESC
      LIMIT $1
    `;

    const result = await this.query(query, [limit]);
    return result.rows;
  }

  async getStats() {
    const queries = {
      totalConversations: 'SELECT COUNT(*) as count FROM conversations',
      totalMessages: 'SELECT COUNT(*) as count FROM messages',
      totalDecisions: 'SELECT COUNT(*) as count FROM agent_decisions',
      recentActivity: `
        SELECT COUNT(*) as count FROM messages
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `,
    };

    const results = await Promise.all([
      this.query(queries.totalConversations),
      this.query(queries.totalMessages),
      this.query(queries.totalDecisions),
      this.query(queries.recentActivity),
    ]);

    return {
      totalConversations: parseInt(results[0].rows[0].count),
      totalMessages: parseInt(results[1].rows[0].count),
      totalDecisions: parseInt(results[2].rows[0].count),
      recentActivity: parseInt(results[3].rows[0].count),
    };
  }

  async close() {
    await this.pool.end();
    logger.info('Database connection pool closed');
  }
}

export default new DatabaseService();
