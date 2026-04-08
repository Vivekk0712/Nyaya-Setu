import google.generativeai as genai
from supabase import Client
from datetime import datetime, timedelta
import os
from typing import List, Dict

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AdvisoryAgent:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    async def check_pending_cases(self) -> List[Dict]:
        """Check for cases that need follow-up"""
        try:
            seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()
            
            response = self.supabase.table('cases').select('*').filter(
                'status', 'eq', 'filed'
            ).filter(
                'filed_at', 'lt', seven_days_ago
            ).execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error checking pending cases: {e}")
            return []
    
    async def generate_nudge_email(self, case: Dict) -> str:
        """Generate follow-up nudge email"""
        
        prompt = f"""You are drafting a formal follow-up email to police authorities regarding a pending FIR.

Case Details:
- Case ID: {case['id']}
- Filed Date: {case['filed_at']}
- Incident: {case['incident_description'][:200]}...

Requirements:
1. Address to Superintendent of Police
2. Reference the original complaint number
3. Cite legal mandate for timely response (Section 154 CrPC)
4. Be firm but respectful
5. Request immediate action
6. Include complainant contact details

Draft a professional follow-up email."""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error generating nudge: {e}")
            return ""
    
    async def send_nudge(self, case_id: str) -> bool:
        """Send nudge for a specific case"""
        try:
            # Get case details
            case = self.supabase.table('cases').select('*').eq('id', case_id).single().execute()
            
            if not case.data:
                return False
            
            # Generate nudge email
            email_content = await self.generate_nudge_email(case.data)
            
            # Mock email sending (in production, use SMTP)
            print(f"Sending nudge email for case {case_id}:")
            print(email_content)
            
            # Update last_nudge_at
            self.supabase.table('cases').update({
                'last_nudge_at': datetime.now().isoformat()
            }).eq('id', case_id).execute()
            
            return True
        except Exception as e:
            print(f"Error sending nudge: {e}")
            return False
    
    async def run_daily_check(self):
        """Daily background task to check and send nudges"""
        pending_cases = await self.check_pending_cases()
        
        for case in pending_cases:
            await self.send_nudge(case['id'])
