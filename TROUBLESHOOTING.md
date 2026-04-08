# Troubleshooting Guide

Common issues and solutions for Nyaya-Setu.

## Installation Issues

### Supabase SDK Proxy Error

**Error:**
```
TypeError: Client.__init__() got an unexpected keyword argument 'proxy'
```

**Cause:** Version conflict in Supabase Python SDK dependencies.

**Solution 1 - Update Dependencies:**
```bash
cd backend
pip uninstall supabase -y
pip install supabase==2.4.0 httpx==0.26.0
```

**Solution 2 - Use Custom Client:**
The application now automatically falls back to a custom database client if the Supabase SDK fails. Just run:
```bash
python main.py
```

You should see:
```
Warning: Supabase SDK failed to load: ...
Using custom database client instead...
```

**Solution 3 - Fresh Install:**
```bash
# Delete virtual environment
rm -rf venv  # or rmdir /s venv on Windows

# Create new environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt
```

### Module Not Found Errors

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

### Python Version Issues

**Error:**
```
SyntaxError: invalid syntax
```

**Cause:** Python version too old.

**Solution:**
Check Python version:
```bash
python --version
```

Must be Python 3.9 or higher. Upgrade if needed.

## Runtime Issues

### Port Already in Use

**Error:**
```
OSError: [Errno 48] Address already in use
```

**Solution:**

**Windows:**
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:8000 | xargs kill -9
```

Or change the port in main.py:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Environment Variables Not Loaded

**Error:**
```
TypeError: 'NoneType' object is not subscriptable
```

**Cause:** Missing .env file or variables.

**Solution:**
1. Copy `.env.example` to `.env`
2. Fill in all required values:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=your-secret
GEMINI_API_KEY=AIzaSy...
```

### Invalid JWT Token

**Error:**
```
HTTPException: Invalid token
```

**Solutions:**

1. **Check JWT Secret:**
```python
# In backend, add debug print
import os
print(f"JWT Secret loaded: {bool(os.getenv('SUPABASE_JWT_SECRET'))}")
```

2. **Verify Token Format:**
Token should be in format: `Bearer eyJhbGc...`

3. **Check Token Expiration:**
Tokens expire after 1 hour. Try logging in again.

4. **Verify Supabase Project:**
Ensure JWT secret matches your Supabase project.

### Database Connection Errors

**Error:**
```
HTTPException: 404 Not Found
```

**Solutions:**

1. **Check Supabase URL:**
```bash
curl https://your-project.supabase.co/rest/v1/
```

2. **Verify API Key:**
Go to Supabase Dashboard → Settings → API

3. **Check RLS Policies:**
Ensure Row Level Security policies are created.

4. **Test Connection:**
```python
# In Python
from supabase import create_client
client = create_client("your-url", "your-key")
print(client.table('cases').select('*').execute())
```

## Frontend Issues

### CORS Errors

**Error:**
```
Access to fetch at 'http://localhost:8000' has been blocked by CORS policy
```

**Solution:**

1. **Check Backend is Running:**
```bash
curl http://localhost:8000/api/health
```

2. **Verify CORS Configuration:**
In `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Must match frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

3. **Check Frontend URL:**
Ensure frontend is running on http://localhost:5173

### Supabase Auth Errors

**Error:**
```
Invalid API key
```

**Solution:**

1. **Check .env File:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

2. **Restart Dev Server:**
```bash
npm run dev
```

Environment variables only load on startup.

3. **Verify Keys:**
Go to Supabase Dashboard → Settings → API

### Build Errors

**Error:**
```
npm ERR! code ELIFECYCLE
```

**Solution:**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for clean install
npm ci
```

## Admin Portal Issues

### Admin Access Denied

**Error:**
```
403 Forbidden: Admin access required
```

**Solution:**

1. **Add User to Admin Table:**
```sql
-- Get user ID from Supabase Dashboard → Authentication → Users
INSERT INTO admin_users (user_id) 
VALUES ('paste-user-uuid-here');
```

