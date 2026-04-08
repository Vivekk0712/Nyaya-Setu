# Nyaya-Setu Setup Summary

Complete overview of the project setup and what you need to get started.

## What We've Built

A complete autonomous legal defense system with:

✅ **Multi-Agent AI System** (3 specialized agents)
✅ **RAG-powered legal knowledge base** (Supabase pgvector)
✅ **User authentication** (Supabase Auth with JWT)
✅ **Admin portal** (Document upload and management)
✅ **Case management** (Track legal cases end-to-end)
✅ **Automated follow-ups** (Nudge system)
✅ **PDF generation** (Professional legal documents)
✅ **Responsive UI** (React + Tailwind CSS)

## Quick Setup Checklist

### 1. Prerequisites
- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Gemini API key obtained

### 2. Supabase Setup
- [ ] Create new Supabase project
- [ ] Run SQL schema from `backend/database/schema.sql`
- [ ] Copy Project URL
- [ ] Copy anon/public key
- [ ] Copy JWT Secret (Settings → API → JWT Settings)

### 3. Backend Setup
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Create `.env` file with all 4 credentials:
  - SUPABASE_URL
  - SUPABASE_KEY
  - SUPABASE_JWT_SECRET ← **Important!**
  - GEMINI_API_KEY
- [ ] Run: `python main.py`
- [ ] Verify at http://localhost:8000

### 4. Frontend Setup
- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file with 3 variables:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_API_BASE_URL
- [ ] Run: `npm run dev`
- [ ] Verify at http://localhost:5173

### 5. Create Admin User (Optional)
- [ ] Sign up a user through the app
- [ ] Get user ID from Supabase dashboard
- [ ] Run SQL: `INSERT INTO admin_users (user_id) VALUES ('user-id-here');`
- [ ] Access admin portal at `/admin`

## Required Environment Variables

### Backend (4 variables)
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-super-secret-jwt-secret
GEMINI_API_KEY=AIzaSy...
```

### Frontend (3 variables)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=http://localhost:8000
```

## Where to Find Credentials

### Supabase Credentials
1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Find:
   - **Project URL**: Top of the page
   - **anon/public key**: Under "Project API keys"
   - **JWT Secret**: Scroll down to "JWT Settings" section

### Gemini API Key
1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create new API key
4. Copy the key

## Project Structure

```
nyaya-setu/
├── backend/          # FastAPI + Python
│   ├── agents/       # 3 AI agents
│   ├── admin/        # Admin portal backend
│   ├── database/     # SQL schemas
│   ├── main.py       # API server
│   └── auth.py       # JWT verification
│
├── frontend/         # React + Vite
│   └── src/
│       ├── pages/    # UI pages
│       ├── components/  # Reusable components
│       └── services/    # API layer
│
└── docs/            # Documentation
```

## Key Features

### For Users
1. **Sign up/Login** - Secure authentication
2. **Describe incident** - In plain language
3. **Get AI analysis** - Relevant laws identified
4. **Generate draft** - Professional legal document
5. **Download PDF** - Ready to file
6. **Track case** - Status and timeline
7. **Auto follow-ups** - System sends nudges

### For Admins
1. **Upload documents** - PDF legal texts
2. **Auto processing** - Chunking and embedding
3. **View statistics** - System metrics
4. **Manage documents** - Delete old versions
5. **Monitor system** - Track usage

## Technology Stack

**Backend:**
- FastAPI (Python web framework)
- Supabase (PostgreSQL + pgvector)
- Gemini 2.5 Pro (AI model)
- PyJWT (Token verification)
- reportlab (PDF generation)

**Frontend:**
- React 18 (UI framework)
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router (Navigation)
- Supabase JS (Auth client)

## Documentation Files

- **README.md** - Main documentation
- **QUICKSTART.md** - 10-minute setup guide
- **AUTHENTICATION.md** - Auth configuration guide
- **ADMIN_SETUP.md** - Admin portal guide
- **ADMIN_PORTAL_FEATURES.md** - Admin features
- **PROJECT_STRUCTURE.md** - File organization
- **SETUP_SUMMARY.md** - This file

## Common Issues & Solutions

### "Invalid token" error
**Problem**: JWT secret not configured
**Solution**: Add `SUPABASE_JWT_SECRET` to backend `.env`

### "Module not found" error
**Problem**: Dependencies not installed
**Solution**: Run `pip install -r requirements.txt` or `npm install`

### "Connection refused" error
**Problem**: Backend not running
**Solution**: Start backend with `python main.py`

### "CORS error" in browser
**Problem**: Frontend can't reach backend
**Solution**: Verify `VITE_API_BASE_URL=http://localhost:8000`

### Admin portal not accessible
**Problem**: User not in admin_users table
**Solution**: Run SQL to add user to admin_users

## Testing the Setup

### 1. Test Backend
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"healthy","service":"nyaya-setu"}
```

### 2. Test Frontend
Open http://localhost:5173 - should see landing page

### 3. Test Auth
1. Sign up with email/password
2. Should redirect to dashboard
3. Create a new case
4. Should see AI interpretation

### 4. Test Admin (if configured)
1. Login with admin user
2. Click "Admin Portal" button
3. Upload a test PDF
4. Should process successfully

## Next Steps

1. **Upload Legal Documents**
   - Get BNS PDF
   - Upload via admin portal
   - Wait for processing

2. **Test User Flow**
   - Create test case
   - Generate draft
   - Download PDF

3. **Customize**
   - Edit AI prompts in `backend/agents/`
   - Modify UI in `frontend/src/pages/`
   - Add new features

4. **Deploy** (Optional)
   - Backend: Railway, Render
   - Frontend: Vercel, Netlify
   - Database: Already on Supabase

## Development Workflow

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Database
# Use Supabase dashboard for SQL queries
```

## Security Notes

- ✅ JWT tokens for authentication
- ✅ Row Level Security (RLS) on database
- ✅ Admin verification middleware
- ✅ Environment variables for secrets
- ✅ CORS configuration
- ✅ Input validation

## Performance Notes

- Document processing: 2-5 minutes for 100 pages
- AI response time: 5-10 seconds
- PDF generation: 1-2 seconds
- Database queries: <100ms

## Support & Resources

**Documentation:**
- Read all .md files in root directory
- Check `docs/` folder for architecture
- Review `implementation-plan/` for phases

**Debugging:**
- Check backend console for errors
- Check browser console for frontend errors
- Review Supabase logs
- Test API with curl/Postman

**Community:**
- GitHub Issues (if public repo)
- Team communication channels
- Supabase community
- FastAPI documentation

## Deployment Checklist

When ready to deploy:

- [ ] Update CORS origins for production domain
- [ ] Set production environment variables
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Create backup strategy
- [ ] Document deployment process
- [ ] Test in production environment

## Success Criteria

You're ready when:

✅ Backend runs without errors
✅ Frontend loads and looks good
✅ Can sign up and login
✅ Can create a case
✅ AI returns interpretation
✅ Can generate PDF
✅ Dashboard shows cases
✅ Admin portal works (if configured)

## Congratulations!

You now have a fully functional autonomous legal defense system. Start by creating your first case and exploring the features!

For detailed guides, refer to the specific documentation files listed above.
