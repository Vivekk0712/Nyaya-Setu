# Nyaya-Setu Project Structure

Complete file structure and organization of the Nyaya-Setu project.

## Root Directory

```
nyaya-setu/
├── .editorconfig              # Editor configuration for consistent coding style
├── .gitattributes             # Git attributes for line endings and file types
├── .gitignore                 # Root gitignore file
├── .dockerignore              # Docker ignore patterns
├── README.md                  # Main project documentation
├── QUICKSTART.md              # Quick start guide
├── ADMIN_SETUP.md             # Admin portal setup guide
├── ADMIN_PORTAL_FEATURES.md   # Admin portal feature documentation
├── PROJECT_STRUCTURE.md       # This file
│
├── docs/                      # Project documentation
│   ├── whatitis.md           # Project concept and pitch
│   ├── architecture.md       # System architecture
│   └── implementation.md     # Implementation details
│
├── implementation-plan/       # Phase-by-phase implementation guide
│   ├── README.md             # Implementation plan overview
│   ├── User_Stories.md       # Complete user stories
│   ├── Phase1_Foundation.md  # Phase 1: Foundation & Data Setup
│   ├── Phase2_Backend_Agents.md  # Phase 2: Backend & Multi-Agent Logic
│   ├── Phase3_Frontend_UI.md     # Phase 3: Frontend & User Experience
│   └── Phase4_Integration_Testing.md  # Phase 4: Integration & Testing
│
├── backend/                   # Backend application (FastAPI)
│   ├── .gitignore            # Backend-specific gitignore
│   ├── .dockerignore         # Backend Docker ignore
│   ├── .env.example          # Environment variables template
│   ├── requirements.txt      # Python dependencies
│   ├── main.py               # FastAPI application entry point
│   ├── auth.py               # JWT authentication utilities
│   ├── ingest.py             # Legal data ingestion script
│   ├── make_admin.py         # Admin user creation helper
│   │
│   ├── agents/               # Multi-agent system
│   │   ├── __init__.py
│   │   ├── interpreter.py    # Agent 1: Interpreter & Intake
│   │   ├── drafter.py        # Agent 2: Drafting & Filing
│   │   └── advisor.py        # Agent 3: Advisory Nudge
│   │
│   ├── admin/                # Admin portal backend
│   │   ├── __init__.py
│   │   ├── README.md         # Admin module documentation
│   │   ├── middleware.py     # Admin authentication middleware
│   │   └── document_processor.py  # Document processing logic
│   │
│   └── database/             # Database schemas and migrations
│       └── schema.sql        # Supabase database schema
│
└── frontend/                  # Frontend application (React + Vite)
    ├── .gitignore            # Frontend-specific gitignore
    ├── .dockerignore         # Frontend Docker ignore
    ├── .env.example          # Environment variables template
    ├── package.json          # Node.js dependencies
    ├── vite.config.js        # Vite configuration
    ├── tailwind.config.js    # Tailwind CSS configuration
    ├── postcss.config.js     # PostCSS configuration
    ├── index.html            # HTML entry point
    │
    └── src/                  # Source code
        ├── main.jsx          # React entry point
        ├── App.jsx           # Main App component with routing
        ├── index.css         # Global styles
        │
        ├── components/       # Reusable components
        │   └── auth/         # Authentication components
        │       ├── Login.jsx
        │       ├── SignUp.jsx
        │       └── ProtectedRoute.jsx
        │
        ├── contexts/         # React contexts
        │   └── AuthContext.jsx  # Authentication context
        │
        ├── pages/            # Page components
        │   ├── Landing.jsx   # Landing page
        │   ├── Dashboard.jsx # User dashboard
        │   ├── NewCase.jsx   # New case creation
        │   ├── CaseDetail.jsx  # Case detail view
        │   └── AdminPortal.jsx  # Admin portal
        │
        └── services/         # API and service layers
            ├── supabase.js   # Supabase client
            └── api.js        # API service methods
```

## File Descriptions

### Root Level Files

**Configuration Files:**
- `.editorconfig` - Ensures consistent coding style across editors
- `.gitattributes` - Defines Git attributes for line endings
- `.gitignore` - Specifies files to ignore in Git
- `.dockerignore` - Specifies files to ignore in Docker builds

**Documentation:**
- `README.md` - Main project documentation with setup instructions
- `QUICKSTART.md` - 10-minute quick start guide
- `AUTHENTICATION.md` - Complete authentication guide
- `ADMIN_SETUP.md` - Admin portal setup and usage
- `ADMIN_PORTAL_FEATURES.md` - Detailed admin features
- `PROJECT_STRUCTURE.md` - This file

### Backend Structure

**Root Files:**
- `main.py` - FastAPI application with all routes
- `auth.py` - JWT token verification and authentication utilities
- `ingest.py` - Script to ingest legal documents
- `make_admin.py` - Helper to create admin users
- `requirements.txt` - Python package dependencies
- `.env.example` - Template for environment variables

