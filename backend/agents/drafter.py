import vertexai
from vertexai.generative_models import GenerativeModel
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from supabase import Client
import os
from datetime import datetime
from typing import Dict

# Vertex AI is initialized in the main interpreter module;
# we just use GenerativeModel here directly.

class DraftingAgent:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.model = GenerativeModel('gemini-2.5-flash')
    
    def fetch_mock_kyc(self, user_id: str) -> Dict:
        """Mock DigiLocker KYC fetch"""
        return {
            "name": "Sample User",
            "father_name": "Sample Father",
            "address": "123 Sample Street, Sample City, Sample State - 123456",
            "aadhaar_masked": "XXXX-XXXX-1234",
            "phone": "+91-9876543210",
            "email": "user@example.com"
        }
    
    async def generate_formal_draft(self, case_id: str, incident: str, 
                                   relevant_laws: list, user_kyc: Dict) -> Dict:
        """Generate formal legal document"""
        
        laws_text = "\n".join([f"- {law}" for law in relevant_laws])
        
        prompt = f"""You are an expert Indian legal drafter. Draft a formal FIR (First Information Report) or legal complaint.

Complainant Details:
Name: {user_kyc['name']}
Father's Name: {user_kyc['father_name']}
Address: {user_kyc['address']}
Phone: {user_kyc['phone']}
Email: {user_kyc['email']}

Incident Description:
{incident}

Relevant Legal Sections Violated:
{laws_text}

Requirements:
1. Use formal legal language
2. Structure it as a proper FIR/complaint
3. Include all complainant details
4. Cite specific BNS sections
5. Include date and place
6. End with verification statement
7. Leave space for signature

Format it professionally with proper sections."""

        try:
            response = self.model.generate_content(prompt)
            draft_text = response.text
            
            # Generate PDF
            pdf_path = f"temp_{case_id}.pdf"
            self._create_pdf(draft_text, user_kyc, pdf_path)
            
            # Upload to Supabase Storage (mock for now)
            pdf_url = f"https://storage.supabase.co/cases/{case_id}.pdf"
            
            return {
                "draft_text": draft_text,
                "pdf_url": pdf_url,
                "case_id": case_id
            }
        except Exception as e:
            print(f"Error generating draft: {e}")
            raise
    
    def _create_pdf(self, content: str, kyc: Dict, filename: str):
        """Create PDF from draft text"""
        doc = SimpleDocTemplate(filename, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor='black',
            spaceAfter=30,
            alignment=1  # Center
        )
        story.append(Paragraph("FIRST INFORMATION REPORT", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Content
        for line in content.split('\n'):
            if line.strip():
                story.append(Paragraph(line, styles['Normal']))
                story.append(Spacer(1, 0.1*inch))
        
        # Signature section
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph(f"Date: {datetime.now().strftime('%d/%m/%Y')}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph("Signature: _________________", styles['Normal']))
        story.append(Paragraph(f"Name: {kyc['name']}", styles['Normal']))
        
        doc.build(story)
