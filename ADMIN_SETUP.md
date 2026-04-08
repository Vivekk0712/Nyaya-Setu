# Admin Portal Setup Guide

The admin portal allows authorized users to upload legal documents (PDFs) that are automatically processed, chunked, embedded, and stored in the pgvector database for RAG retrieval.

## Features

- Upload PDF documents (BNS, IPC, CrPC, Consumer Protection Act, etc.)
- Automatic text extraction and chunking
- Automatic embedding generation using Gemini
- Vector storage in Supabase pgvector
- View all uploaded documents
- Delete documents and their embeddings
- View system statistics

## Setup Steps

### 1. Database Schema

The admin tables are already included in `backend/database/schema.sql`. Make sure you've run the full schema.

Key tables:
- `admin_users` - Stores admin user IDs
- `document_uploads` - Tracks uploaded documents and processing status

### 2. Make a User Admin

To grant admin access to a user:

1. Sign up the user normally through the app
2. Go to Supabase Dashboard > Authentication > Users
3. Find the user and copy their User ID
4. Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO admin_users (user_id) 
VALUES ('paste-user-id-here');
```

Alternatively, use the helper script:
```bash
cd backend
python make_admin.py user@example.com
```

### 3. Access Admin Portal

1. Login with an admin account
2. You'll see an "Admin Portal" button in the dashboard header
3. Click it to access the admin interface

Or directly navigate to: `http://localhost:5173/admin`

## Using the Admin Portal

### Upload Documents

1. Select document type (BNS, IPC, CrPC, etc.)
2. Choose a PDF file
3. Click "Upload and Process"
4. Wait for processing to complete (may take a few minutes)

The system will:
- Extract text from the PDF
- Split into chunks (1000 chars with 200 char overlap)
- Generate embeddings for each chunk
- Store in pgvector database
- Extract section numbers automatically

### View Documents

The documents list shows:
- Filename and document type
- Processing status (uploading, processing, completed, failed)
- Number of chunks created
- Upload and completion timestamps

### Delete Documents

Click "Delete" on any document to remove it and all its embeddings from the database.

### View Statistics

The dashboard shows:
- Total documents uploaded
- Total embeddings in database
- Total cases created by users

## Document Processing Details

### Chunking Strategy

- Chunk size: 1000 characters
- Overlap: 200 characters
- Attempts to break at sentence boundaries
- Preserves context across chunks

### Metadata Stored

Each embedding includes:
- `doc_type`: Document category (BNS, IPC, etc.)
- `filename`: Original filename
- `chunk_index`: Position in document
- `section`: Extracted section number
- `upload_id`: Reference to upload record
- `uploaded_by`: Admin user ID

### Section Extraction

The system automatically extracts section numbers using patterns:
- "Section 123"
- "Sec. 123A"
- "§ 123"
- "Chapter 5"

## API Endpoints

All admin endpoints require authentication and admin privileges:

- `GET /api/admin/check` - Check if user is admin
- `POST /api/admin/documents/upload` - Upload document
- `GET /api/admin/documents` - List all documents
- `DELETE /api/admin/documents/{id}` - Delete document
- `GET /api/admin/stats` - Get system statistics

## Security

- Only users in `admin_users` table can access admin endpoints
- All endpoints verify admin status via middleware
- File uploads are validated (PDF only)
- Temporary files are cleaned up after processing
- Row Level Security (RLS) protects user data

## Troubleshooting

### "Admin access required" error
- Verify user is in `admin_users` table
- Check user is logged in
- Ensure JWT token is valid

### Upload fails
- Check file is valid PDF
- Verify Gemini API key is set
- Check backend logs for errors
- Ensure sufficient disk space for temp files

### Processing stuck
- Check backend console for errors
- Verify Gemini API quota
- Check Supabase connection
- Large files may take several minutes

### Embeddings not retrievable
- Verify pgvector extension is enabled
- Check `match_legal_documents` function exists
- Ensure embeddings table has data
- Test with direct SQL query

## Best Practices

1. **Document Naming**: Use descriptive filenames (e.g., "BNS_2023_Complete.pdf")
2. **Document Quality**: Use text-based PDFs, not scanned images
3. **File Size**: Keep files under 50MB for faster processing
4. **Testing**: Upload a small test document first
5. **Monitoring**: Check processing status regularly
6. **Cleanup**: Delete old/duplicate documents to save space

## Sample Documents to Upload

Recommended legal documents:
- Bharatiya Nyaya Sanhita (BNS) 2023
- Indian Penal Code (IPC)
- Criminal Procedure Code (CrPC)
- Consumer Protection Act 2019
- Information Technology Act
- Motor Vehicles Act

## Future Enhancements

- Batch upload multiple files
- Progress bar for processing
- Preview document before upload
- Search within uploaded documents
- Export embeddings
- Document versioning
- OCR for scanned PDFs
- Automatic updates when laws change

## Support

For issues or questions:
1. Check backend logs: `python main.py`
2. Check browser console for frontend errors
3. Verify Supabase connection
4. Test Gemini API separately
5. Review this documentation

## Example Workflow

1. Admin logs in
2. Navigates to Admin Portal
3. Selects "BNS" as document type
4. Uploads "Bharatiya_Nyaya_Sanhita_2023.pdf"
5. System processes 500 chunks in 5 minutes
6. Document shows as "completed" with 500 chunks
7. Users can now query BNS laws via RAG
8. AI agents retrieve relevant sections automatically

That's it! Your admin portal is ready to manage legal documents for the Nyaya-Setu system.
