-- Switch back to 384 dimensions for all-MiniLM-L6-v2 embeddings
-- This is faster and doesn't use API quota

-- Step 1: Drop the table
DROP TABLE IF EXISTS legal_embeddings CASCADE;

-- Step 2: Recreate with 384 dimensions (for all-MiniLM-L6-v2)
CREATE TABLE legal_embeddings (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(384),  -- 384 dimensions for all-MiniLM-L6-v2
    created_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create the index
CREATE INDEX legal_embeddings_embedding_idx 
ON legal_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Step 4: Update the function to accept 384 dimensions
CREATE OR REPLACE FUNCTION match_legal_documents(
    query_embedding vector(384),  -- Changed to 384
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

SELECT 'Successfully switched to 384 dimensions for all-MiniLM-L6-v2' as status;
