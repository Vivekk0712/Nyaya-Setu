# Admin Portal - Complete Feature List

## Overview

The Admin Portal is a secure, web-based interface for managing legal documents in the Nyaya-Setu system. It allows authorized administrators to upload, process, and manage legal documents that power the RAG (Retrieval-Augmented Generation) system.

## Key Features

### 1. Document Upload
- **Drag-and-drop or file picker interface**
- **Supported format**: PDF only
- **Document types**: BNS, IPC, CrPC, Consumer Protection Act, and custom categories
- **File validation**: Automatic PDF verification
- **Size display**: Shows file size before upload

### 2. Automatic Processing
- **Text extraction**: Extracts text from PDF using pypdf
- **Smart chunking**: Splits into 1000-character chunks with 200-character overlap
- **Sentence boundary detection**: Attempts to break at natural sentence endings
- **Section extraction**: Automatically identifies legal section numbers
- **Embedding generation**: Creates vector embeddings using Gemini
- **Batch processing**: Handles large documents efficiently

### 3. Document Management
- **List view**: Shows all uploaded documents
- **Status tracking**: Real-time status (uploading, processing, completed, failed)
- **Metadata display**: Filename, type, chunk count, timestamps
- **Delete functionality**: Remove documents and all associated embeddings
- **Search and filter**: (Future enhancement)

### 4. Statistics Dashboard
- **Total documents**: Count of uploaded documents
- **Total embeddings**: Number of vector embeddings in database
- **Total cases**: User cases created
- **Visual cards**: Clean, easy-to-read statistics

### 5. Security Features
- **Admin-only access**: Restricted to users in admin_users table
- **JWT authentication**: Secure token-based auth
- **Role verification**: Checks admin status on every request
- **Protected routes**: Frontend and backend protection
- **Audit trail**: Tracks who uploaded what and when

### 6. User Experience
- **Responsive design**: Works on desktop, tablet, and mobile
- **Real-time feedback**: Loading states and progress indicators
- **Error handling**: Clear error messages
- **Success notifications**: Confirms successful operations
- **Intuitive interface**: Clean, professional design

## Technical Architecture

### Backend Components

**Admin Module** (`backend/admin/`)
- `document_processor.py`: Core processing logic
- `middleware.py`: Authentication and authorization
- `README.md`: Technical documentation

**API Endpoints** (`backend/main.py`)
- `POST /api/admin/documents/upload`: Upload document
- `GET /api/admin/documents`: List documents
- `DELETE /api/admin/documents/{id}`: Delete document
- `GET /api/admin/stats`: Get statistics
- `GET /api/admin/check`: Check admin status

**Database Tables**
- `admin_users`: Stores admin user IDs
- `document_uploads`: Tracks upload status and metadata
- `legal_embeddings`: Stores vector embeddings (existing)

### Frontend Components

**Admin Portal Page** (`frontend/src/pages/AdminPortal.jsx`)
- Upload interface
- Document list
- Statistics dashboard
- Delete functionality

**API Service** (`frontend/src/services/api.js`)
- Admin API methods
- File upload handling
- Authentication headers

**Routing** (`frontend/src/App.jsx`)
- Protected admin route
- Admin portal integration

## Document Processing Flow

```
1. Admin selects PDF file
   ↓
2. Frontend validates file type
   ↓
3. File uploaded to backend
   ↓
4. Backend creates upload record (status: uploading)
   ↓
5. File saved temporarily
   ↓
6. Text extracted from PDF
   ↓
7. Text split into chunks
   ↓
8. For each chunk:
   - Generate embedding via Gemini
   - Extract section number
   - Store in pgvector with metadata
   ↓
9. Update upload record (status: completed)
   ↓
10. Clean up temporary file
    ↓
11. Return success to frontend
    ↓
12. Frontend refreshes document list
```

## Metadata Structure

Each embedding includes rich metadata:

