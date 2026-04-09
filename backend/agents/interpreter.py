import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part
import os
from typing import List, Dict, Optional
import json
from datetime import datetime
from sentence_transformers import SentenceTransformer

# Initialize embedding model (local, fast, free!)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize Vertex AI
vertexai.init(
    project=os.getenv("GOOGLE_CLOUD_PROJECT"),
    location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
)

# ─────────────────────────────────────────────────────────────────────────────
# FIR SYSTEM PROMPT
# ─────────────────────────────────────────────────────────────────────────────
FIR_SYSTEM_PROMPT = """You are a compassionate and legally sharp Digital Legal Aid Officer for Indian citizens, part of the Nyaya-Setu platform.

Your role is to:
1. Validate the citizen's situation with empathy — let them know clearly that what happened to them is WRONG and ILLEGAL under Indian law.
2. Cite the exact legal sections from the [LEGAL CONTEXT] that apply, with the source filename.
3. Conduct a warm, conversational intake interview to collect all information required to draft an FIR.

═══ TONE & EMOTION ═══
- Lead with empathy. The citizen is likely scared, angry, or confused.
- After understanding their problem, be ASSERTIVE about the law: "What your landlord did is illegal", "This is a serious criminal offense", "You have every right to file an FIR", etc.
- You are their ally. Sound like a knowledgeable friend who is fighting for them, not a bureaucratic form.

═══ MANDATORY CITATION FORMAT — FOLLOW EXACTLY ═══
For EVERY applicable section, cite it like this (on its own line):
  📌 [Section number/name] — Source: [exact filename from context] — [one sentence on why it applies to THIS case]

Rules:
- ONLY cite sections present in the [LEGAL CONTEXT] block.
- The "Source: filename" part is MANDATORY — always include the exact filename shown in "Source File:" of the context.
- Do NOT invent, guess, or hallucinate section numbers.
- If context doesn't have a directly matching section, say so honestly, cite what IS there, and proceed.

═══ FIR INFORMATION TO COLLECT ═══
Ideally, before marking [READY_TO_DRAFT], collect:
  • Exact date, time, and location of the incident
  • Full description of what happened (who, what, when, where, how)
  • Name/description of the accused
  • Any witnesses (or confirm none)
  • Evidence available (photos, messages, receipts, etc.)

DO NOT ASK FOR THE COMPLAINANT'S NAME OR EMAIL. The system already has their registered profile data.

═══ FLEXIBLE DRAFTING RULE (CRITICAL) ═══
You do NOT need to force the user to answer every single question. 
Once you have the VERY basic incident details (what happened, date, location) and 2-3 initial questions are answered, you MUST explicitly ask: 
"We have enough to start. Would you like me to generate a draft FIR now, or should we add more details like witnesses?"

CRITICAL RULE: YOU MUST NEVER DRAFT THE ACTUAL FIR YOURSELF.
If the user says "draft it", "yes", or explicitly asks to generate the FIR, YOU MUST STOP ASKING QUESTIONS. 
DO NOT ASK FOR ANY MORE INFORMATION. 
Your entire response MUST be exactly this (no other text, no draft):
"I have forwarded your information to the Document Workspace. Click 'Generate FIR Draft' on the right panel to proceed. [READY_TO_DRAFT]"

═══ CONVERSATION RULES ═══
- Ask for 3-4 missing details per reply.
- Questions should be warm and short — conversational, not bureaucratic.
- Do NOT use bold headers for questions. Use a simple numbered list.
- End with [READY_TO_DRAFT] when all info is collected OR if the user asks you to draft it now.
- End with [NEEDS_CLARIFICATION] when still gathering.

═══ RESPONSE STRUCTURE ═══
1. Empathetic acknowledgment (2-3 lines) — validate their pain and be clear this is illegal/wrong
2. Legal citations with 📌 format including filename (from context only)
3. Brief plain-language explanation of what these laws mean for their case (2-3 lines)
4. Next questions (or the offer to draft if enough info is gathered)
"""

# Minimum similarity score to include a chunk in context
MIN_SIMILARITY = 0.15


