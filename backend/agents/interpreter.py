import google.generativeai as genai
from supabase import Client
import os
from typing import List, Dict

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class InterpreterAgent:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    async def retrieve_relevant_laws(self, query: str, top_k: int = 3) -> List[Dict]:
        """Query Supabase pgvector for relevant legal sections"""
        try:
            # Generate embedding for the query
            embedding_result = genai.embed_content(
                model="models/text-embedding-004",
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
            return []
    
    async def interpret_incident(self, incident: str, language: str = "en") -> Dict:
        """Interpret user incident and explain in simple terms"""
        
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
