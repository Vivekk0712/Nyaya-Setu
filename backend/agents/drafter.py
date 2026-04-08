"""
Agent 2: DraftingAgent
Generates a beautifully formatted, legally correct FIR from conversation summary.
"""
import vertexai
from vertexai.generative_models import GenerativeModel
import os
from datetime import datetime
from typing import Dict, List, Optional

# Vertex AI is already initialized by interpreter.py at startup.
# If this module is used standalone, init here.
try:
    vertexai.init(
        project=os.getenv("GOOGLE_CLOUD_PROJECT"),
        location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    )
except Exception:
    pass  # already initialized


# ─────────────────────────────────────────────────────────────────────────────
# DRAFTER PROMPT
# ─────────────────────────────────────────────────────────────────────────────
DRAFTER_PROMPT = """You are an expert Indian legal document drafter with 20 years of experience drafting FIRs and legal complaints.

Draft a complete, formal, and legally precise First Information Report (FIR) / Police Complaint using ONLY the information provided below.

═══ FORMATTING RULES ═══
- Use formal legal language throughout
- Structure with clear numbered sections
- Use "Respected Sir/Madam" for the salutation
- Use bullet points for listing incidents in sequence
- Include ALL dates, times, and locations mentioned
- Cite ALL legal sections provided (include BNS/IPC/BNSS section names and numbers)
- End with a verification declaration
- Leave specific signature/stamp placeholder lines
- Do NOT make up any facts not in the provided information
- Where information is missing, use [TO BE FILLED] as placeholder

═══ REQUIRED DOCUMENT STRUCTURE ═══

FIRST INFORMATION REPORT

To,
The Station House Officer (SHO)
[Police Station Name], [City/District]

Date: [DATE]
Place: [LOCATION]

Subject: Complaint / FIR under [SECTIONS LIST] of the Bharatiya Nyaya Sanhita (BNS) / BNSS against [ACCUSED NAME]

Respected Sir/Madam,

1. DETAILS OF COMPLAINANT
   [All complainant details]

2. DETAILS OF ACCUSED
   [Accused details]

3. FACTS OF THE CASE
   [Chronological narrative of events with dates and times]

4. LEGAL VIOLATIONS
   [Each section violated with explanation]

5. EVIDENCE AVAILABLE
   [All evidence listed]

6. WITNESSES
   [Witness details]

7. RELIEF SOUGHT
   [What the complainant is requesting]

8. DECLARATION
   Standard verification text

[Signature block]
"""