**agents/ Directory:**
Contains the three AI agents that power the system:
- `interpreter.py` - Interprets user incidents and retrieves laws
- `drafter.py` - Generates formal legal documents
- `advisor.py` - Sends automated follow-up nudges

**admin/ Directory:**
Admin portal backend functionality:
- `middleware.py` - Authentication and authorization
- `document_processor.py` - PDF processing and embedding
- `README.md` - Technical documentation

**database/ Directory:**
- `schema.sql` - Complete Supabase database schema

### Frontend Structure

**Root Files:**
- `package.json` - Node.js dependencies and scripts
- `vite.config.js` - Vite bundler configuration
- `tailwind.config.js` - Tailwind CSS theme
- `postcss.config.js` - PostCSS configuration
- `index.html` - HTML entry point
- `.env.example` - Template for environment variables

**src/ Directory:**
- `main.jsx` - React application entry point
- `App.jsx` - Main component with routing
- `index.css` - Global styles with Tailwind

**components/ Directory:**
Reusable React components organized by feature:
- `auth/` - Authentication components

**contexts/ Directory:**
React Context providers:
- `AuthContext.jsx` - Authentication state management

**pages/ Directory:**
Full page components:
- `Landing.jsx` - Public landing page
- `Dashboard.jsx` - User dashboard
- `NewCase.jsx` - Case creation interface
- `CaseDetail.jsx` - Case detail view
- `AdminPortal.jsx` - Admin document management

**services/ Directory:**
Service layer for external interactions:
- `supabase.js` - Supabase client initialization
- `api.js` - API methods for backend communication

## Key Technologies by Directory

### Backend
- **Framework:** FastAPI
- **Database:** Supabase (PostgreSQL + pgvector)
- **AI:** Gemini 2.5 Pro
- **PDF Processing:** pypdf, reportlab
- **Scheduling:** APScheduler

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Auth:** Supabase Auth
- **HTTP:** Fetch API

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

## Ignored Files

Files and directories that are NOT tracked in Git:

**Python:**
- `__pycache__/`, `*.pyc` - Compiled Python files
- `venv/`, `env/` - Virtual environments
- `*.egg-info/` - Package metadata

**Node.js:**
- `node_modules/` - Dependencies
- `dist/`, `build/` - Build outputs

**Environment:**
- `.env`, `.env.local` - Environment variables

**Temporary:**
- `temp_uploads/` - Temporary file uploads
- `*.pdf` - Generated PDFs
- `*.log` - Log files

**IDE:**
- `.vscode/`, `.idea/` - Editor settings

## Adding New Features

### Adding a New Backend Route
1. Add route handler in `backend/main.py`
2. Create models if needed (Pydantic)
3. Add business logic in appropriate agent
4. Update API documentation

### Adding a New Frontend Page
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation links where needed
4. Update API service if needed

### Adding a New Agent
1. Create file in `backend/agents/`
2. Initialize in `backend/main.py`
3. Add endpoints for agent actions
4. Update frontend to use new endpoints

## Development Workflow

1. **Backend:** `cd backend && python main.py`
2. **Frontend:** `cd frontend && npm run dev`
3. **Database:** Managed via Supabase dashboard
4. **Testing:** Manual testing via browser and API tools

## Deployment Structure

For production deployment:
- Backend: Railway, Render, or similar
- Frontend: Vercel, Netlify, or similar
- Database: Supabase (already hosted)
- Environment: Separate .env files per environment

## Documentation Hierarchy

1. **README.md** - Start here for overview
2. **QUICKSTART.md** - Quick setup guide
3. **docs/** - Detailed architecture and concepts
4. **implementation-plan/** - Phase-by-phase guide
5. **ADMIN_SETUP.md** - Admin portal guide
6. **PROJECT_STRUCTURE.md** - This file

## Maintenance

Regular maintenance tasks:
- Update dependencies: `pip install -U` and `npm update`
- Clean temp files: Remove `temp_uploads/`
- Review logs: Check `*.log` files
- Database: Monitor Supabase usage
- API: Check Gemini API quota

## Contributing

When adding new files:
1. Follow existing directory structure
2. Update this document if adding new directories
3. Add appropriate .gitignore entries
4. Document in relevant README files
5. Follow naming conventions

## Naming Conventions

- **Python files:** `snake_case.py`
- **React components:** `PascalCase.jsx`
- **Directories:** `lowercase` or `kebab-case`
- **Constants:** `UPPER_SNAKE_CASE`
- **Functions:** `camelCase` (JS) or `snake_case` (Python)

## File Size Guidelines

- Keep components under 300 lines
- Split large files into modules
- Use separate files for complex logic
- Document large files thoroughly

---

This structure is designed for:
- Clear separation of concerns
- Easy navigation
- Scalable architecture
- Simple deployment
- Maintainable codebase
