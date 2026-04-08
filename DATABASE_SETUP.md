# Database Setup Guide

## Overview
Nyaya-Setu uses Supabase (PostgreSQL) with pgvector extension for vector similarity search and chat persistence.

## Quick Setup

### Option 1: Fresh Setup (Recommended)

If you're setting up the database for the first time:

```bash
# In Supabase SQL Editor, run:
backend/database/schema.sql
```

This single file includes:
- ✅ All tables (users, cases, chat_messages, legal_embeddings, etc.)
- ✅ All indexes for performance
- ✅ All functions (vector search, chat history)
- ✅ All triggers

### Option 2: Existing Database (Migration)

If you already have the database set up and just need chat history:

```bash
# In Supabase SQL Editor, run:
backend/database/add_chat_history.sql
```

This adds only the chat persistence features.

## Database Schema

### Core Tables

#### 1. users
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- password_hash (TEXT)
- full_name (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 2. cases
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- incident_description (TEXT)
- legal_sections (TEXT[])
- draft_content (TEXT)
- pdf_url (TEXT)
- status (TEXT)
- filed_at, last_nudge_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### 3. chat_messages ⭐ NEW
```sql
- id (UUID, PK)
- case_id (UUID, FK → cases)
- user_id (UUID, FK → users)
- role (TEXT: 'user' or 'bot')
- message (TEXT)
- relevant_laws (TEXT[])
- metadata (JSONB)
- created_at (TIMESTAMP)
```

#### 4. legal_embeddings
```sql
- id (BIGSERIAL, PK)
- content (TEXT)
- metadata (JSONB)
- embedding (vector(384))
- created_at (TIMESTAMP)
```

#### 5. document_uploads
```sql
- id (UUID, PK)
- filename (TEXT)
- doc_type (TEXT)
- chunks_count (INTEGER)
- status (TEXT)
- uploaded_by (UUID, FK → users)
- created_at, completed_at (TIMESTAMP)
```

#### 6. admin_users
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- created_at (TIMESTAMP)
```

### Functions

#### 1. match_legal_documents
```sql
match_legal_documents(query_embedding vector(768), match_count int)
→ Returns similar legal documents using vector search
```

#### 2. get_chat_history ⭐ NEW
```sql
get_chat_history(p_case_id UUID, p_user_id UUID, message_limit INT)
→ Returns chat messages for a case
```

#### 3. delete_chat_history ⭐ NEW
```sql
delete_chat_history(p_case_id UUID, p_user_id UUID)
→ Deletes all chat messages for a case
```

### Indexes

Performance indexes on:
- `cases(user_id, status, filed_at)`
- `chat_messages(case_id, user_id, created_at)` ⭐ NEW
- `legal_embeddings(embedding)` - IVFFlat for vector search
- `users(email)`

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Wait for database to initialize
4. Note your project URL and API keys

### 2. Enable pgvector Extension

In Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Run Schema

Copy and paste the entire contents of `backend/database/schema.sql` into the SQL Editor and run it.

### 4. Verify Setup

Check that all tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected tables:
- users
- admin_users
- cases
- chat_messages ⭐
- legal_embeddings
- document_uploads

### 5. Configure Backend

Update `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

## Testing

### Test Chat Persistence

```sql
-- Insert test message
INSERT INTO chat_messages (case_id, user_id, role, message, relevant_laws)
VALUES (
  'test-case-id',
  'test-user-id',
  'user',
  'Test message',
  ARRAY['BNS 126(2)']
);

-- Retrieve messages
SELECT * FROM get_chat_history('test-case-id', 'test-user-id', 50);

-- Delete messages
SELECT delete_chat_history('test-case-id', 'test-user-id');
```

### Test Vector Search

```sql
-- Check embeddings
SELECT COUNT(*) FROM legal_embeddings;

-- Test similarity search (requires embeddings)
SELECT * FROM match_legal_documents(
  '[0.1, 0.2, ...]'::vector(768),
  3
);
```

## Maintenance

### Backup

```bash
# Supabase provides automatic backups
# Manual backup via CLI:
supabase db dump > backup.sql
```

### Monitor Storage

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Clean Old Data

```sql
-- Delete old chat messages (optional)
DELETE FROM chat_messages 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Vacuum to reclaim space
VACUUM ANALYZE chat_messages;
```

## Troubleshooting

### Issue: pgvector not found
**Solution:** Enable the extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Issue: Function already exists
**Solution:** Use `CREATE OR REPLACE FUNCTION` (already in schema)

### Issue: Permission denied
**Solution:** Ensure you're using the service role key for admin operations

### Issue: Slow queries
**Solution:** Check indexes exist:
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
```

## Migration from Old Schema

If you have an existing database without chat_messages:

```sql
-- 1. Add chat_messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'bot')),
    message TEXT NOT NULL,
    relevant_laws TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add indexes
CREATE INDEX chat_messages_case_id_idx ON chat_messages(case_id);
CREATE INDEX chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);

-- 3. Add functions (copy from schema.sql)
```

## Security

### Row Level Security (RLS)

Enable RLS for production:

```sql
-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own messages
CREATE POLICY "Users can view own messages"
ON chat_messages FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert own messages"
ON chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete own messages"
ON chat_messages FOR DELETE
USING (auth.uid() = user_id);
```

## Performance Tips

1. **Indexes**: Already created in schema
2. **Partitioning**: Consider partitioning chat_messages by date for large datasets
3. **Archiving**: Move old messages to archive table
4. **Caching**: Use Redis for frequently accessed data
5. **Connection Pooling**: Use pgBouncer (Supabase includes this)

## Summary

✅ Single schema.sql file for complete setup
✅ Chat persistence fully integrated
✅ Vector search ready
✅ Indexes for performance
✅ Functions for common operations
✅ Ready for production use

---

**Last Updated:** April 8, 2026
**Schema Version:** 2.0 (with chat persistence)