class DraftingAgent:
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.model = GenerativeModel('gemini-2.5-flash')

    # ─────────────────────────────────────────────────────────────────────────
    # MAIN: DRAFT FROM CONVERSATION SUMMARY
    # ─────────────────────────────────────────────────────────────────────────
    async def draft_from_summary(self, summary: Dict, case_id: str, user: Dict, db_legal_sections: List[str] = None) -> Dict:
        """
        Generate a complete FIR from the interpreter's conversation summary.
        `summary` is the JSON object returned by interpreter.summarize_conversation().
        `user` is the authenticated user dict (has name, email, etc.)
        `db_legal_sections` is the exact list of sections collected by the system.
        """
        today = datetime.now().strftime("%d %B %Y")
        time_now = datetime.now().strftime("%I:%M %p")

        # Pull structured data from summary
        complainant = summary.get("complainant", {})
        incident = summary.get("incident", {})
        accused = summary.get("accused", {})
        witnesses = summary.get("witnesses", [])
        evidence = summary.get("evidence", [])
        legal_sections = db_legal_sections if db_legal_sections else summary.get("legal_sections", [])
        relief = summary.get("relief_sought", "")
        raw_summary = summary.get("summary", "")

        # Fill missing complainant fields from user profile
        comp_name = complainant.get("name") or user.get("full_name") or user.get("name") or "[Complainant Name]"
        comp_address = complainant.get("address") or "[Address to be filled]"
        comp_phone = complainant.get("phone") or "[Phone to be filled]"
        comp_email = user.get("email") or "[Email to be filled]"

        accused_name = accused.get("name") or "[Accused Name]"
        accused_desc = accused.get("description") or "[Description to be filled]"

        inc_date = incident.get("date") or "[Date to be filled]"
        inc_time = incident.get("time") or "[Time to be filled]"
        inc_location = incident.get("location") or "[Location to be filled]"
        inc_description = incident.get("description") or raw_summary or "[Incident description to be filled]"

        sections_text = "\n".join(f"   - {s}" for s in legal_sections) if legal_sections else "   - [Sections to be filled by legal officer]"
        witnesses_text = "\n".join(f"   - {w}" for w in witnesses) if witnesses else "   - No witnesses identified"
        evidence_text = "\n".join(f"   - {e}" for e in evidence) if evidence else "   - [Evidence to be listed]"
        relief_text = relief or "[Relief to be specified]"

        # Build the structured context for Gemini
        context = f"""
CASE ID: {case_id}
DATE OF REPORT: {today}
TIME: {time_now}

COMPLAINANT:
Name: {comp_name}
Address: {comp_address}
Phone: {comp_phone}
Email: {comp_email}

ACCUSED:
Name: {accused_name}
Description: {accused_desc}

INCIDENT:
Date of Incident: {inc_date}
Time: {inc_time}
Location: {inc_location}
Description: {inc_description}

LEGAL SECTIONS VIOLATED:
{sections_text}

WITNESSES:
{witnesses_text}

EVIDENCE:
{evidence_text}

RELIEF SOUGHT:
{relief_text}
"""

        prompt = f"""{DRAFTER_PROMPT}

═══ CASE INFORMATION ═══
{context}

Now draft the complete, formal FIR document. Make it professional, comprehensive, and legally precise.
Include all the information above. Where something is [TO BE FILLED], acknowledge it but structure the document anyway."""

        try:
            print(f"[Drafter] Generating FIR for case {case_id}...")
            response = self.model.generate_content(prompt)
            draft_text = response.text
            print(f"[Drafter] Generated {len(draft_text)} chars")

            # Update case status to drafted
            if self.supabase and case_id:
                try:
                    result = self.supabase.table('cases').update({
                        'status': 'drafted',
                        'draft_content': draft_text,
                    }).eq('id', case_id)
                    if hasattr(result, 'execute'):
                        result.execute()
                except Exception as db_err:
                    print(f"[Drafter] DB update error: {db_err}")

            return {
                "success": True,
                "draft_text": draft_text,
                "case_id": case_id,
                "complainant_name": comp_name,
                "generated_at": today,
            }

        except Exception as e:
            print(f"[Drafter] Error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e),
                "draft_text": None,
                "case_id": case_id,
            }

    # ─────────────────────────────────────────────────────────────────────────
    # DRAFT FROM RAW INCIDENT (legacy / fallback)
    # ─────────────────────────────────────────────────────────────────────────
    async def generate_formal_draft(self, case_id: str, incident: str,
                                    relevant_laws: List[str], user_kyc: Dict) -> Dict:
        """Legacy method: draft from raw incident description + laws list."""
        today = datetime.now().strftime("%d %B %Y")

        laws_text = "\n".join(f"   - {law}" for law in relevant_laws)

        context = f"""
CASE ID: {case_id}
DATE OF REPORT: {today}

COMPLAINANT:
Name: {user_kyc.get('name', '[Name]')}
Father's Name: {user_kyc.get('father_name', '[Father Name]')}
Address: {user_kyc.get('address', '[Address]')}
Phone: {user_kyc.get('phone', '[Phone]')}
Email: {user_kyc.get('email', '[Email]')}

INCIDENT DESCRIPTION:
{incident}

LEGAL SECTIONS VIOLATED:
{laws_text}
"""
        prompt = f"{DRAFTER_PROMPT}\n\n═══ CASE INFORMATION ═══\n{context}\n\nDraft the complete FIR now."

        try:
            response = self.model.generate_content(prompt)
            draft_text = response.text

            if self.supabase and case_id:
                try:
                    result = self.supabase.table('cases').update({
                        'status': 'drafted',
                        'draft_content': draft_text,
                    }).eq('id', case_id)
                    if hasattr(result, 'execute'):
                        result.execute()
                except Exception:
                    pass

            return {"draft_text": draft_text, "pdf_url": None, "case_id": case_id, "success": True}
        except Exception as e:
            print(f"[Drafter] Error: {e}")
            raise
