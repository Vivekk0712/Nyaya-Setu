-- Fix vector dimension mismatch - Version 2
-- This deletes existing data and recreates the table

-- Step 1: Drop the table completely (this will delete all embeddings)
DROP TABLE IF EXISTS legal_embeddings CASCADE;

-- Step 2: Recreate with correct dimensions (768 for gemini-embedding-001)
CREATE TABLE legal_embeddings (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(768),  -- 768 dimensions for gemini-embedding-001
    created_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create the index
CREATE INDEX legal_embeddings_embedding_idx 
ON legal_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Step 4: Verify
SELECT 
    table_name, 
    column_name, 
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'legal_embeddings' 
  AND column_name = 'embedding';

-- Success message
SELECT 'Table recreated successfully with 768 dimensions' as status;
