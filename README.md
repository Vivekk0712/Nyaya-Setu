# Nyaya-Setu: The Autonomous Public Defender

An autonomous, multi-agent legal defense system that translates complex government legalese into simple dialects, drafts formal legal filings (FIRs/Consumer Complaints) mapped to the new BNS laws, and proactively nudges government departments until justice is served.

## The Problem

Millions of Indian citizens face legal issues but cannot afford lawyers. Complex legal language, expensive legal services, and slow government response times create barriers to justice.

## The Solution

Nyaya-Setu uses AI-powered multi-agent architecture to:
- Interpret legal issues in simple language
- Draft formal legal documents mapped to BNS laws
- Automatically follow up with authorities

## Architecture

### Multi-Agent System

**Agent 1: Interpreter & Intake Agent**
- Accepts user incident in any language
- Uses RAG (Retrieval-Augmented Generation) with Supabase pgvector
- Retrieves relevant BNS legal sections
- Explains violations in simple terms

**Agent 2: Drafting & Filing Agent**
- Fetches verified user identity (DigiLocker integration)
- Generates formal FIR/complaint using Gemini 2.5 Pro
- Creates downloadable PDF documents
- Maps to specific BNS sections

**Agent 3: Advisory Nudge Agent**
- Tracks case status automatically
- Sends follow-up nudges after 7 days
- Escalates to higher authorities
- Maintains timeline of actions

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** Supabase (PostgreSQL + pgvector)
- **Auth:** Supabase Auth
- **AI:** Gemini 2.5 Pro
- **Document Generation:** reportlab

## Project Structure

```
nyaya-setu/
├── backend/
│   ├── agents/
│   │   ├── interpreter.py    # Agent 1: RAG + Legal interpretation
│   │   ├── drafter.py         # Agent 2: Document generation
│   │   └── advisor.py         # Agent 3: Automated nudges
│   ├── database/
│   │   └── schema.sql         # Supabase schema
│   ├── main.py                # FastAPI application
│   ├── ingest.py              # Legal data ingestion script
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── auth/          # Auth components
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewCase.jsx
│   │   │   └── CaseDetail.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── supabase.js
│   │   └── App.jsx
│   └── package.json
├── docs/
│   ├── whatitis.md
│   ├── architecture.md
│   └── implementation.md
└── implementation-plan/
    ├── Phase1_Foundation.md
    ├── Phase2_Backend_Agents.md
    ├── Phase3_Frontend_UI.md
    └── Phase4_Integration_Testing.md
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- Supabase account
- Gemini API key

### Backend Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

4. Set up Supabase:
- Create new project at supabase.com
- Run the SQL in `backend/database/schema.sql`
- Enable pgvector extension

5. Ingest legal data (optional):
```bash
python ingest.py
```

6. Run backend:
```bash
python main.py
```

Backend will run at http://localhost:8000

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

3. Run frontend:
```bash
npm run dev
```

Frontend will run at http://localhost:5173

## Usage

### For Users

1. Sign up for an account
2. Describe your legal issue in plain language
3. Review AI interpretation and relevant laws
4. Generate formal legal draft
5. Download PDF and file with authorities
6. Track case status and automatic follow-ups

### For Admins

1. Login with admin account
2. Navigate to Admin Portal
3. Upload legal documents (PDFs)
4. System automatically processes and embeds documents
5. View statistics and manage documents

See [ADMIN_SETUP.md](ADMIN_SETUP.md) for detailed admin portal documentation.

## Features

- Multi-language support (Hindi, English, regional languages)
- RAG-powered legal section retrieval
- Automatic BNS law mapping
- Professional PDF generation
- Case tracking dashboard
- Automated nudge system
- Timeline visualization
- **Admin portal for document management**
- **Automatic document processing and embedding**

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## Implementation Phases

See the `implementation-plan/` folder for detailed phase-by-phase implementation guide:
- Phase 1: Foundation & Data Setup
- Phase 2: Backend & Multi-Agent Logic
- Phase 3: Frontend & User Experience
- Phase 4: Integration, Testing & Deployment

## Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication
- No PII stored permanently
- Secure API key management

## Future Enhancements

- Real DigiLocker integration
- E-Courts API integration
- SMS notifications
- Voice input support
- Mobile app
- Multi-language UI

## Contributing

This is a hackathon project. Contributions welcome!

## License

MIT License

## Team

Built with passion for democratizing access to justice in India.
