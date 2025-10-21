-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT PRIMARY KEY,
    contact_id BIGINT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    account_id BIGINT NOT NULL,
    inbox_id BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL CHECK (message_type IN ('incoming', 'outgoing')),
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'audio', 'image', 'video', 'file')),
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content_attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_bursts table for tracking multiple messages from customer
CREATE TABLE IF NOT EXISTS message_bursts (
    id SERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_ids BIGINT[] NOT NULL,
    first_message_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_decisions table for tracking AI decisions
CREATE TABLE IF NOT EXISTS agent_decisions (
    id SERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id BIGINT REFERENCES messages(id) ON DELETE SET NULL,
    decision_type TEXT NOT NULL CHECK (decision_type IN ('respond', 'wait', 'react', 'think')),
    reasoning TEXT NOT NULL,
    action_taken TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatwoot_knowledge table for storing Chatwoot documentation
CREATE TABLE IF NOT EXISTS chatwoot_knowledge (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_bursts_conversation_id ON message_bursts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_bursts_processed ON message_bursts(processed) WHERE NOT processed;
CREATE INDEX IF NOT EXISTS idx_agent_decisions_conversation_id ON agent_decisions(conversation_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_bursts_updated_at
    BEFORE UPDATE ON message_bursts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatwoot_knowledge_updated_at
    BEFORE UPDATE ON chatwoot_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_bursts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatwoot_knowledge ENABLE ROW LEVEL SECURITY;

-- Create policies (allow service role full access)
CREATE POLICY "Service role has full access to conversations"
    ON conversations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to messages"
    ON messages
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to message_bursts"
    ON message_bursts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to agent_decisions"
    ON agent_decisions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to chatwoot_knowledge"
    ON chatwoot_knowledge
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