class InterpreterAgent:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        self.model = GenerativeModel('gemini-2.5-flash')
        # session_key -> { "chat": chat_obj, "message_count": int }
        self.chat_sessions: Dict[str, dict] = {}

    # ─────────────────────────────────────────────────────────────────────────
    # RAG
    # ─────────────────────────────────────────────────────────────────────────
    async def retrieve_relevant_laws(self, query: str, top_k: int = 7) -> List[Dict]:
        """Query pgvector for relevant legal chunks with similarity filtering."""
        try:
            query_embedding = embedding_model.encode(query, convert_to_numpy=True).tolist()

            # Call the RPC — our custom client is synchronous, handles execute() internally
            response = self.supabase.rpc(
                'match_legal_documents',
                {'query_embedding': query_embedding, 'match_count': top_k}
            )

            # Handle both supabase-py (needs .execute()) and our custom client
            if hasattr(response, 'execute') and callable(response.execute):
                response = response.execute()

            results = response.data if response.data else []

            # Filter by minimum similarity and log each result
            filtered = []
            print(f"\n[RAG] Query: '{query[:70]}...'")
            print(f"[RAG] Retrieved {len(results)} raw results:")
            for r in results:
                meta = r.get('metadata', {})
                sim = r.get('similarity', 0)
                section = meta.get('section', 'Unknown')
                filename = meta.get('filename', 'unknown')
                content_snippet = r.get('content', '')[:80].replace('\n', ' ')
                print(f"  score={sim:.3f} | {section} | {filename} | {content_snippet}...")
                if sim >= MIN_SIMILARITY:
                    filtered.append(r)

            print(f"[RAG] After filter (>={MIN_SIMILARITY}): {len(filtered)} chunks kept\n")
            return filtered

        except Exception as e:
            print(f"[RAG] Error: {e}")
            import traceback
            traceback.print_exc()
            return []

    def _format_law_context(self, laws: List[Dict]) -> str:
        """Format retrieved chunks into rich, citable context."""
        if not laws:
            return "(No relevant legal sections found in the uploaded documents for this query.)"

        parts = []
        for i, law in enumerate(laws, 1):
            meta = law.get('metadata', {})
            section = meta.get('section', 'Unknown')
            doc_type = meta.get('doc_type', 'Law')
            filename = meta.get('filename', 'document')
            content = law.get('content', '').strip()
            similarity = law.get('similarity', 0)

            # Provide up to 700 chars of real content per chunk
            content_excerpt = content[:700] + ("..." if len(content) > 700 else "")

            parts.append(
                f"--- [CHUNK {i}] ---\n"
                f"Section Identifier: {section}\n"
                f"Document Type: {doc_type}\n"
                f"Source File: {filename}\n"
                f"Similarity Score: {similarity:.3f}\n"
                f"Content:\n{content_excerpt}\n"
            )

        return "\n".join(parts)

    def _extract_citation_list(self, laws: List[Dict]) -> List[Dict]:
        """Build structured citation list for API response."""
        citations = []
        seen = set()
        for law in laws:
            meta = law.get('metadata', {})
            section = meta.get('section', 'Unknown')
            doc_type = meta.get('doc_type', '')
            filename = meta.get('filename', '')
            content_snippet = law.get('content', '').strip()
            key = f"{section}|{filename}"
            if key not in seen:
                seen.add(key)
                citations.append({
                    'section': section,
                    'doc_type': doc_type,
                    'source': filename,
                    'snippet': content_snippet,
                    'relevance': round(law.get('similarity', 0), 3)
                })
        return citations

    # ─────────────────────────────────────────────────────────────────────────
    # SESSION MANAGEMENT WITH DB HISTORY SEEDING
    # ─────────────────────────────────────────────────────────────────────────
    def _session_key(self, user_id: str, case_id: str) -> str:
        return f"{user_id}_{case_id}"

    async def get_or_create_chat_session(self, user_id: str, case_id: str) -> dict:
        """
        Get or create a chat session. On creation, seeds Gemini with the last
        8 messages from the DB so context survives server restarts.
        """
        key = self._session_key(user_id, case_id)

        if key not in self.chat_sessions:
            print(f"[Session] Creating new session for {key}")

            # Load last 40 messages from DB to seed history so Drafter has full context
            history = await self._load_history_as_gemini_content(user_id, case_id, limit=40)

            chat = self.model.start_chat(history=history)
            msg_count = len([h for h in history if h.role == "user"])

            self.chat_sessions[key] = {
                "chat": chat,
                "message_count": msg_count,
            }
            print(f"[Session] Seeded with {len(history)} history entries ({msg_count} user turns)")

        return self.chat_sessions[key]

    async def _load_history_as_gemini_content(
        self, user_id: str, case_id: str, limit: int = 40
    ) -> List[Content]:
        """Load the last N messages from DB and convert to Gemini Content objects."""
        try:
            raw = await self._fetch_db_messages(user_id, case_id, limit=limit)
            history = []
            for msg in raw:
                role = "user" if msg.get('role') == 'user' else "model"
                text = msg.get('message', '')
                if text.strip():
                    history.append(Content(role=role, parts=[Part.from_text(text)]))
            return history
        except Exception as e:
            print(f"[Session] Could not load history: {e}")
            return []

    async def _fetch_db_messages(self, user_id: str, case_id: str, limit: int = 50) -> List[Dict]:
        """Fetch recent chat messages from DB for a given case."""
        try:
            # Direct table query (much faster and no RPC timeouts)
            response = (
                self.supabase
                .table('chat_messages')
                .select('*')
                .eq('case_id', case_id)
                .eq('user_id', user_id)
                .order('created_at', desc=False)
                .limit(limit)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            print(f"[DB] History fetch failed: {e}")
            return []

    def clear_chat_session(self, user_id: str, case_id: Optional[str] = None):
        key = self._session_key(user_id, case_id or "")
        self.chat_sessions.pop(key, None)

    # ─────────────────────────────────────────────────────────────────────────
    # RESPONSE PARSING
    # ─────────────────────────────────────────────────────────────────────────
    def _check_ready_to_draft(self, text: str) -> bool:
        return "[READY_TO_DRAFT]" in text or "FIRST INFORMATION REPORT" in text.upper() or "STATION HOUSE OFFICER" in text.upper()

    def _check_needs_clarification(self, text: str) -> bool:
        if self._check_ready_to_draft(text):
            return False
        return "[NEEDS_CLARIFICATION]" in text or "?" in text

    def _clean_response(self, text: str) -> str:
        if "[READY_TO_DRAFT]" in text or "FIRST INFORMATION REPORT" in text.upper() or "STATION HOUSE OFFICER" in text.upper():
            return "I have forwarded your information to the Document Workspace. Please click the **Generate FIR Draft** button on the right panel to proceed."
        return text.replace("[NEEDS_CLARIFICATION]", "").strip()

    # ─────────────────────────────────────────────────────────────────────────
    # MAIN CHAT
    # ─────────────────────────────────────────────────────────────────────────
    async def chat(self, user_id: str, message: str,
                   case_id: str = None, language: str = "en") -> Dict:
        """
        FIR intake chat. case_id must always be provided before calling.
        Messages are always saved to DB.
        """
        try:
            if not case_id:
                # Shouldn't happen — main_simple should always create a case first
                print("[Chat] WARNING: No case_id provided — messages won't persist")

            # ── Save user message ────────────────────────────────────────────
            if case_id:
                await self.save_message(user_id, case_id, 'user', message)

            # ── Get or restore session from DB ───────────────────────────────
            if case_id:
                session = await self.get_or_create_chat_session(user_id, case_id)
            else:
                # Fallback: stateless session
                session = {"chat": self.model.start_chat(history=[]), "message_count": 0}

            chat = session["chat"]
            session["message_count"] += 1
            msg_num = session["message_count"]

            # ── Check if user is forcefully asking to draft ──────────────────
            user_msg_lower = message.lower()
            draft_triggers = ["draft it", "draft the fir", "generate draft", "yes draft", "now draft"]
            if any(trigger in user_msg_lower for trigger in draft_triggers):
                bot_reply = "I have forwarded your information to the Document Workspace. Please click the **Generate FIR Draft** button on the right panel to proceed. [READY_TO_DRAFT]"
                return {
                    "message": self._clean_response(bot_reply),
                    "relevant_laws": [],
                    "laws_details": [],
                    "citations": [],
                    "needs_clarification": False,
                    "ready_to_draft": True
                }

            # ── RAG ──────────────────────────────────────────────────────────
            relevant_laws = await self.retrieve_relevant_laws(message, top_k=7)
            laws_context = self._format_law_context(relevant_laws)
            citations = self._extract_citation_list(relevant_laws)

            # ── Build prompt ─────────────────────────────────────────────────
            lang_str = 'Hindi' if language == 'hi' else 'English'

            if msg_num == 1:
                # First turn: inject full system prompt + law context
                prompt = (
                    f"{FIR_SYSTEM_PROMPT}\n\n"
                    f"[LEGAL CONTEXT FROM UPLOADED DOCUMENTS]\n"
                    f"{laws_context}\n\n"
                    f"[CITIZEN'S FIRST MESSAGE]\n"
                    f"{message}\n\n"
                    f"Respond in {lang_str}. Begin the FIR intake."
                )
            else:
                # Subsequent turns: fresh law context + reminder
                prompt = (
                    f"[UPDATED LEGAL CONTEXT for this message]\n"
                    f"{laws_context}\n\n"
                    f"[CITIZEN'S MESSAGE]\n"
                    f"{message}\n\n"
                    f"Continue the FIR intake in {lang_str}. "
                    f"Use what was already collected. Ask for the next missing detail(s)."
                )

            print(f"[Gemini] Turn #{msg_num} | prompt={len(prompt)} chars | citations={len(citations)}")

            # ── Call Gemini ──────────────────────────────────────────────────
            try:
                response = chat.send_message(prompt)
                response_text = response.text
                print(f"[Gemini] Response: {len(response_text)} chars")
            except Exception as ge:
                err = str(ge)
                print(f"[Gemini] Error: {err}")
                if "429" in err or "quota" in err.lower():
                    return self._rate_limit_fallback(relevant_laws, citations)
                raise

            # ── Parse flags & clean ──────────────────────────────────────────
            ready_to_draft = self._check_ready_to_draft(response_text)
            needs_clarification = self._check_needs_clarification(response_text)
            clean_response = self._clean_response(response_text)

            # ── Save bot response ────────────────────────────────────────────
            if case_id:
                await self.save_message(
                    user_id, case_id, 'bot', clean_response,
                    [c['section'] for c in citations],
                    {
                        'needs_clarification': needs_clarification,
                        'ready_to_draft': ready_to_draft,
                        'citations': citations,
                        'turn': msg_num
                    }
                )

            return {
                "message": clean_response,
                "relevant_laws": [c['section'] for c in citations],
                "laws_details": relevant_laws,
                "citations": citations,
                "needs_clarification": needs_clarification,
                "ready_to_draft": ready_to_draft,
                "case_id": case_id,
            }

        except Exception as e:
            print(f"[Chat] Unhandled error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "message": "I'm sorry, I encountered an error. Please try again.",
                "relevant_laws": [], "laws_details": [], "citations": [],
                "needs_clarification": False, "ready_to_draft": False,
                "error": str(e)
            }

    # ─────────────────────────────────────────────────────────────────────────
    # DB HELPERS
    # ─────────────────────────────────────────────────────────────────────────
    async def save_message(self, user_id: str, case_id: str, role: str,
                           message: str, relevant_laws: List[str] = None,
                           metadata: Dict = None):
        try:
            result = self.supabase.table('chat_messages').insert({
                'case_id': case_id,
                'user_id': user_id,
                'role': role,
                'message': message,
                'relevant_laws': relevant_laws or [],
                'metadata': metadata or {}
            })
            # supabase-py returns a QueryBuilder (needs .execute())
            # our custom client executes immediately and returns Response (no .execute())
            if hasattr(result, 'execute') and callable(result.execute):
                result.execute()
            print(f"[DB] Saved {role} message for case {case_id}")
        except Exception as e:
            print(f"[DB] Error saving message: {e}")

    async def get_chat_messages(self, user_id: str, case_id: str) -> List[Dict]:
        raw = await self._fetch_db_messages(user_id, case_id, limit=100)
        return [
            {
                'id': msg.get('id'),
                'role': msg.get('role'),
                'text': msg.get('message'),
                'relevant_laws': msg.get('relevant_laws', []),
                'citations': msg.get('metadata', {}).get('citations', []),
                'created_at': msg.get('created_at'),
            }
            for msg in raw
        ]

    async def delete_chat_history(self, user_id: str, case_id: str) -> bool:
        try:
            response = self.supabase.rpc(
                'delete_chat_history',
                {'p_case_id': case_id, 'p_user_id': user_id}
            )
            if hasattr(response, 'execute') and callable(response.execute):
                response.execute()
            self.clear_chat_session(user_id, case_id)
            return True
        except Exception as e:
            print(f"[DB] Error deleting history: {e}")
            return False

    # ─────────────────────────────────────────────────────────────────────────
    # FALLBACK
    # ─────────────────────────────────────────────────────────────────────────
    def _rate_limit_fallback(self, laws: List[Dict], citations: List[Dict]) -> Dict:
        if citations:
            laws_text = "\n".join(
                f"• {c['section']} — {c['source']}" for c in citations[:3]
            )
            msg = (
                "I understand your concern and I'm here to help.\n\n"
                f"Based on your situation, these sections may apply:\n{laws_text}\n\n"
                "I'm currently experiencing high demand. Please try again in a moment. "
                "Meanwhile, you can call **15100** (National Legal Services Authority) for free legal aid."
            )
        else:
            msg = (
                "I'm currently experiencing high demand. Please try again shortly. "
                "Meanwhile, call **15100** for free legal aid."
            )
        return {
            "message": msg,
            "relevant_laws": [c['section'] for c in citations],
            "laws_details": laws, "citations": citations,
            "needs_clarification": False, "ready_to_draft": False,
            "error_type": "rate_limit"
        }

    # ─────────────────────────────────────────────────────────────────────────
    # LEGACY (for /api/intake)
    # ─────────────────────────────────────────────────────────────────────────
    async def interpret_incident(self, incident: str, language: str = "en") -> Dict:
        laws = await self.retrieve_relevant_laws(incident, top_k=5)
        context = self._format_law_context(laws)
        citations = self._extract_citation_list(laws)
        lang_str = 'Hindi' if language == 'hi' else 'English'

        prompt = (
            f"You are a legal expert for Indian citizens.\n\n"
            f"[LEGAL CONTEXT]\n{context}\n\n"
            f"[INCIDENT]\n{incident}\n\n"
            f"Identify which laws were violated (cite exact sections from context), "
            f"explain in simple terms, and state what action the complainant can take. "
            f"Respond in {lang_str}."
        )
        try:
            response = self.model.generate_content(prompt)
            return {
                "explanation": response.text,
                "relevant_laws": [c['section'] for c in citations],
                "laws_details": laws
            }
        except Exception as e:
            print(f"[Legacy] Error: {e}")
            return {"explanation": "Unable to process your request.", "relevant_laws": [], "laws_details": []}

    # ─────────────────────────────────────────────────────────────────────────
    # CONVERSATION SUMMARY (hand-off to drafter)
    # ─────────────────────────────────────────────────────────────────────────
    async def summarize_conversation(self, user_id: str, case_id: Optional[str] = None) -> Dict:
        if not case_id:
            return {"summary": "No case ID provided", "key_points": [], "legal_sections": []}
            
        try:
            # Force load the session from DB if it doesn't exist in memory
            # This is critical because /api/generate-draft creates a new InterpreterAgent
            session = await self.get_or_create_chat_session(user_id, case_id)
            if not session or "chat" not in session:
                 return {"summary": "Session not found — may need to reload", "key_points": [], "legal_sections": []}
                 
            chat = session["chat"]
            prompt = (
                'Summarize this legal intake conversation as JSON for the FIR drafter. '
                'Return ONLY valid JSON — no markdown, no extra text:\n'
                '{"summary":"","complainant":{"name":"","address":"","phone":""},'
                '"incident":{"date":"","time":"","location":"","description":""},'
                '"accused":{"name":"","description":""},"witnesses":[],"evidence":[],'
                '"legal_sections":[],"relief_sought":"","ready_for_fir":false}'
            )
            response = chat.send_message(prompt)
            
            # Clean possible markdown block
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()
            
            try:
                import json
                return json.loads(raw_text)
            except json.JSONDecodeError:
                return {"summary": response.text, "key_points": [], "legal_sections": []}
        except Exception as e:
            print(f"[Summary] Error: {e}")
            import traceback
            traceback.print_exc()
            return {"summary": "Error generating summary", "key_points": [], "legal_sections": []}
