-- Fix vector dimension mismatch
-- gemini-embedding-001 produces 768-dimensional vectors

-- Step 1: Drop the old index
DROP INDEX IF EXISTS legal_embeddings_embedding_idx;

-- Step 2: Alter the column to use 768 dimensions
ALTER TABLE legal_embeddings 
ALTER COLUMN embedding TYPE vector(768);

-- Step 3: Recreate the index
CREATE INDEX legal_embeddings_embedding_idx 
ON legal_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Verify the change
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'legal_embeddings' AND column_name = 'embedding';

COMMENT ON COLUMN legal_embeddings.embedding IS '768-dimensional vector from gemini-embedding-001 model';
