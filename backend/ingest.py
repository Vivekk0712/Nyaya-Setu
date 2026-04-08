"""
Data ingestion script for legal documents
Loads BNS PDF, chunks it, generates embeddings, and stores in Supabase pgvector
"""

import os
from dotenv import load_dotenv
from supabase import create_client
import google.generativeai as genai
from pypdf import PdfReader
from typing import List, Dict

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class LegalDataIngestor:
    def __init__(self):
        self.supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_KEY")
        )
    
    def load_pdf(self, pdf_path: str) -> str:
        """Load PDF and extract text"""
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks"""
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += (chunk_size - overlap)
        
        return chunks
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using Gemini"""
        try:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    def ingest_document(self, pdf_path: str, doc_type: str = "BNS"):
        """Main ingestion pipeline"""
        print(f"Loading PDF: {pdf_path}")
        text = self.load_pdf(pdf_path)
        
        print("Chunking text...")
        chunks = self.chunk_text(text)
        print(f"Created {len(chunks)} chunks")
        
        print("Generating embeddings and uploading to Supabase...")
        for i, chunk in enumerate(chunks):
            print(f"Processing chunk {i+1}/{len(chunks)}")
            
            embedding = self.generate_embedding(chunk)
            if not embedding:
                continue
            
            # Insert into Supabase
            try:
                self.supabase.table('legal_embeddings').insert({
                    'content': chunk,
                    'metadata': {
                        'doc_type': doc_type,
                        'chunk_index': i,
                        'section': self._extract_section(chunk)
                    },
                    'embedding': embedding
                }).execute()
            except Exception as e:
                print(f"Error inserting chunk {i}: {e}")
        
        print("Ingestion complete!")
    
    def _extract_section(self, text: str) -> str:
        """Extract section number from text (simple heuristic)"""
        import re
        match = re.search(r'Section\s+(\d+[A-Z]?)', text, re.IGNORECASE)
        return match.group(0) if match else "Unknown"

if __name__ == "__main__":
    ingestor = LegalDataIngestor()
    
    # Example usage
    # ingestor.ingest_document("path/to/BNS.pdf", "BNS")
    
    print("Legal Data Ingestor ready.")
    print("Usage: ingestor.ingest_document('path/to/BNS.pdf', 'BNS')")
