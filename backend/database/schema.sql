-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (our own auth system)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Document uploads tracking
CREATE TABLE IF NOT EXISTS document_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    chunks_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'processing',
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Legal embeddings table for RAG
CREATE TABLE IF NOT EXISTS legal_embeddings (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(384),  -- 384 dimensions for all-MiniLM-L6-v2 (local, fast, free)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cases tracking table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    incident_description TEXT NOT NULL,
    legal_sections TEXT[],
    draft_content TEXT,
    pdf_url TEXT,
    status TEXT DEFAULT 'draft',
    filed_at TIMESTAMP,
    last_nudge_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat history table for conversation persistence
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'bot')),
    message TEXT NOT NULL,
    relevant_laws TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS legal_embeddings_embedding_idx 
ON legal_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS cases_user_id_idx ON cases(user_id);
CREATE INDEX IF NOT EXISTS cases_status_idx ON cases(status);
CREATE INDEX IF NOT EXISTS cases_filed_at_idx ON cases(filed_at);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS chat_messages_case_id_idx ON chat_messages(case_id);
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_legal_documents(
    query_embedding vector(384),  -- 384 dimensions for all-MiniLM-L6-v2
    match_count int DEFAULT 3
)
RETURNS TABLE (
    id bigint,
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        legal_embeddings.id,
        legal_embeddings.content,
        legal_embeddings.metadata,
        1 - (legal_embeddings.embedding <=> query_embedding) as similarity
    FROM legal_embeddings
    ORDER BY legal_embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get chat history for a case
CREATE OR REPLACE FUNCTION get_chat_history(
    p_case_id UUID,
    p_user_id UUID,
    message_limit INT DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    role TEXT,
    message TEXT,
    relevant_laws TEXT[],
    metadata JSONB,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $
BEGIN
    RETURN QUERY
    SELECT
        chat_messages.id,
        chat_messages.role,
        chat_messages.message,
        chat_messages.relevant_laws,
        chat_messages.metadata,
        chat_messages.created_at
    FROM chat_messages
    WHERE chat_messages.case_id = p_case_id
      AND chat_messages.user_id = p_user_id
    ORDER BY chat_messages.created_at ASC
    LIMIT message_limit;
END;
$;

-- Function to delete chat history for a case
CREATE OR REPLACE FUNCTION delete_chat_history(
    p_case_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $
BEGIN
    DELETE FROM chat_messages
    WHERE case_id = p_case_id
      AND user_id = p_user_id;
    
    RETURN TRUE;
END;
$;

-- Comments for documentation
COMMENT ON TABLE chat_messages IS 'Stores chat conversation history between users and the AI interpreter agent';
COMMENT ON COLUMN chat_messages.role IS 'Either "user" or "bot" to indicate who sent the message';
COMMENT ON COLUMN chat_messages.relevant_laws IS 'Array of legal sections identified in this message';
COMMENT ON COLUMN chat_messages.metadata IS 'Additional metadata like needs_clarification, ready_to_draft flags';
