# 🧠 Phase 2: Backend & Multi-Agent Logic

**Goal:** Build FastAPI server with three AI agents  
**Estimated Time:** 3 Hours

## User Stories

### US-2.1: As a user, I want to describe my legal issue in simple language
**Acceptance Criteria:**
- System accepts text input in any language
- System identifies relevant laws from BNS
- System explains violation in simple terms

### US-2.2: As a user, I want the system to draft a formal legal document
**Acceptance Criteria:**
- System generates FIR/complaint in proper legal format
- Document includes my verified identity details
- Document cites specific BNS sections
- PDF is downloadable

### US-2.3: As a user, I want automatic follow-ups if authorities don't respond
**Acceptance Criteria:**
- System tracks case status
- After 7 days, system sends nudge email
- User sees timeline of actions taken

## Technical Tasks

### 1. FastAPI Application Structure

- [ ] Create `backend/main.py` with FastAPI app
- [ ] Configure CORS for frontend communication
- [ ] Set up Supabase client
- [ ] Initialize Gemini API client
- [ ] Create auth dependency for protected routes

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
import google.generativeai as genai

app = FastAPI(title="Nyaya-Setu API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Agent 1: Interpreter & Intake Agent

**Endpoint:** `POST /api/intake`

- [ ] Create request/response models:
  ```python
  class IntakeRequest(BaseModel):
      incident_description: str
      language: str = "en"
  
  class IntakeResponse(BaseModel):
      simplified_explanation: str
      relevant_laws: List[str]
      case_id: str
  ```

- [ ] Implement RAG retrieval function:
  - [ ] Embed user query using Gemini
  - [ ] Query Supabase pgvector for top 3 matches
  - [ ] Return relevant legal sections

- [ ] Implement Gemini interpretation:
  - [ ] System prompt: "You are a legal interpreter for Indian citizens"
  - [ ] Include retrieved laws in context
  - [ ] Request simple language explanation
  - [ ] Identify violated sections

- [ ] Store case in database with status "intake"

### 3. Agent 2: Drafting & Filing Agent

**Endpoint:** `POST /api/generate-draft`

- [ ] Create request/response models:
  ```python
  class DraftRequest(BaseModel):
      case_id: str
      user_kyc: dict  # From DigiLocker or mock
  
  class DraftResponse(BaseModel):
      draft_text: str
      pdf_url: str
      case_id: str
  ```

- [ ] Mock DigiLocker KYC function:
  ```python
  def fetch_digilocker_kyc(user_id: str) -> dict:
      # Mock verified user data
      return {
          "name": "Sample User",
          "address": "123 Sample Street, City",
          "aadhaar_masked": "XXXX-XXXX-1234"
      }
  ```

- [ ] Implement formal drafting with Gemini:
  - [ ] System prompt: "Act as expert Indian legal drafter"
  - [ ] Include BNS sections and user KYC
  - [ ] Generate formal FIR/complaint format
  - [ ] Ensure legal terminology accuracy

- [ ] PDF Generation:
  - [ ] Use reportlab or pdfkit
  - [ ] Format with proper legal structure
  - [ ] Include headers, sections, signatures
  - [ ] Upload to Supabase Storage
  - [ ] Return public URL

- [ ] Update case status to "drafted"

### 4. Agent 3: Advisory Nudge Agent

**Background Task:** Runs daily via scheduler

- [ ] Set up APScheduler:
  ```python
  from apscheduler.schedulers.background import BackgroundScheduler
  
  scheduler = BackgroundScheduler()
  scheduler.add_job(check_pending_cases, 'interval', hours=24)
  scheduler.start()
  ```

- [ ] Implement nudge logic:
  - [ ] Query cases where:
    - status = "filed"
    - filed_at > 7 days ago
    - last_nudge_at is NULL or > 7 days ago
  
  - [ ] For each case:
    - [ ] Generate follow-up email with Gemini
    - [ ] Include original complaint number
    - [ ] Cite legal mandate for timely response
    - [ ] Send to mock authority email
    - [ ] Update last_nudge_at timestamp

- [ ] Create endpoint to manually trigger nudge:
  ```python
  @app.post("/api/nudge/{case_id}")
  async def manual_nudge(case_id: str, user=Depends(get_current_user)):
      # Trigger nudge for specific case
  ```

### 5. Additional Endpoints

- [ ] `GET /api/cases` - List user's cases
- [ ] `GET /api/cases/{case_id}` - Get case details
- [ ] `PATCH /api/cases/{case_id}/status` - Update case status
- [ ] `GET /api/health` - Health check endpoint

### 6. Error Handling & Validation

- [ ] Add try-catch blocks for all external API calls
- [ ] Validate user input (max length, sanitization)
- [ ] Handle Gemini API rate limits
- [ ] Handle Supabase connection errors
- [ ] Return meaningful error messages

## Phase 2 Deliverables

✅ FastAPI server with all endpoints  
✅ Agent 1: Interprets incidents and retrieves laws  
✅ Agent 2: Generates formal legal drafts as PDFs  
✅ Agent 3: Automated nudge system  
✅ Protected routes with auth  
✅ Error handling and validation

## Testing Checklist

- [ ] POST /api/intake returns simplified explanation
- [ ] RAG retrieves correct BNS sections
- [ ] POST /api/generate-draft creates valid PDF
- [ ] PDF includes user KYC and legal sections
- [ ] Background scheduler runs without errors
- [ ] Nudge emails generated after 7 days
- [ ] All endpoints require valid auth token
- [ ] Error responses are clear and helpful
- [ ] Test with Postman/Thunder Client