```json
{
  "doc_type": "BNS",
  "filename": "Bharatiya_Nyaya_Sanhita_2023.pdf",
  "chunk_index": 42,
  "section": "Section 123",
  "upload_id": "uuid-of-upload",
  "uploaded_by": "uuid-of-admin"
}
```

## Access Control

### Making a User Admin

**Method 1: SQL**
```sql
INSERT INTO admin_users (user_id) 
VALUES ('user-uuid-from-auth-users');
```

**Method 2: Helper Script**
```bash
python backend/make_admin.py user@example.com
```

### Checking Admin Status

The system automatically checks admin status:
- On page load
- Before each admin API call
- Via middleware on backend

## Use Cases

### 1. Initial Setup
Admin uploads core legal documents (BNS, IPC, CrPC) to populate the knowledge base.

### 2. Law Updates
When laws change, admin uploads updated versions to keep system current.

### 3. Expansion
Admin adds new legal domains (labor law, family law, etc.) as needed.

### 4. Maintenance
Admin removes outdated or duplicate documents to maintain quality.

### 5. Monitoring
Admin checks statistics to ensure system has sufficient legal knowledge.

## Performance Metrics

**Typical Processing Times:**
- Small document (10 pages): 30 seconds
- Medium document (100 pages): 3-5 minutes
- Large document (500 pages): 15-20 minutes

**Chunk Statistics:**
- Average chunks per page: 2-3
- Embedding generation: ~1 second per chunk
- Database insertion: ~0.1 seconds per chunk

## Error Handling

The system handles various error scenarios:

**Upload Errors:**
- Invalid file type → "Only PDF files allowed"
- File too large → Size limit error
- Network failure → Retry suggestion

**Processing Errors:**
- PDF extraction failure → Detailed error message
- Gemini API error → API status and retry info
- Database error → Connection troubleshooting

**Authentication Errors:**
- Not logged in → Redirect to login
- Not admin → Redirect to dashboard
- Token expired → Re-authentication prompt

## Best Practices

### For Admins

1. **Test First**: Upload a small test document before large files
2. **Descriptive Names**: Use clear filenames (e.g., "BNS_2023_Complete.pdf")
3. **Quality PDFs**: Use text-based PDFs, not scanned images
4. **Monitor Status**: Check processing status regularly
5. **Clean Up**: Delete old versions when uploading updates

### For Developers

1. **Backup Database**: Before bulk uploads
2. **Monitor Logs**: Watch backend console during processing
3. **Check Quotas**: Monitor Gemini API usage
4. **Test Retrieval**: Verify embeddings work after upload
5. **Document Changes**: Update metadata structure carefully

## Future Enhancements

### Planned Features
- [ ] Batch upload multiple files
- [ ] Real-time progress bar
- [ ] Document preview before upload
- [ ] Search within documents
- [ ] Export embeddings
- [ ] Document versioning
- [ ] OCR for scanned PDFs
- [ ] Automatic law update detection

### Advanced Features
- [ ] Async processing with job queue
- [ ] Webhook notifications
- [ ] Document comparison
- [ ] Quality scoring
- [ ] Automatic categorization
- [ ] Multi-language document support

## Troubleshooting

### Common Issues

**"Admin access required"**
- Solution: Verify user is in admin_users table

**Upload fails silently**
- Solution: Check backend logs, verify Gemini API key

**Processing stuck at "processing"**
- Solution: Check for errors in backend console, restart if needed

**Embeddings not retrievable**
- Solution: Verify pgvector extension enabled, test match_legal_documents function

**Slow processing**
- Solution: Normal for large files, consider smaller chunks or async processing

## Support Resources

- **Setup Guide**: [ADMIN_SETUP.md](ADMIN_SETUP.md)
- **Technical Docs**: [backend/admin/README.md](backend/admin/README.md)
- **Main README**: [README.md](README.md)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)

## Conclusion

The Admin Portal is a powerful tool for managing the legal knowledge base that powers Nyaya-Setu. With automatic processing, secure access control, and comprehensive monitoring, it enables efficient management of legal documents at scale.

For questions or issues, refer to the documentation or check the backend logs for detailed error information.
