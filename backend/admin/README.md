# Admin Module

This module handles document upload, processing, and management for the Nyaya-Setu admin portal.

## Components

### document_processor.py
Handles PDF processing, text extraction, chunking, and embedding generation.

**Key Methods:**
- `extract_text_from_pdf()` - Extracts text from PDF files
- `chunk_text()` - Splits text into overlapping chunks
- `extract_section_number()` - Identifies legal section numbers
- `generate_embedding()` - Creates embeddings using Gemini
- `process_document()` - Main pipeline for document processing

### middleware.py
Authentication and authorization for admin endpoints.

**Key Methods:**
- `verify_admin()` - Checks if user is in admin_users table
- `require_admin()` - Middleware decorator for admin-only routes

## Document Processing Pipeline

1. **Upload**: Admin uploads PDF via frontend
2. **Validation**: Check file type and size
3. **Storage**: Save temporarily to disk
4. **Extraction**: Extract text from PDF
5. **Chunking**: Split into 1000-char chunks with 200-char overlap
6. **Embedding**: Generate vector embeddings for each chunk
7. **Metadata**: Extract section numbers and document info
8. **Storage**: Insert into Supabase pgvector
9. **Cleanup**: Remove temporary files
10. **Status Update**: Mark as completed

## Database Tables

### admin_users
Stores admin user IDs for access control.

```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP
);
```

### document_uploads
Tracks uploaded documents and processing status.

```sql
CREATE TABLE document_uploads (
    id UUID PRIMARY KEY,
    filename TEXT,
    doc_type TEXT,
    chunks_count INTEGER,
    status TEXT,
    uploaded_by UUID,
    created_at TIMESTAMP,
    completed_at TIMESTAMP
);
```

## API Endpoints

All endpoints require admin authentication.

### POST /api/admin/documents/upload
Upload and process a legal document.

**Parameters:**
- `file`: PDF file (multipart/form-data)
- `doc_type`: Document category (BNS, IPC, etc.)

**Response:**
```json
{
  "success": true,
  "upload_id": "uuid",
  "filename": "document.pdf",
  "result": {
    "chunks_processed": 500,
    "total_chunks": 500
  }
}
```

### GET /api/admin/documents
List all uploaded documents.

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "filename": "BNS_2023.pdf",
      "doc_type": "BNS",
      "chunks_count": 500,
      "status": "completed",
      "created_at": "2024-01-01T00:00:00",
      "completed_at": "2024-01-01T00:05:00"
    }
  ]
}
```

### DELETE /api/admin/documents/{upload_id}
Delete document and all its embeddings.

**Response:**
```json
{
  "success": true,
  "message": "Document deleted"
}
```

### GET /api/admin/stats
Get system statistics.

**Response:**
```json
{
  "total_documents": 10,
  "total_embeddings": 5000,
  "total_cases": 150
}
```

### GET /api/admin/check
Check if current user is admin.

**Response:**
```json
{
  "is_admin": true
}
```

## Error Handling

All endpoints include comprehensive error handling:
- File validation errors
- Processing errors
- Database errors
- Authentication errors

Errors are logged to console and returned as HTTP exceptions.

## Security

- JWT token verification on all endpoints
- Admin status checked via middleware
- File type validation (PDF only)
- Temporary files cleaned up after processing
- No direct file system access from frontend

## Performance Considerations

- Large PDFs may take several minutes to process
- Processing happens synchronously (consider async for production)
- Embeddings are generated one at a time (consider batching)
- Temporary files stored on disk (consider cloud storage)

## Future Improvements

- [ ] Async processing with job queue
- [ ] Batch embedding generation
- [ ] Cloud storage for temp files
- [ ] Progress tracking via websockets
- [ ] OCR for scanned PDFs
- [ ] Document versioning
- [ ] Automatic deduplication
- [ ] Scheduled re-indexing

## Testing

To test the admin module:

1. Create an admin user (see ADMIN_SETUP.md)
2. Login and navigate to /admin
3. Upload a small test PDF
4. Verify processing completes
5. Check embeddings in database
6. Test RAG retrieval with user queries

## Dependencies

- `pypdf`: PDF text extraction
- `google-generativeai`: Embedding generation
- `supabase`: Database operations
- `fastapi`: API framework
- `python-multipart`: File upload handling

## Maintenance

Regular maintenance tasks:
- Monitor disk space for temp files
- Check Gemini API quota usage
- Review failed uploads
- Clean up old documents
- Optimize chunk sizes based on retrieval performance
