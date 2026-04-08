# 🏁 Phase 1: Foundation & Data Setup

**Goal:** Set up repositories, Supabase with auth, and ingest legal data  
**Estimated Time:** 2 Hours

## User Stories

### US-1.1: As a developer, I need a working development environment
**Acceptance Criteria:**
- Backend runs on localhost:8000
- Frontend runs on localhost:5173
- Both can communicate via CORS

### US-1.2: As a user, I need to create an account and login securely
**Acceptance Criteria:**
- User can sign up with email/password
- User can login and receive JWT token
- Session persists across page refreshes

### US-1.3: As the system, I need access to legal knowledge
**Acceptance Criteria:**
- BNS laws are embedded and stored in pgvector
- RAG retrieval returns relevant legal sections
- Test query successfully retrieves laws

## Technical Tasks

### 1. Project Initialization
- [ ] Create mono-repo structure:
  ```
  nyaya-setu/
  ├── backend/
  ├── frontend/
  ├── docs/
  └── implementation-plan/
  ```
- [ ] **Backend Setup:**
  - [ ] Create Python virtual environment: `python -m venv venv`
  - [ ] Install dependencies:
    ```bash
    pip install fastapi uvicorn supabase langchain langchain-google-genai python-dotenv reportlab pdfkit apscheduler python-multipart
    ```
  - [ ] Create `.env` file with:
    ```
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_gemini_key
    ```

- [ ] **Frontend Setup:**
  - [ ] Run: `npm create vite@latest frontend --template react`
  - [ ] Install Tailwind CSS:
    ```bash
    cd frontend
    npm install -D tailwindcss postcss autoprefixer
    npm install @supabase/supabase-js
    npx tailwindcss init -p
    ```

### 2. Supabase Setup & Authentication

- [ ] Create new Supabase project at supabase.com
- [ ] Enable Email Auth in Authentication settings
- [ ] Configure email templates (optional)
- [ ] Enable pgvector extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

- [ ] Create database schema:
  ```sql
  -- Users table (managed by Supabase Auth)
  
  -- Legal embeddings for RAG
  CREATE TABLE legal_embeddings (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(768),
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Cases tracking
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

  -- Create index for vector similarity search
  CREATE INDEX ON legal_embeddings USING ivfflat (embedding vector_cosine_ops);
  
  -- Enable RLS
  ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
  
  -- Policy: Users can only see their own cases
  CREATE POLICY "Users can view own cases" ON cases
    FOR SELECT USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can insert own cases" ON cases
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Users can update own cases" ON cases
    FOR UPDATE USING (auth.uid() = user_id);
  ```

### 3. Data Ingestion (RAG Preparation)

- [ ] Download BNS (Bharatiya Nyaya Sanhita) PDF
- [ ] Create `backend/ingest.py`:
  - [ ] Load PDF using LangChain
  - [ ] Chunk text (500-1000 tokens)
  - [ ] Generate embeddings using Gemini
  - [ ] Upsert vectors to Supabase

- [ ] Create sample ingestion script structure:
  ```python
  from langchain.document_loaders import PyPDFLoader
  from langchain.text_splitter import RecursiveCharacterTextSplitter
  from supabase import create_client
  import google.generativeai as genai
  
  # Load, chunk, embed, and store
  ```

### 4. Auth Integration

- [ ] **Backend:** Create auth middleware
  - [ ] Verify Supabase JWT tokens
  - [ ] Extract user_id from token
  - [ ] Protect endpoints

- [ ] **Frontend:** Create auth context
  - [ ] Sign up component
  - [ ] Login component
  - [ ] Protected routes
  - [ ] Session management

## Phase 1 Deliverables

✅ Working dev environment  
✅ Supabase project with auth enabled  
✅ Database schema created  
✅ Legal data ingested and searchable  
✅ Users can sign up and login  
✅ Test RAG query returns relevant laws

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend connects to backend
- [ ] User can sign up with email/password
- [ ] User can login and receive token
- [ ] Protected API endpoint rejects unauthenticated requests
- [ ] RAG query returns top 3 relevant legal sections
- [ ] Database tables created successfully
