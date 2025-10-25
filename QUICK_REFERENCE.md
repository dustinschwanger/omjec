# RAG Chat System - Quick Reference Guide

## Key File Locations

### Frontend
- `/components/ChatWidget/ChatWidget.tsx` - Main chat UI (floating widget)
- `/contexts/ChatContext.tsx` - Session token management
- `/components/DocumentUploadModal.tsx` - Admin doc upload
- `/components/DocumentViewModal.tsx` - Document preview

### API Routes
- `/app/api/chat/stream/route.ts` - Streaming chat (POST)
- `/app/api/chat/history/route.ts` - Chat history (GET)
- `/app/api/documents/upload/route.ts` - Upload doc (POST, admin)
- `/app/api/documents/process/[id]/route.ts` - Process doc (POST)
- `/app/api/documents/download/[id]/route.ts` - Download doc (GET)
- `/app/api/analytics/queries/route.ts` - Analytics (GET)

### Libraries
- `/lib/pinecone.ts` - Pinecone client & index access
- `/lib/openai.ts` - OpenAI embeddings & chat
- `/lib/supabase.ts` - Database client (anon & admin)
- `/lib/document-processor.ts` - Full processing pipeline
- `/lib/text-extraction.ts` - PDF, image, Word extraction
- `/lib/chunking.ts` - Text chunking algorithm
- `/lib/chat-analytics.ts` - Analytics helpers

## Tech Stack Summary

```
Frontend:     React 19 + TypeScript + Tailwind CSS
Backend:      Next.js 15 (App Router)
Database:     Supabase (PostgreSQL)
Vector DB:    Pinecone (1536 dimensions)
LLM:          OpenAI GPT-4o-mini
Embeddings:   OpenAI text-embedding-3-small
Deployment:   Railway (Node.js 20)
```

## Core Features

### 1. RAG Chat System
- Anonymous session-based chat
- Real-time streaming responses (SSE)
- Document-augmented answers
- Chat history persistence
- Analytics tracking

### 2. Document Management
- Admin upload (PDF, DOCX, Images)
- Automatic text extraction
- Semantic chunking (500 tokens, 200 char overlap)
- Embedding generation & Pinecone indexing
- Download tracking

### 3. Admin Panel
- Document upload/delete
- Processing status monitoring
- Download statistics
- Analytics dashboard

## Request/Response Examples

### Chat API
```bash
POST /api/chat/stream
{
  "message": "How do I apply for jobs?",
  "sessionToken": "550e8400-e29b-41d4-a716-446655440000"
}

Response: Server-Sent Events
data: {"content":"Here are some ways..."}
data: {"content":"to apply..."}
data: {"done":true}
```

### Upload API
```bash
POST /api/documents/upload
Authorization: Bearer jwt-token-here

Content-Type: multipart/form-data
- file: binary
- title: "Resume Guide"
- type: "job-seeker-guide"
- isDownloadable: "true"

Response:
{
  "success": true,
  "document": {
    "id": "uuid",
    "status": "processing"
  }
}
```

## Database Schema Essentials

```sql
chat_sessions
  ├─ id (UUID)
  └─ session_token (TEXT, UNIQUE)

chat_messages
  ├─ id (UUID)
  ├─ session_id (UUID FK)
  ├─ role ('user' | 'assistant')
  └─ content (TEXT)

documents
  ├─ id (UUID)
  ├─ title (TEXT)
  ├─ status ('processing'|'processed'|'failed')
  ├─ content (TEXT)
  ├─ storage_path (TEXT)
  ├─ public_url (TEXT)
  ├─ is_downloadable (BOOLEAN)
  └─ metadata (JSONB)

document_chunks
  ├─ id (UUID)
  ├─ document_id (UUID FK)
  ├─ content (TEXT)
  ├─ chunk_index (INTEGER)
  ├─ embedding_id (TEXT) ← Pinecone ID
  └─ metadata (JSONB)

chat_analytics
  ├─ id (UUID)
  ├─ query_text (TEXT, anonymized)
  ├─ query_category (TEXT)
  ├─ query_topics (TEXT[])
  ├─ word_count (INTEGER)
  ├─ response_time_ms (INTEGER)
  └─ sources_used (JSONB)
```

