import google.generativeai as genai
from supabase import Client
import os
from typing import List, Dict, Optional
import json
from datetime import datetime

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class InterpreterAgent:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.chat_sessions = {}  # Store chat sessions per user (in-memory cache)
    
    async def retrieve_relevant_laws(self, query: str, top_k: int = 3) -> List[Dict]:
        """Query Supabase pgvector for relevant legal sections"""
        try:
            # Generate embedding for the query
            embedding_result = genai.embed_content(
                model="models/gemini-embedding-001",  # Correct format with models/ prefix
                content=query,
                task_type="retrieval_query"
            )
            query_embedding = embedding_result['embedding']
            
            # Query Supabase for similar vectors
            response = self.supabase.rpc(
                'match_legal_documents',
                {
                    'query_embedding': query_embedding,
                    'match_count': top_k
                }
            ).execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error retrieving laws: {e}")
            # Return empty list if RAG fails - agent will still work without it
            return []
    
    async def load_chat_history(self, user_id: str, case_id: str) -> List[Dict]:
        """Load chat history from database"""
        try:
            response = self.supabase.rpc(
                'get_chat_history',
                {
                    'p_case_id': case_id,
                    'p_user_id': user_id,
                    'message_limit': 50
                }
            ).execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error loading chat history: {e}")
            return []
    
    async def save_message(self, user_id: str, case_id: str, role: str, message: str, 
                          relevant_laws: List[str] = None, metadata: Dict = None):
        """Save a chat message to database"""
        try:
            message_data = {
                'case_id': case_id,
                'user_id': user_id,
                'role': role,
                'message': message,
                'relevant_laws': relevant_laws or [],
                'metadata': metadata or {}
            }
            
            self.supabase.table('chat_messages').insert(message_data).execute()
        except Exception as e:
            print(f"Error saving message: {e}")
    
    def get_or_create_chat_session(self, user_id: str, case_id: Optional[str] = None):
        """Get existing chat session or create new one"""
        session_key = f"{user_id}_{case_id}" if case_id else user_id
        
        if session_key not in self.chat_sessions:
            # Create new chat session with system instructions
            self.chat_sessions[session_key] = self.model.start_chat(history=[])
        
        return self.chat_sessions[session_key]
    
    async def chat(self, user_id: str, message: str, case_id: Optional[str] = None, language: str = "en") -> Dict:
        """Interactive chat with the legal interpreter"""
        try:
            # Get or create chat session
            chat = self.get_or_create_chat_session(user_id, case_id)
            
            # Save user message to database if case_id exists
            if case_id:
                await self.save_message(user_id, case_id, 'user', message)
            
            # Retrieve relevant laws for context
            relevant_laws = await self.retrieve_relevant_laws(message)
            
            # Build context from retrieved laws
            laws_context = ""
            if relevant_laws:
                laws_context = "\n\nRelevant Legal Sections:\n" + "\n".join([
                    f"- {law.get('metadata', {}).get('section', 'Unknown')}: {law.get('content', '')[:200]}..."
                    for law in relevant_laws
                ])
            
            # Create contextual prompt
            system_context = f"""You are a compassionate Digital Public Defender helping Indian citizens understand their legal rights.

Guidelines:
1. Speak in simple, clear language that anyone can understand
2. Be empathetic and supportive
3. Identify relevant laws from the Bharatiya Nyaya Sanhita (BNS) or Consumer Protection Act
4. Explain violations in plain terms
5. Guide users on what legal action they can take
6. Ask clarifying questions if needed
7. Respond in {language} language

{laws_context}

User's message: {message}"""

            try:
                # Send message to chat
                response = chat.send_message(system_context)
            except Exception as gemini_error:
                error_str = str(gemini_error)
                
                # Check if it's a rate limit error
                if "429" in error_str or "quota" in error_str.lower() or "rate limit" in error_str.lower():
                    # Return a helpful message about rate limits
                    return {
                        "message": "I apologize, but I've reached my daily usage limit with the AI service. This typically resets within 24 hours. In the meantime, I can still help you understand that your issue may involve legal violations. Please try again later, or contact legal aid services directly at 15100 (National Legal Services Authority helpline).",
                        "relevant_laws": [law.get('metadata', {}).get('section', 'Unknown') for law in relevant_laws] if relevant_laws else [],
                        "laws_details": relevant_laws,
                        "needs_clarification": False,
                        "ready_to_draft": False,
                        "error_type": "rate_limit"
                    }
                else:
                    # Re-raise other errors
                    raise
            
            # Extract relevant sections mentioned
            relevant_sections = [law.get('metadata', {}).get('section', 'Unknown') for law in relevant_laws]
            
            # Check response flags
            needs_clarification = self._check_if_needs_clarification(response.text)
            ready_to_draft = self._check_if_ready_to_draft(response.text)
            
            # Save bot response to database if case_id exists
            if case_id:
                await self.save_message(
                    user_id, 
                    case_id, 
                    'bot', 
                    response.text,
                    relevant_sections,
                    {
                        'needs_clarification': needs_clarification,
                        'ready_to_draft': ready_to_draft
                    }
                )
            
            return {
                "message": response.text,
                "relevant_laws": relevant_sections,
                "laws_details": relevant_laws,
                "needs_clarification": needs_clarification,
                "ready_to_draft": ready_to_draft
            }
        except Exception as e:
            print(f"Error in chat: {e}")
            return {
                "message": "I apologize, but I'm having trouble processing your request right now. Please try again.",
                "relevant_laws": [],
                "laws_details": [],
                "needs_clarification": False,
                "ready_to_draft": False,
                "error": str(e)
            }
    
    def _check_if_needs_clarification(self, response: str) -> bool:
        """Check if the response is asking for clarification"""
        clarification_keywords = ["could you", "can you tell me", "please provide", "need more", "clarify", "?"]
        return any(keyword in response.lower() for keyword in clarification_keywords)
    
    def _check_if_ready_to_draft(self, response: str) -> bool:
        """Check if the conversation is ready to generate a draft"""
        draft_keywords = ["shall i draft", "ready to draft", "generate a complaint", "file a complaint", "create an fir"]
        return any(keyword in response.lower() for keyword in draft_keywords)
    
    async def interpret_incident(self, incident: str, language: str = "en") -> Dict:
        """Interpret user incident and explain in simple terms (legacy method for compatibility)"""
        
        # Retrieve relevant laws
        relevant_laws = await self.retrieve_relevant_laws(incident)
        
        # Build context from retrieved laws
        laws_context = "\n\n".join([
            f"Section: {law.get('metadata', {}).get('section', 'Unknown')}\n{law.get('content', '')}"
            for law in relevant_laws
        ])
        
        # Create prompt for Gemini
        prompt = f"""You are a legal interpreter helping Indian citizens understand their rights.

User's Incident:
{incident}

Relevant Laws from Bharatiya Nyaya Sanhita (BNS):
{laws_context}

Task:
1. Identify which laws have been violated
2. Explain the violation in simple, clear language
3. Tell the user what legal action they can take
4. Be empathetic and supportive

Respond in {language} language."""

        try:
            response = self.model.generate_content(prompt)
            
            return {
                "explanation": response.text,
                "relevant_laws": [law.get('metadata', {}).get('section', 'Unknown') for law in relevant_laws],
                "laws_details": relevant_laws
            }
        except Exception as e:
            print(f"Error interpreting incident: {e}")
            return {
                "explanation": "Unable to process your request at this time.",
                "relevant_laws": [],
                "laws_details": []
            }
    
    def clear_chat_session(self, user_id: str, case_id: Optional[str] = None):
        """Clear chat session for a user (in-memory only, DB history remains)"""
        session_key = f"{user_id}_{case_id}" if case_id else user_id
        if session_key in self.chat_sessions:
            del self.chat_sessions[session_key]
    
    async def delete_chat_history(self, user_id: str, case_id: str) -> bool:
        """Delete chat history from database"""
        try:
            response = self.supabase.rpc(
                'delete_chat_history',
                {
                    'p_case_id': case_id,
                    'p_user_id': user_id
                }
            ).execute()
            
            # Also clear in-memory session
            self.clear_chat_session(user_id, case_id)
            
            return True
        except Exception as e:
            print(f"Error deleting chat history: {e}")
            return False
    
    async def get_chat_messages(self, user_id: str, case_id: str) -> List[Dict]:
        """Get formatted chat messages for display"""
        try:
            history = await self.load_chat_history(user_id, case_id)
            
            messages = []
            for msg in history:
                messages.append({
                    'id': msg['id'],
                    'role': msg['role'],
                    'text': msg['message'],
                    'relevant_laws': msg.get('relevant_laws', []),
                    'created_at': msg['created_at']
                })
            
            return messages
        except Exception as e:
            print(f"Error getting chat messages: {e}")
            return []
    
    async def summarize_conversation(self, user_id: str, case_id: Optional[str] = None) -> Dict:
        """Summarize the conversation for case filing"""
        session_key = f"{user_id}_{case_id}" if case_id else user_id
        
        if session_key not in self.chat_sessions:
            return {
                "summary": "No conversation found",
                "key_points": [],
                "legal_sections": []
            }
        
        try:
            chat = self.chat_sessions[session_key]
            
            # Ask the model to summarize
            summary_prompt = """Please summarize this conversation in a structured format:
1. Brief summary of the incident
2. Key facts and details
3. Legal sections that apply
4. Recommended action

Format as JSON with keys: summary, key_points (array), legal_sections (array), recommended_action"""
            
            response = chat.send_message(summary_prompt)
            
            # Try to parse as JSON, fallback to text
            try:
                summary_data = json.loads(response.text)
            except:
                summary_data = {
                    "summary": response.text,
                    "key_points": [],
                    "legal_sections": []
                }
            
            return summary_data
        except Exception as e:
            print(f"Error summarizing conversation: {e}")
            return {
                "summary": "Error generating summary",
                "key_points": [],
                "legal_sections": []
            }
