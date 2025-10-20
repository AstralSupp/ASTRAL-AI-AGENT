export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: 'incoming' | 'outgoing';
  created_at: number;
  private: boolean;
  source_id: string;
  content_type: 'text' | 'audio' | 'image' | 'video' | 'file';
  content_attributes?: {
    file_url?: string;
    duration?: number;
  };
  sender?: {
    id: number;
    name: string;
    type: 'contact' | 'agent';
  };
  conversation?: {
    id: number;
    status: string;
  };
}

export interface ChatwootWebhook {
  event: string;
  id: number;
  content: string;
  created_at: string;
  message_type: 'incoming' | 'outgoing';
  content_type: 'text' | 'audio' | 'image' | 'video' | 'file';
  content_attributes?: {
    file_url?: string;
    duration?: number;
  };
  conversation: {
    id: number;
    messages: ChatwootMessage[];
    meta: {
      sender: {
        id: number;
        name: string;
        phone_number: string;
      };
    };
    contact_inbox: {
      source_id: string;
    };
    status: string;
    account_id: number;
    inbox_id: number;
  };
  sender?: {
    id: number;
    name: string;
    type: 'contact' | 'agent';
  };
  account: {
    id: number;
    name: string;
  };
}

export interface ConversationContext {
  conversation_id: number;
  contact_id: number;
  contact_name: string;
  contact_phone: string;
  messages: MessageHistory[];
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

export interface MessageHistory {
  role: 'user' | 'assistant';
  content: string;
  message_type: 'text' | 'audio';
  timestamp: Date;
  message_id?: number;
}

export interface AgentDecision {
  action: 'respond' | 'wait' | 'react';
  reasoning: string;
  response?: string;
  emoji_reaction?: string;
  should_show_typing?: boolean;
  estimated_typing_duration?: number;
  should_show_recording?: boolean;
  response_type?: 'text' | 'audio';
}

export interface MessageBurst {
  conversation_id: number;
  messages: ChatwootMessage[];
  last_message_at: Date;
  is_complete: boolean;
}

export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface AudioProcessingResult {
  audio_url?: string;
  audio_buffer?: Buffer;
  duration_ms: number;
  format: 'mp3' | 'ogg' | 'opus';
}

export interface AgentConfig {
  name: string;
  business_name: string;
  business_description: string;
  language: string;
  personality: string;
  capabilities: string[];
  chatwoot_knowledge?: string;
}

export interface TypingIndicator {
  conversation_id: number;
  duration_ms: number;
  type: 'typing' | 'recording';
}

export interface EmojiReactionDecision {
  should_react: boolean;
  emoji?: string;
  reasoning: string;
  confidence: number;
}
