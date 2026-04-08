from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import shutil
from datetime import datetime

# Load environment variables FIRST before importing auth
load_dotenv()

# Now import auth (which will load JWT_SECRET correctly)
from auth import get_user_from_token

# Try to import Supabase client, fallback to custom client if it fails
try:
    from supabase import create_client, Client
    supabase: Client = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_KEY")
    )
except Exception as e:
    print(f"Warning: Supabase SDK failed to load: {e}")
    print("Using custom database client instead...")
    from database_client import create_client
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_KEY")
    )

app = FastAPI(title="Nyaya-Setu API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class IntakeRequest(BaseModel):
    incident_description: str
    language: str = "en"

class IntakeResponse(BaseModel):
    simplified_explanation: str
    relevant_laws: List[str]
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

class DraftRequest(BaseModel):
    case_id: str
    user_kyc: dict

class DraftResponse(BaseModel):
    draft_text: str
    pdf_url: str
    case_id: str

# Auth dependency
async def get_current_user(authorization: str = Header(None)):
    """Get current user from JWT token"""
    return get_user_from_token(authorization)

@app.get("/")
async def root():
    return {"message": "Nyaya-Setu API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "nyaya-setu"}

# Import agents
from agents.interpreter import InterpreterAgent
from agents.drafter import DraftingAgent
from agents.advisor import AdvisoryAgent

# Initialize agents
interpreter = InterpreterAgent(supabase)
drafter = DraftingAgent(supabase)
advisor = AdvisoryAgent(supabase)

@app.post("/api/intake", response_model=IntakeResponse)
async def intake_incident(request: IntakeRequest, user = Depends(get_current_user)):
    """Agent 1: Interpret incident and retrieve relevant laws"""
    try:
        result = await interpreter.interpret_incident(
            request.incident_description,
            request.language
        )
        
        # Create case in database
        case_data = {
            "user_id": user['id'],
            "incident_description": request.incident_description,
            "legal_sections": result["relevant_laws"],
            "status": "intake"
        }
        
        case_response = supabase.table('cases').insert(case_data).execute()
        case_id = case_response.data[0]['id']
        
        return IntakeResponse(
            simplified_explanation=result["explanation"],
            relevant_laws=result["relevant_laws"],
            case_id=case_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_interpreter(request: ChatRequest, user = Depends(get_current_user)):
    """Interactive chat with the legal interpreter agent"""
    try:
        result = await interpreter.chat(
            user_id=user['id'],
            message=request.message,
            case_id=request.case_id,
            language=request.language
        )
        
        # If this is the first message and no case exists, create one
        if not request.case_id and not result.get('needs_clarification', True):
            case_data = {
                "user_id": user['id'],
                "incident_description": request.message,
                "legal_sections": result.get("relevant_laws", []),
                "status": "intake",
                "conversation_summary": result.get("message", "")
            }
            
            case_response = supabase.table('cases').insert(case_data).execute()
            case_id = case_response.data[0]['id']
            result['case_id'] = case_id
        
        return ChatResponse(
            message=result["message"],
            relevant_laws=result.get("relevant_laws", []),
            needs_clarification=result.get("needs_clarification", False),
            ready_to_draft=result.get("ready_to_draft", False)
        )
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/clear")
async def clear_chat_session(case_id: Optional[str] = None, user = Depends(get_current_user)):
    """Clear chat session for user (in-memory only)"""
    try:
        interpreter.clear_chat_session(user['id'], case_id)
        return {"success": True, "message": "Chat session cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/chat/history/{case_id}")
async def delete_chat_history(case_id: str, user = Depends(get_current_user)):
    """Delete chat history from database"""
    try:
        success = await interpreter.delete_chat_history(user['id'], case_id)
        return {"success": success, "message": "Chat history deleted" if success else "Failed to delete"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/history/{case_id}")
async def get_chat_history(case_id: str, user = Depends(get_current_user)):
    """Get chat history for a case"""
    try:
        messages = await interpreter.get_chat_messages(user['id'], case_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/summary")
async def get_conversation_summary(case_id: Optional[str] = None, user = Depends(get_current_user)):
    """Get summary of conversation"""
    try:
        summary = await interpreter.summarize_conversation(user['id'], case_id)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-draft", response_model=DraftResponse)
async def generate_draft(request: DraftRequest, user = Depends(get_current_user)):
    """Agent 2: Generate formal legal draft"""
    try:
        # Get case details
        case = supabase.table('cases').select('*').eq('id', request.case_id).single().execute()
        
        if not case.data:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Fetch KYC (mock)
        kyc = drafter.fetch_mock_kyc(user['id'])
        
        # Generate draft
        result = await drafter.generate_formal_draft(
            request.case_id,
            case.data['incident_description'],
            case.data['legal_sections'],
            kyc
        )
        
        # Update case
        supabase.table('cases').update({
            'draft_content': result['draft_text'],
            'pdf_url': result['pdf_url'],
            'status': 'drafted'
        }).eq('id', request.case_id).execute()
        
        return DraftResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cases")
async def get_cases(user = Depends(get_current_user)):
    """Get all cases for current user"""
    try:
        response = supabase.table('cases').select('*').eq('user_id', user['id']).execute()
        return {"cases": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cases/{case_id}")
async def get_case(case_id: str, user = Depends(get_current_user)):
    """Get specific case details"""
    try:
        response = supabase.table('cases').select('*').eq('id', case_id).eq('user_id', user['id']).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Case not found")

@app.patch("/api/cases/{case_id}/status")
async def update_case_status(case_id: str, status: str, user = Depends(get_current_user)):
    """Update case status"""
    try:
        update_data = {'status': status}
        if status == 'filed':
            from datetime import datetime
            update_data['filed_at'] = datetime.now().isoformat()
        
        response = supabase.table('cases').update(update_data).eq('id', case_id).eq('user_id', user['id']).execute()
        return {"success": True, "case": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/nudge/{case_id}")
async def trigger_nudge(case_id: str, user = Depends(get_current_user)):
    """Agent 3: Manually trigger nudge for a case"""
    try:
        success = await advisor.send_nudge(case_id)
        return {"success": success, "message": "Nudge sent successfully" if success else "Failed to send nudge"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin routes
from admin.middleware import verify_admin, require_admin
from admin.document_processor import DocumentProcessor

document_processor = DocumentProcessor(supabase)

@app.get("/api/admin/check")
async def check_admin_status(user = Depends(get_current_user)):
    """Check if current user is admin"""
    try:
        is_admin = await verify_admin(user['id'], supabase)
        return {"is_admin": is_admin}
    except Exception as e:
        return {"is_admin": False}

@app.post("/api/admin/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = "BNS",
    user = Depends(get_current_user)
):
    """Upload and process legal document (Admin only)"""
    try:
        await require_admin(user['id'], supabase)
        
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Create upload record
        upload_record = supabase.table('document_uploads').insert({
            'filename': file.filename,
            'doc_type': doc_type,
            'status': 'uploading',
            'uploaded_by': user['id']
        }).execute()
        
        upload_id = upload_record.data[0]['id']
        
        # Save file temporarily
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, f"{upload_id}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process document in background
        result = await document_processor.process_document(
            file_path,
            file.filename,
            doc_type,
            upload_id,
            user['id']
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
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/documents")
async def get_documents(user = Depends(get_current_user)):
    """Get all uploaded documents (Admin only)"""
    try:
        await require_admin(user['id'], supabase)
        
        response = supabase.table('document_uploads').select('*').order('created_at', desc=True).execute()
        return {"documents": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/documents/{upload_id}")
async def delete_document(upload_id: str, user = Depends(get_current_user)):
    """Delete document and its embeddings (Admin only)"""
    try:
        await require_admin(user['id'], supabase)
        
        # Delete embeddings
        supabase.table('legal_embeddings').delete().eq('metadata->>upload_id', upload_id).execute()
        
        # Delete upload record
        supabase.table('document_uploads').delete().eq('id', upload_id).execute()
        
        return {"success": True, "message": "Document deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/stats")
async def get_admin_stats(user = Depends(get_current_user)):
    """Get admin statistics (Admin only)"""
    try:
        await require_admin(user['id'], supabase)
        
        # Get document count
        docs = supabase.table('document_uploads').select('*', count='exact').execute()
        
        # Get embeddings count
        embeddings = supabase.table('legal_embeddings').select('*', count='exact').execute()
        
        # Get total cases
        cases = supabase.table('cases').select('*', count='exact').execute()
        
        return {
            "total_documents": docs.count,
            "total_embeddings": embeddings.count,
            "total_cases": cases.count
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Background scheduler for automatic nudges
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.add_job(advisor.run_daily_check, 'interval', hours=24)
scheduler.start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
