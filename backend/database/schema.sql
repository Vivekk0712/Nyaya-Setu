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
    embedding vector(384),
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

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS legal_embeddings_embedding_idx 
ON legal_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS cases_user_id_idx ON cases(user_id);
CREATE INDEX IF NOT EXISTS cases_status_idx ON cases(status);
CREATE INDEX IF NOT EXISTS cases_filed_at_idx ON cases(filed_at);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_legal_documents(
    query_embedding vector(768),
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
