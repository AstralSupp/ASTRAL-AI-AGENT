import dotenv from 'dotenv';
import { AgentConfig } from '../types';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres',
  },
  supabase: {
    url: process.env.SUPABASE_URL || 'http://localhost:3001',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },
  chatwoot: {
    url: process.env.CHATWOOT_URL || 'https://chatwoot.astralsup.com',
    apiToken: process.env.CHATWOOT_API_TOKEN || '7qNGm4ixCxpqQRrQ5Erh4rv5',
    accountId: process.env.CHATWOOT_ACCOUNT_ID || '1',
    inboxId: process.env.CHATWOOT_INBOX_ID || '1',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    voiceId: process.env.ELEVENLABS_VOICE_ID || 'yoiZfrc4wQ9Rs1QGpnm5',
  },
  agent: {
    name: process.env.AGENT_NAME || 'Astral',
    businessName: process.env.BUSINESS_NAME || 'AstralSup',
    businessDescription: process.env.BUSINESS_DESCRIPTION || 'Empresa brasileira de atendimento ao cliente',
    language: process.env.BUSINESS_LANGUAGE || 'pt-BR',
  },
  messaging: {
    burstDelayMs: parseInt(process.env.MESSAGE_BURST_DELAY_MS || '3000', 10),
    typingSpeedCps: parseInt(process.env.TYPING_SPEED_CPS || '50', 10),
    maxTypingIndicatorMs: parseInt(process.env.MAX_TYPING_INDICATOR_MS || '10000', 10),
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'change_this_password',
  },
};

export const getAgentConfig = (): AgentConfig => ({
  name: config.agent.name,
  business_name: config.agent.businessName,
  business_description: config.agent.businessDescription,
  language: config.agent.language,
  personality: 'Professional, friendly, and helpful. Acts like a human Brazilian customer service representative.',
  capabilities: [
    'Answer customer questions',
    'Provide product information',
    'Handle sales inquiries',
    'Escalate complex issues',
    'Respond in Portuguese (Brazil)',
    'Process voice messages',
    'Send voice responses',
  ],
});

export function validateConfig() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'CHATWOOT_URL',
    'CHATWOOT_API_TOKEN',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'ELEVENLABS_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
