# Agent 1: Interpreter Agent - Implementation Guide

## Overview
The Interpreter Agent is the first AI agent in the Nyaya-Setu system. It provides an interactive chat interface where users can describe their legal issues in plain language, and the agent identifies relevant laws and guides them through the process.

## What We've Implemented

### Backend Components

#### 1. Enhanced Interpreter Agent (`backend/agents/interpreter.py`)

**Key Features:**
- **Interactive Chat Sessions**: Maintains conversation context per user
- **RAG Integration**: Retrieves relevant legal sections from vector database
- **Multi-language Support**: Can respond in English, Hindi, or other languages
- **Smart Detection**: Identifies when clarification is needed or when ready to draft
- **Conversation Summarization**: Can summarize the entire conversation for case filing

**Main Methods:**
```python
# Interactive chat with context
async def chat(user_id, message, case_id, language)

# Retrieve relevant laws using vector search
async def retrieve_relevant_laws(query, top_k=3)

# Legacy method for one-shot interpretation
async def interpret_incident(incident, language)

# Summarize conversation for drafting
async def summarize_conversation(user_id, case_id)

# Clear chat session
def clear_chat_session(user_id, case_id)
```

#### 2. New API Endpoints (`backend/main.py`)

**Chat Endpoint:**
```
POST /api/chat
Body: {
  "message": "My landlord locked my shop",
  "case_id": "optional-case-id",
  "language": "en"
}
Response: {
  "message": "AI response",
  "relevant_laws": ["BNS 126(2)", "BNS 316"],
  "needs_clarification": false,
  "ready_to_draft": true
}
```

**Additional Endpoints:**
- `POST /api/chat/clear` - Clear chat session
- `GET /api/chat/summary` - Get conversation summary
- `POST /api/intake` - Legacy one-shot interpretation (kept for compatibility)

### Frontend Components

#### 1. Enhanced ChatPanel (`frontend/src/components/ChatPanel.jsx`)

**Features:**
- Real-time chat with AI agent
- Message history with bot/user avatars
- Loading states with animated dots
- Display relevant legal sections as badges
- Auto-scroll to latest message
- Case ID tracking
- Callbacks for case creation and draft readiness

**Props:**
```javascript
<ChatPanel 
  caseId={currentCaseId}
  onCaseCreated={(caseId) => {}}
  onReadyToDraft={(caseId) => {}}
/>
```

#### 2. Updated NewCase Page (`frontend/src/pages/NewCase.jsx`)

**Features:**
- Manages case state across chat and document panels
- Handles case creation callback
- Switches to document view when ready to draft
- Responsive layout (split-view desktop, tabs mobile)

## How It Works

### User Flow

1. **User Opens New Case Page**
   - ChatPanel loads with welcome message
   - No case ID yet

2. **User Describes Issue**
   ```
   User: "My landlord locked my shop without notice and kept my deposit"
   ```

3. **Agent Processes Message**
   - Generates embedding of user message
   - Queries vector database for relevant BNS sections
   - Sends context + message to Gemini
   - Returns empathetic response with legal explanation

4. **Agent Response**
   ```
   Bot: "I understand your situation. This appears to be a violation of:
   - BNS Section 126(2): Wrongful Restraint
   - BNS Section 316: Criminal Breach of Trust
   
   Your landlord cannot lock your premises without proper legal notice.
   Would you like me to help you draft a formal complaint?"
   ```

5. **Conversation Continues**
   - Agent asks clarifying questions if needed
   - User provides more details
   - Agent maintains context throughout

6. **Ready to Draft**
   - When agent determines enough information is gathered
   - Sets `ready_to_draft: true`
   - Frontend can switch to document panel
   - Case is created in database

### Technical Flow

```
User Input
    ↓
ChatPanel.handleSend()
    ↓
POST /api/chat
    ↓
InterpreterAgent.chat()
    ↓
retrieve_relevant_laws() → Vector Search
    ↓
Gemini API (with context)
    ↓
Response with legal analysis
    ↓
Create case if first message
    ↓
Return to frontend
    ↓
Display in ChatPanel
```

## Database Schema

The agent uses the `cases` table:

```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  incident_description TEXT,
  legal_sections TEXT[],
  status TEXT, -- 'intake', 'drafted', 'filed', 'resolved'
  conversation_summary TEXT,
  draft_content TEXT,
  pdf_url TEXT,
  filed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing the Agent

### 1. Start Backend
```bash
cd backend
python main.py
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Scenarios

**Scenario 1: Simple Complaint**
```
User: "My neighbor plays loud music at night"
Expected: Agent identifies noise pollution laws, asks for details
```

**Scenario 2: Complex Issue**
```
User: "My boss didn't pay salary for 3 months and threatened me"
Expected: Agent identifies labor law violations, asks for employment details
```

**Scenario 3: Consumer Complaint**
```
User: "I bought a defective phone and shop refuses refund"
Expected: Agent identifies Consumer Protection Act sections
```

## Configuration

### Environment Variables Required

```env
# Backend (.env)
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

### Frontend API Configuration

```javascript
// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:8000';
```

## Next Steps

### Phase 2: Drafting Agent
- Integrate with DigiLocker for KYC
- Generate formal FIR/complaint documents
- Create PDF with proper legal formatting
- Add e-signature support

### Phase 3: Advisory Agent
- Implement case tracking
- Set up automated nudge system
- Email integration for follow-ups
- Status update notifications

### Enhancements
- Voice input support (Web Speech API)
- Multi-language UI (i18n)
- Conversation export
- Legal document templates
- Case history search

## Troubleshooting

### Common Issues

**1. Chat not responding**
- Check backend is running on port 8000
- Verify GEMINI_API_KEY is set
- Check browser console for errors

**2. No relevant laws found**
- Ensure legal documents are ingested into vector DB
- Check Supabase connection
- Verify `match_legal_documents` function exists

**3. Case not created**
- Check authentication token is valid
- Verify cases table exists in Supabase
- Check backend logs for errors

**4. CORS errors**
- Ensure frontend URL is in CORS allowed origins
- Check API_BASE_URL in frontend config

## Performance Considerations

- Chat sessions are stored in memory (consider Redis for production)
- Vector search is optimized with pgvector indexes
- Gemini API has rate limits (implement retry logic)
- Consider caching common queries

## Security Notes

- All endpoints require authentication
- User can only access their own cases
- Chat sessions are isolated per user
- No PII stored in vector embeddings
- Conversation history can be cleared

## Success Metrics

Track these metrics to measure agent performance:
- Average conversation length before draft
- Accuracy of law identification
- User satisfaction ratings
- Time to case creation
- Clarification request rate

---

## Quick Start Commands

```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install

# Run backend
cd backend
python main.py

# Run frontend (new terminal)
cd frontend
npm run dev

# Test the chat
# 1. Login at http://localhost:5173
# 2. Navigate to "New Case"
# 3. Start chatting with the AI agent
```

The Interpreter Agent is now fully functional and ready to help users understand their legal rights!
