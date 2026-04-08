# Nyaya-Setu Quick Start Guide

Get Nyaya-Setu running in 10 minutes!

## Prerequisites Checklist

- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Supabase account (free tier works)
- [ ] Gemini API key (get from ai.google.dev)

## Step 1: Supabase Setup (3 minutes)

1. Go to https://supabase.com and create a new project
2. Wait for project to initialize
3. Go to SQL Editor and run this:

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Legal embeddings table
CREATE TABLE legal_embeddings (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(768),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cases table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cases" ON cases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases" ON cases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases" ON cases
    FOR UPDATE USING (auth.uid() = user_id);

-- Vector search function
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
```

4. Go to Settings > API and copy:
   - Project URL
   - anon/public key
   - JWT Secret (under "JWT Settings" section)

## Step 2: Get Gemini API Key (1 minute)

1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create new API key
4. Copy the key

## Step 3: Backend Setup (3 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy .env.example to .env and fill in:
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

# Run backend
python main.py
```

Backend should now be running at http://localhost:8000

## Step 4: Frontend Setup (3 minutes)

Open a NEW terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
# Copy .env.example to .env and fill in:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000

# Run frontend
npm run dev
```

Frontend should now be running at http://localhost:5173

## Step 5: Test It Out!

1. Open http://localhost:5173 in your browser
2. Click "Sign Up"
3. Create an account
4. Click "New Case"
5. Describe an incident (try this):
   ```
   My landlord locked me out of my apartment without notice and 
   refused to return my security deposit of Rs. 50,000. He also 
   threatened me when I asked for my belongings.
   ```
6. Click "Analyze My Case"
7. Review the AI interpretation
8. Click "Generate Formal Legal Draft"
9. View your case in the dashboard!

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.9+)
- Make sure .env file exists with correct values
- Check if port 8000 is already in use

### Frontend won't start
- Check Node version: `node --version` (should be 18+)
- Delete node_modules and run `npm install` again
- Make sure .env file exists with correct values

### "Failed to process incident"
- Check backend is running at http://localhost:8000
- Check Gemini API key is valid
- Check browser console for errors

### "Case not found" or auth errors
- Make sure you're logged in
- Check Supabase RLS policies are created
- Try logging out and back in

## Next Steps

1. **Add Legal Data**: Run the ingestion script to add BNS laws
   ```bash
   cd backend
   python ingest.py
   ```

2. **Customize**: Edit the prompts in `backend/agents/` to match your needs

3. **Deploy**: Follow Phase 4 in implementation plan for deployment

## Need Help?

- Check the full README.md for detailed documentation
- Review implementation-plan/ for phase-by-phase guide
- Check docs/ for architecture details

## Demo Script

For hackathon demo:

1. Show landing page (30 sec)
2. Quick signup (15 sec)
3. Describe incident (30 sec)
4. Show AI interpretation (30 sec)
5. Generate PDF (30 sec)
6. Show dashboard and timeline (30 sec)
7. Explain automated nudge system (30 sec)

Total: 3 minutes

Good luck with your hackathon!
