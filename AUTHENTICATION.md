# Authentication Guide

This document explains how authentication works in Nyaya-Setu and how to configure it properly.

## Overview

Nyaya-Setu uses **Supabase Auth** for user authentication with JWT (JSON Web Tokens) for secure API access.

## Architecture

```
User → Frontend (React) → Supabase Auth → JWT Token
                              ↓
                         Backend (FastAPI)
                              ↓
                    JWT Verification (PyJWT)
                              ↓
                         Protected Routes
```

## Required Credentials

You need three Supabase credentials:

1. **SUPABASE_URL** - Your project URL
2. **SUPABASE_KEY** - Anon/public key (for client-side)
3. **SUPABASE_JWT_SECRET** - JWT secret (for server-side verification)

### Where to Find Them

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
   - **JWT Secret**: Found under "JWT Settings" section

## Configuration

### Backend (.env)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-super-secret-jwt-secret-here
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=http://localhost:8000
```

## How It Works

### 1. User Sign Up/Login (Frontend)

```javascript
// User signs up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// User logs in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

Supabase returns a JWT token stored in the session.

### 2. API Requests (Frontend)

```javascript
// Get current session token
const { data } = await supabase.auth.getSession()
const token = data.session?.access_token

// Send to backend
fetch('http://localhost:8000/api/cases', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### 3. Token Verification (Backend)

```python
# backend/auth.py
import jwt

def verify_jwt_token(token: str) -> dict:
    payload = jwt.decode(
        token,
        JWT_SECRET,
        algorithms=["HS256"]
    )
    return payload
```

### 4. Protected Routes (Backend)

```python
@app.get("/api/cases")
async def get_cases(user = Depends(get_current_user)):
    # user['id'] contains the authenticated user ID
    cases = supabase.table('cases').select('*').eq('user_id', user['id']).execute()
    return cases
```

## JWT Token Structure

A decoded JWT token contains:

```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "role": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490
}
```

- `sub`: User ID (subject)
- `email`: User's email
- `role`: User role (authenticated, anon)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

## Security Features

### 1. Token Expiration

Tokens expire after 1 hour by default. The frontend automatically refreshes them.

### 2. HTTPS in Production

Always use HTTPS in production to prevent token interception.

### 3. Row Level Security (RLS)

Database policies ensure users can only access their own data:

```sql
CREATE POLICY "Users can view own cases" ON cases
    FOR SELECT USING (auth.uid() = user_id);
```

### 4. Admin Verification

Admin routes check the `admin_users` table:

```python
async def require_admin(user_id: str, supabase: Client):
    response = supabase.table('admin_users').select('*').eq('user_id', user_id).execute()
    if not response.data:
        raise HTTPException(status_code=403, detail="Admin access required")
```

## Common Issues

### "Invalid token" Error

**Cause**: JWT secret mismatch or expired token

**Solution**:
1. Verify `SUPABASE_JWT_SECRET` matches your Supabase project
2. Check token hasn't expired
3. Ensure user is logged in

### "Missing authorization header" Error

**Cause**: Token not sent with request

**Solution**:
1. Check frontend is getting session token
2. Verify Authorization header is set
3. Ensure user is authenticated

### "Admin access required" Error

**Cause**: User not in admin_users table

**Solution**:
```sql
INSERT INTO admin_users (user_id) VALUES ('user-uuid-here');
```

## Testing Authentication

### 1. Test Sign Up

```bash
curl -X POST http://localhost:8000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Test Protected Route

```bash
# Get token from Supabase
TOKEN="your-jwt-token-here"

curl http://localhost:8000/api/cases \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Admin Route

```bash
curl http://localhost:8000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

## Best Practices

### 1. Never Commit Secrets

- Add `.env` to `.gitignore`
- Use `.env.example` for templates
- Use environment variables in production

### 2. Rotate JWT Secrets

Periodically rotate your JWT secret in Supabase settings.

### 3. Use HTTPS

Always use HTTPS in production to encrypt tokens in transit.

### 4. Implement Token Refresh

The frontend automatically refreshes tokens before expiration.

### 5. Validate on Backend

Always verify tokens on the backend, never trust the frontend.

## Token Lifecycle

```
1. User logs in
   ↓
2. Supabase generates JWT
   ↓
3. Frontend stores in session
   ↓
4. Frontend sends with each request
   ↓
5. Backend verifies signature
   ↓
6. Backend extracts user ID
   ↓
7. Backend processes request
   ↓
8. Token expires after 1 hour
   ↓
9. Frontend auto-refreshes
```

## Debugging

### Enable Debug Logging

```python
# backend/auth.py
import logging
logging.basicConfig(level=logging.DEBUG)

def verify_jwt_token(token: str):
    logging.debug(f"Verifying token: {token[:20]}...")
    # ... verification code
```

### Check Token Contents

```python
import jwt

token = "your-token-here"
decoded = jwt.decode(token, options={"verify_signature": False})
print(decoded)
```

### Verify JWT Secret

```python
import os
print(f"JWT Secret: {os.getenv('SUPABASE_JWT_SECRET')[:10]}...")
```

## Production Considerations

### 1. Environment Variables

Use secure environment variable management:
- Railway: Project settings
- Vercel: Environment variables
- Render: Environment tab

### 2. CORS Configuration

Update CORS origins for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Rate Limiting

Implement rate limiting on auth endpoints:

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/login")
@limiter.limit("5/minute")
async def login():
    # ... login logic
```

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [JWT.io](https://jwt.io/) - Decode and verify JWTs
- [PyJWT Docs](https://pyjwt.readthedocs.io/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)

## Support

If you encounter authentication issues:

1. Check all three credentials are correct
2. Verify JWT secret matches Supabase
3. Ensure user is logged in
4. Check browser console for errors
5. Review backend logs
6. Test with curl/Postman

For admin access issues, verify user is in `admin_users` table.