## Processing Pipeline (7 Steps)

```
1. Download file from Supabase storage
2. Extract text (PDF/Image/Word)
3. Clean & validate text
4. Create semantic chunks (500 tokens)
5. Generate embeddings (OpenAI batch)
6. Store in Pinecone + Supabase
7. Update status to 'processed'
```

## RAG Flow (Simplified)

```
User Query
    ↓
Generate Embedding (OpenAI)
    ↓
Search Pinecone (top-5, cosine)
    ↓
Fetch Chunks from Supabase
    ↓
Filter by Score (≥0.5)
    ↓
Build Context String
    ↓
Stream Response with Context
    ↓
Save & Track Analytics
```

## Environment Variables

### Required
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

PINECONE_API_KEY=...
PINECONE_INDEX_NAME=omjec
PINECONE_INDEX_HOST=...

OPENAI_API_KEY=...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Key Functions

### Chat Streaming
```typescript
POST /api/chat/stream
- getRelevantContext(message) → context string
- getChatCompletionStream(messages) → OpenAI stream
- Save messages & analytics
```

### Document Processing
```typescript
processDocument(doc)
- extractText(buffer, mimeType) → plain text
- chunkText(text, metadata) → chunks[]
- generateEmbedding(text) → 1536-dim vector
- Store in Pinecone & Supabase
```

### Analytics
```typescript
- anonymizeQuery(text) → removes PII
- categorizeQuery(text) → job_search | career_guidance | ...
- extractTopics(text) → [topic1, topic2, ...]
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No docs returned | Empty index | Upload & process documents |
| ID mismatch | Format inconsistency | Check embedding_id format |
| Processing fails | Text too short | Ensure extracted text > 10 chars |
| Streaming breaks | Network timeout | Implement client retry |
| Auth fails | Invalid token | Verify admin_users record |

## Deployment Checklist

- [ ] Set up Supabase project & run schema.sql
- [ ] Create Pinecone index (1536 dimensions)
- [ ] Get OpenAI API key
- [ ] Deploy to Railway
- [ ] Set all environment variables
- [ ] Update NEXT_PUBLIC_SITE_URL after deployment
- [ ] Create admin user in Supabase Auth
- [ ] Add user to admin_users table
- [ ] Test document upload
- [ ] Test chat functionality
- [ ] Verify analytics tracking

## Performance Notes

- Chat response time: 2-4 seconds
- Document processing: 30 seconds - 5 minutes
- Chunk size: ~2000 characters (500 tokens)
- Embedding cost: $0.02 per 1M tokens
- Relevance threshold: 0.5
- Top-K search: 5 documents

## Security Model

```
Public Access:
├─ Chat (anonymous, session token)
├─ Download (processed docs only)
└─ Read document chunks

Admin Access:
├─ Upload documents (Bearer token)
├─ Manage documents (RLS enforced)
├─ View analytics (RLS enforced)
└─ Process documents (manual trigger)

Database:
├─ RLS policies enforce access
├─ Public documents readable only when processed
├─ Admin_users table gatekeeps mutations
└─ Service key used for admin operations
```

## Streaming Example (Client-Side)

```typescript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, sessionToken })
})

const reader = response.body?.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  const lines = chunk.split('\n')

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6))
      if (data.content) {
        // Append to message UI
      }
      if (data.done) break
    }
  }
}
```

## Testing Commands

```bash
# Local development
npm run dev

# Build
npm run build

# Production start
npm start

# Linting
npm run lint
```

## Key Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Webpack, images, external packages |
| `railway.json` | Railway build/deploy config |
| `nixpacks.toml` | Nixpacks build definition |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Tailwind CSS config |
| `package.json` | Dependencies & scripts |
| `supabase-schema.sql` | Full DB schema |

---

**Status:** Production Ready
**Last Updated:** October 24, 2025
**Maintainer:** Development Team