2. **Verify Admin Status:**
```bash
curl http://localhost:8000/api/admin/check \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return: `{"is_admin": true}`

### Document Upload Fails

**Error:**
```
500 Internal Server Error
```

**Solutions:**

1. **Check File Type:**
Only PDF files are supported.

2. **Check File Size:**
Large files (>50MB) may timeout. Try smaller files first.

3. **Check Gemini API:**
```python
import google.generativeai as genai
genai.configure(api_key="your-key")
# Test embedding
result = genai.embed_content(
    model="models/text-embedding-004",
    content="test"
)
print(result)
```

4. **Check Disk Space:**
Ensure sufficient space for temp files.

5. **Check Permissions:**
```bash
mkdir temp_uploads
chmod 755 temp_uploads
```

## Database Issues

### Table Not Found

**Error:**
```
relation "cases" does not exist
```

**Solution:**

Run the schema in Supabase SQL Editor:
```bash
# Copy contents of backend/database/schema.sql
# Paste into Supabase Dashboard → SQL Editor
# Click Run
```

### RLS Policy Errors

**Error:**
```
new row violates row-level security policy
```

**Solution:**

Check RLS policies are created:
```sql
-- View policies
SELECT * FROM pg_policies WHERE tablename = 'cases';

-- Recreate if missing
CREATE POLICY "Users can insert own cases" ON cases
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### pgvector Extension Missing

**Error:**
```
type "vector" does not exist
```

**Solution:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## API Issues

### Gemini API Errors

**Error:**
```
google.api_core.exceptions.PermissionDenied: 403
```

**Solutions:**

1. **Check API Key:**
```bash
echo $GEMINI_API_KEY
```

2. **Verify API is Enabled:**
Go to https://ai.google.dev/ and check API status.

3. **Check Quota:**
You may have exceeded free tier limits.

4. **Test API:**
```python
import google.generativeai as genai
genai.configure(api_key="your-key")
model = genai.GenerativeModel('gemini-2.0-flash-exp')
response = model.generate_content("Hello")
print(response.text)
```

### Rate Limiting

**Error:**
```
429 Too Many Requests
```

**Solution:**

Add delays between requests or implement rate limiting:
```python
import time
time.sleep(1)  # Wait 1 second between requests
```

## Performance Issues

### Slow Document Processing

**Symptoms:** Upload takes >10 minutes

**Solutions:**

1. **Reduce Chunk Size:**
In `document_processor.py`:
```python
chunks = self.chunk_text(text, chunk_size=500)  # Smaller chunks
```

2. **Batch Embeddings:**
Process multiple chunks at once (future enhancement).

3. **Use Smaller Documents:**
Split large PDFs into smaller files.

### Slow API Responses

**Symptoms:** Requests take >30 seconds

**Solutions:**

1. **Check Gemini API:**
May be slow during peak times.

2. **Optimize Database Queries:**
Add indexes if needed.

3. **Use Caching:**
Cache frequently accessed data.

## Debugging Tips

### Enable Debug Logging

**Backend:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend:**
```javascript
console.log('Debug:', variable)
```

### Check Logs

**Backend:**
```bash
python main.py 2>&1 | tee backend.log
```

**Frontend:**
Open browser DevTools → Console

### Test API with curl

```bash
# Health check
curl http://localhost:8000/api/health

# With auth
curl http://localhost:8000/api/cases \
  -H "Authorization: Bearer YOUR_TOKEN"

# POST request
curl -X POST http://localhost:8000/api/intake \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"incident_description":"test","language":"en"}'
```

### Verify Environment

```bash
# Backend
cd backend
python -c "import sys; print(sys.version)"
python -c "import fastapi; print(fastapi.__version__)"
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(bool(os.getenv('SUPABASE_URL')))"

# Frontend
cd frontend
node --version
npm --version
cat .env
```

## Getting Help

If issues persist:

1. **Check Documentation:**
   - README.md
   - QUICKSTART.md
   - AUTHENTICATION.md
   - ADMIN_SETUP.md

2. **Review Logs:**
   - Backend console output
   - Browser console
   - Supabase logs

3. **Test Components:**
   - Test backend alone
   - Test frontend alone
   - Test database connection
   - Test API keys

4. **Search Issues:**
   - Check GitHub issues (if public)
   - Search error messages
   - Check Supabase docs
   - Check FastAPI docs

5. **Ask for Help:**
   - Provide error messages
   - Share relevant code
   - Describe what you tried
   - Include environment details

## Quick Fixes Checklist

- [ ] Virtual environment activated
- [ ] Dependencies installed
- [ ] .env files created and filled
- [ ] Supabase project created
- [ ] Database schema run
- [ ] API keys valid
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] No CORS errors
- [ ] Can sign up/login
- [ ] JWT secret configured

If all checked and still issues, review specific error messages above.
