import google.generativeai as genai
from pypdf import PdfReader
from typing import List, Dict
import os
import re
from datetime import datetime
from sentence_transformers import SentenceTransformer

# Initialize the embedding model (runs locally, much faster!)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class DocumentProcessor:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            raise
    
    def chunk_text(self, text: str, chunk_size: int = 2000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks - larger chunks for faster processing"""
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < text_length:
                last_period = chunk.rfind('.')
                if last_period > chunk_size * 0.7:  # Only if we're not losing too much
                    chunk = chunk[:last_period + 1]
                    end = start + last_period + 1
            
            chunks.append(chunk.strip())
            start += (chunk_size - overlap)
        
        return chunks
    
    def extract_section_number(self, text: str) -> str:
        """Extract section number from text"""
        patterns = [
            r'Section\s+(\d+[A-Z]?)',
            r'Sec\.\s+(\d+[A-Z]?)',
            r'§\s*(\d+[A-Z]?)',
            r'Chapter\s+(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        
        return "Unknown"
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using sentence-transformers (local, fast!)"""
        try:
            # Generate embedding locally - much faster than API calls
            embedding = embedding_model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    async def process_document(
        self, 
        file_path: str, 
        filename: str,
        doc_type: str,
        upload_id: str,
        user_id: str
    ) -> Dict:
        """Main processing pipeline"""
        try:
            # Update status
            import httpx
            import os
            
            db_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
            supabase_url = os.getenv("SUPABASE_URL")
            
            headers = {
                "apikey": db_key,
                "Authorization": f"Bearer {db_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            # Update to processing
            async with httpx.AsyncClient() as client:
                await client.patch(
                    f"{supabase_url}/rest/v1/document_uploads?id=eq.{upload_id}",
                    json={'status': 'processing'},
                    headers=headers
                )
            
            # Extract text
            print(f"Extracting text from {filename}...")
            text = self.extract_text_from_pdf(file_path)
            
            # Chunk text
            print("Chunking text...")
            chunks = self.chunk_text(text)
            print(f"Created {len(chunks)} chunks")
            
            # Process each chunk
            successful_chunks = 0
            for i, chunk in enumerate(chunks):
                print(f"Processing chunk {i+1}/{len(chunks)}")
                
                # Generate embedding
                embedding = self.generate_embedding(chunk)
                if not embedding:
                    continue
                
                # Extract metadata
                section = self.extract_section_number(chunk)
                
                # Insert into database
                try:
                    embed_data = {
                        'content': chunk,
                        'metadata': {
                            'doc_type': doc_type,
                            'filename': filename,
                            'chunk_index': i,
                            'section': section,
                            'upload_id': upload_id,
                            'uploaded_by': user_id
                        },
                        'embedding': embedding
                    }
                    
                    async with httpx.AsyncClient() as client:
                        resp = await client.post(
                            f"{supabase_url}/rest/v1/legal_embeddings",
                            json=embed_data,
                            headers=headers
                        )
                        if resp.status_code < 400:
                            successful_chunks += 1
                        else:
                            print(f"Error inserting chunk {i}: {resp.text}")
                            
                except Exception as e:
                    print(f"Error inserting chunk {i}: {e}")
            
            # Update upload record
            async with httpx.AsyncClient() as client:
                await client.patch(
                    f"{supabase_url}/rest/v1/document_uploads?id=eq.{upload_id}",
                    json={
                        'status': 'completed',
                        'chunks_count': successful_chunks,
                        'completed_at': datetime.now().isoformat()
                    },
                    headers=headers
                )
            
            return {
                'success': True,
                'chunks_processed': successful_chunks,
                'total_chunks': len(chunks)
            }
            
        except Exception as e:
            # Update status to failed
            try:
                async with httpx.AsyncClient() as client:
                    await client.patch(
                        f"{supabase_url}/rest/v1/document_uploads?id=eq.{upload_id}",
                        json={'status': 'failed'},
                        headers=headers
                    )
            except:
                pass
            
            print(f"Error processing document: {e}")
            return {
                'success': False,
                'error': str(e)
            }
