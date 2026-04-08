# Alternative: Backend-Only Authentication

If you prefer not to expose Supabase credentials in the frontend, here's how to route all auth through your backend.

## Current Architecture (Recommended)

```
Frontend → Supabase Auth (Direct) → JWT Token
                                        ↓
                                   Backend verifies
```

## Alternative Architecture

```
Frontend → Backend → Supabase Auth → Backend → Frontend
```

## Implementation

### Backend Changes

Add auth endpoints to `backend/main.py`:

```python
from pydantic import BaseModel

class SignUpRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/signup")
async def signup(request: SignUpRequest):
    """Sign up new user"""
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        return {
            "user": response.user,
            "session": response.session
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Login user"""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        return {
            "user": response.user,
            "session": response.session,
            "access_token": response.session.access_token
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/logout")
async def logout(user = Depends(get_current_user)):
    """Logout user"""
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/auth/session")
async def get_session(authorization: str = Header(None)):
    """Get current session"""
    try:
        user = get_user_from_token(authorization)
        return {"user": user}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Not authenticated")
```

### Frontend Changes

Update `frontend/src/services/api.js`:

```javascript
export const auth = {
  signUp: async (email, password) => {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  },

  signIn: async (email, password) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    // Store token in localStorage
    localStorage.setItem('access_token', data.access_token)
    return data
  },

  signOut: async () => {
    const token = localStorage.getItem('access_token')
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    localStorage.removeItem('access_token')
  },

  getSession: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    
    const response = await fetch(`${API_BASE}/api/auth/session`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  }
}
```

Update `frontend/src/contexts/AuthContext.jsx`:

```javascript
import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    auth.getSession().then(data => {
      setUser(data?.user || null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const signUp = async (email, password) => {
    const data = await auth.signUp(email, password)
    setUser(data.user)
    return data
  }

  const signIn = async (email, password) => {
    const data = await auth.signIn(email, password)
    setUser(data.user)
    return data
  }

  const signOut = async () => {
    await auth.signOut()
    setUser(null)
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

### Frontend .env (Simplified)

```env
# No Supabase credentials needed!
VITE_API_BASE_URL=http://localhost:8000
```

## Pros and Cons

### Backend-Only Auth

**Pros:**
- ✅ No Supabase credentials in frontend
- ✅ Centralized auth logic
- ✅ Easier to add custom auth logic
- ✅ Can add rate limiting on auth endpoints

**Cons:**
- ❌ Extra backend hop (slower)
- ❌ More backend code to maintain
- ❌ Manual token refresh implementation
- ❌ Manual session management
- ❌ No real-time auth state updates

### Direct Supabase Auth (Current)

**Pros:**
- ✅ Faster (no backend hop)
- ✅ Automatic token refresh
- ✅ Built-in session management
- ✅ Less code to maintain
- ✅ Real-time auth updates
- ✅ Supabase's recommended approach

**Cons:**
- ❌ Supabase credentials in frontend (but anon key is safe!)

## Recommendation

**Stick with the current approach** (direct Supabase auth) because:

1. The anon key is designed to be public
2. RLS protects your data
3. Backend still verifies all tokens
4. It's faster and more maintainable
5. It's the standard Supabase pattern

## Security Note

Even with direct Supabase auth:
- ✅ Backend verifies every JWT token
- ✅ RLS policies protect database
- ✅ JWT secret stays private
- ✅ Users can only access their own data

The anon key alone cannot:
- ❌ Access other users' data (RLS prevents this)
- ❌ Bypass authentication (JWT required)
- ❌ Perform admin operations (admin table check)

## When to Use Backend-Only Auth

Consider backend-only auth if:
- You need custom auth logic (2FA, OAuth, etc.)
- You want to hide all Supabase details
- You need to log all auth attempts
- You're migrating from another auth system
- You have strict security requirements

## Conclusion

The current implementation (direct Supabase auth) is:
- ✅ Secure
- ✅ Fast
- ✅ Standard practice
- ✅ Recommended by Supabase

The anon key in the frontend is **not a security risk** when combined with:
- Row Level Security (RLS)
- Backend JWT verification
- Proper database policies
