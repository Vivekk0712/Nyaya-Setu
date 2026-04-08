"""
Nyaya-Setu API with Simple Custom Authentication
No Supabase Auth dependency
"""

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os
from dotenv import load_dotenv
import shutil
from datetime import datetime, timedelta

# Load environment variables FIRST
load_dotenv()

# Import our simple auth system
from auth_simple import (
    get_current_user,
    create_access_token,
    get_password_hash,
    verify_password
)

# Import database client
from database_client import create_client

# Initialize database client with service role key for write access
# Use SUPABASE_SERVICE_KEY if available, otherwise fall back to SUPABASE_KEY
db_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
db = create_client(
    os.getenv("SUPABASE_URL"),
    db_key
)

app = FastAPI(title="Nyaya-Setu API", version="2.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class IntakeRequest(BaseModel):
    incident_description: str
    language: str = "en"

class IntakeResponse(BaseModel):
    simplified_explanation: str
    relevant_laws: List[str]
    case_id: str

class DraftRequest(BaseModel):
    case_id: str
    user_kyc: dict

class DraftResponse(BaseModel):
    draft_text: str
    pdf_url: str
    case_id: str

class ChatRequest(BaseModel):
    message: str
    case_id: Optional[str] = None
    language: str = "en"

class ChatResponse(BaseModel):
    message: str
    relevant_laws: List[str]
    needs_clarification: bool
    ready_to_draft: bool

# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@app.post("/api/auth/signup", response_model=TokenResponse)
async def signup(request: SignUpRequest):
    """Register a new user"""
    try:
        # Check if user already exists
        existing = db.table('users').select('*').eq('email', request.email).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        password_hash = get_password_hash(request.password)
        
        # Create user
        user_data = {
            "email": request.email,
            "password_hash": password_hash,
            "full_name": request.full_name
        }
        
        result = db.table('users').insert(user_data)
        user = result.data[0] if isinstance(result.data, list) else result.data
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user['id'], "email": user['email'], "full_name": user.get('full_name')}
        )
        
        return TokenResponse(
            access_token=access_token,
            user={
                "id": user['id'],
                "email": user['email'],
                "full_name": user.get('full_name')
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login user"""
    try:
        # Get user by email
        result = db.table('users').select('*').eq('email', request.email).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        user = result.data[0] if isinstance(result.data, list) else result.data
        
        # Verify password
        if not verify_password(request.password, user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user['id'], "email": user['email'], "full_name": user.get('full_name')}
        )
        
        return TokenResponse(
            access_token=access_token,
            user={
                "id": user['id'],
                "email": user['email'],
                "full_name": user.get('full_name')
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return current_user

# ============================================================================
# CASE MANAGEMENT ENDPOINTS
# ============================================================================

@app.post("/api/intake", response_model=IntakeResponse)
async def intake_incident(request: IntakeRequest, current_user: dict = Depends(get_current_user)):
    """Agent 1: Interpret incident and retrieve relevant laws"""
    try:
        # For now, return mock data - you'll integrate the actual agents later
        result = {
            "explanation": f"Based on your description, this appears to be a legal violation. We're analyzing the relevant laws...",
            "relevant_laws": ["BNS Section 123", "BNS Section 456"]
        }
        
        # Create case in database - send as JSON array
        case_data = {
            "user_id": str(current_user['id']),
            "incident_description": request.incident_description,
            "legal_sections": result["relevant_laws"],  # Send as regular list
            "status": "intake"
        }
        
        print(f"Inserting case data: {case_data}")
        
        # Use raw HTTP request to see the actual error
        import httpx
        headers = {
            "apikey": db_key,
            "Authorization": f"Bearer {db_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{os.getenv('SUPABASE_URL')}/rest/v1/cases",
                json=case_data,
                headers=headers
            )
            
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
            
            if response.status_code >= 400:
                raise HTTPException(status_code=500, detail=f"Database error: {response.text}")
            
            result_data = response.json()
            case_id = result_data[0]['id'] if isinstance(result_data, list) else result_data['id']
        
        return IntakeResponse(
            simplified_explanation=result["explanation"],
            relevant_laws=result["relevant_laws"],
            case_id=case_id
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Intake error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cases")
async def get_cases(current_user: dict = Depends(get_current_user)):
    """Get all cases for current user"""
    try:
        response = db.table('cases').select('*').eq('user_id', current_user['id']).execute()
        return {"cases": response.data if response.data else []}
    except Exception as e:
        print(f"Get cases error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cases/{case_id}")
async def get_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific case details"""
    try:
        response = db.table('cases').select('*').eq('id', case_id).eq('user_id', current_user['id']).single()
        return response.data
    except Exception as e:
        print(f"Get case error: {e}")
        raise HTTPException(status_code=404, detail="Case not found")

@app.patch("/api/cases/{case_id}/status")
async def update_case_status(case_id: str, status: str, current_user: dict = Depends(get_current_user)):
    """Update case status"""
    try:
        update_data = {'status': status}
        if status == 'filed':
            update_data['filed_at'] = datetime.now().isoformat()
        
        response = db.table('cases').update(update_data).eq('id', case_id).eq('user_id', current_user['id'])
        return {"success": True, "case": response.data}
    except Exception as e:
        print(f"Update case error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# CHAT ENDPOINTS (Agent 1 - Interpreter)
# ============================================================================

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_interpreter(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """Interactive chat with the legal interpreter agent"""
    try:
        # Import interpreter agent
        try:
            from agents.interpreter import InterpreterAgent
            interpreter = InterpreterAgent(db)
        except Exception as e:
            print(f"Error loading interpreter: {e}")
            # Return mock response if agent not available
            return ChatResponse(
                message="I understand your concern. Let me analyze this legal issue... (Agent initialization pending)",
                relevant_laws=["BNS Section 126(2)", "BNS Section 316"],
                needs_clarification=False,
                ready_to_draft=False
            )
        
        result = await interpreter.chat(
            user_id=str(current_user['id']),
            message=request.message,
            case_id=request.case_id,
            language=request.language
        )
        
        # If this is the first message and no case exists, create one
        if not request.case_id and not result.get('needs_clarification', True):
            case_data = {
                "user_id": str(current_user['id']),
                "incident_description": request.message,
                "legal_sections": result.get("relevant_laws", []),
                "status": "intake",
                "conversation_summary": result.get("message", "")
            }
            
            import httpx
            headers = {
                "apikey": db_key,
                "Authorization": f"Bearer {db_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{os.getenv('SUPABASE_URL')}/rest/v1/cases",
                    json=case_data,
                    headers=headers
                )
                
                if response.status_code < 400:
                    result_data = response.json()
                    case_id = result_data[0]['id'] if isinstance(result_data, list) else result_data['id']
                    result['case_id'] = case_id
        
        return ChatResponse(
            message=result["message"],
            relevant_laws=result.get("relevant_laws", []),
            needs_clarification=result.get("needs_clarification", False),
            ready_to_draft=result.get("ready_to_draft", False)
        )
    except Exception as e:
        print(f"Chat error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/history/{case_id}")
async def get_chat_history(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get chat history for a case"""
    try:
        from agents.interpreter import InterpreterAgent
        interpreter = InterpreterAgent(db)
        messages = await interpreter.get_chat_messages(str(current_user['id']), case_id)
        return {"messages": messages}
    except Exception as e:
        print(f"Get chat history error: {e}")
        return {"messages": []}

@app.delete("/api/chat/history/{case_id}")
async def delete_chat_history(case_id: str, current_user: dict = Depends(get_current_user)):
    """Delete chat history from database"""
    try:
        from agents.interpreter import InterpreterAgent
        interpreter = InterpreterAgent(db)
        success = await interpreter.delete_chat_history(str(current_user['id']), case_id)
        return {"success": success, "message": "Chat history deleted" if success else "Failed to delete"}
    except Exception as e:
        print(f"Delete chat history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/clear")
async def clear_chat_session(case_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Clear chat session for user (in-memory only)"""
    try:
        from agents.interpreter import InterpreterAgent
        interpreter = InterpreterAgent(db)
        interpreter.clear_chat_session(str(current_user['id']), case_id)
        return {"success": True, "message": "Chat session cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/summary")
async def get_conversation_summary(case_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get summary of conversation"""
    try:
        from agents.interpreter import InterpreterAgent
        interpreter = InterpreterAgent(db)
        summary = await interpreter.summarize_conversation(str(current_user['id']), case_id)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

async def verify_admin(user_id: str) -> bool:
    """Check if user is admin"""
    try:
        response = db.table('admin_users').select('*').eq('user_id', user_id).execute()
        return len(response.data) > 0 if response.data else False
    except:
        return False

@app.get("/api/admin/check")
async def check_admin_status(current_user: dict = Depends(get_current_user)):
    """Check if current user is admin"""
    try:
        is_admin = await verify_admin(current_user['id'])
        return {"is_admin": is_admin}
    except Exception as e:
        return {"is_admin": False}

@app.get("/api/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    """Get admin statistics"""
    is_admin = await verify_admin(current_user['id'])
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get counts
        docs = db.table('document_uploads').select('*', count='exact').execute()
        embeddings = db.table('legal_embeddings').select('*', count='exact').execute()
        cases = db.table('cases').select('*', count='exact').execute()
        
        return {
            "total_documents": docs.count or 0,
            "total_embeddings": embeddings.count or 0,
            "total_cases": cases.count or 0
        }
    except Exception as e:
        print(f"Admin stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/documents")
async def get_admin_documents(current_user: dict = Depends(get_current_user)):
    """Get all uploaded documents"""
    is_admin = await verify_admin(current_user['id'])
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        response = db.table('document_uploads').select('*').execute()
        # Sort by created_at desc
        docs = response.data if response.data else []
        docs.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return {"documents": docs}
    except Exception as e:
        print(f"Get documents error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = "BNS",
    current_user: dict = Depends(get_current_user)
):
    """Upload and process legal document"""
    is_admin = await verify_admin(current_user['id'])
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Create upload record
        upload_data = {
            'filename': file.filename,
            'doc_type': doc_type,
            'status': 'processing',
            'uploaded_by': str(current_user['id']),
            'chunks_count': 0
        }
        
        # Use raw HTTP request
        import httpx
        headers = {
            "apikey": db_key,
            "Authorization": f"Bearer {db_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{os.getenv('SUPABASE_URL')}/rest/v1/document_uploads",
                json=upload_data,
                headers=headers
            )
            
            if response.status_code >= 400:
                print(f"Upload record error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=500, detail=f"Database error: {response.text}")
            
            result_data = response.json()
            upload_id = result_data[0]['id'] if isinstance(result_data, list) else result_data['id']
        
        # Save file temporarily
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, f"{upload_id}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"File saved to: {file_path}")
        
        # Process the document
        from admin.document_processor import DocumentProcessor
        processor = DocumentProcessor(db)
        
        result = await processor.process_document(
            file_path,
            file.filename,
            doc_type,
            upload_id,
            str(current_user['id'])
        )
        
        # Clean up temp file
        try:
            os.remove(file_path)
        except:
            pass
        
        return {
            "success": True,
            "upload_id": upload_id,
            "filename": file.filename,
            "result": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/documents/{upload_id}")
async def delete_document(upload_id: str, current_user: dict = Depends(get_current_user)):
    """Delete document and its embeddings"""
    is_admin = await verify_admin(current_user['id'])
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Delete embeddings (if any)
        # db.table('legal_embeddings').delete().eq('metadata->>upload_id', upload_id)
        
        # Delete upload record
        db.table('document_uploads').delete().eq('id', upload_id)
        
        return {"success": True, "message": "Document deleted"}
    except Exception as e:
        print(f"Delete document error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/")
async def root():
    return {"message": "Nyaya-Setu API v2.0 - Simple Auth"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "nyaya-setu", "auth": "simple"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
