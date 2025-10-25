# RAG AI Chat System - Complete Implementation Guide

> **Purpose**: This is a master guide for replicating the RAG (Retrieval-Augmented Generation) AI chat functionality from the OhioMeansJobs Huron County website to any other application.

## Documentation Overview

This guide is part of a complete documentation suite:

1. **RAG_IMPLEMENTATION_GUIDE.md** (this file) - Start here! Step-by-step implementation guide
2. **RAG_ARCHITECTURE_REPORT.md** - Comprehensive technical architecture (49KB, 1,687 lines)
3. **QUICK_REFERENCE.md** - Quick lookup guide for common tasks
4. **FILE_STRUCTURE.txt** - Complete file inventory with absolute paths

---

## Table of Contents

- [Quick Overview](#quick-overview)
- [What is RAG?](#what-is-rag)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Railway Deployment Guide](#railway-deployment-guide)
- [Code Examples](#code-examples)
- [Testing & Validation](#testing--validation)
- [Cost Analysis](#cost-analysis)
- [Troubleshooting](#troubleshooting)

---

## Quick Overview

The RAG AI chat system is a production-ready intelligent chatbot that:

- **Answers questions** using knowledge from uploaded documents (PDFs, Word docs, images)
- **Streams responses** in real-time using Server-Sent Events (SSE)
- **Tracks conversations** anonymously using session tokens
- **Provides download links** to relevant documents in chat responses
- **Processes documents** automatically through a 7-step pipeline
- **Scales automatically** on Railway's serverless platform

**Key Features:**
- ✅ Anonymous chat (no login required)
- ✅ Real-time streaming responses
- ✅ Document-augmented answers (RAG)
- ✅ Admin panel for document management
- ✅ Analytics dashboard
- ✅ Automatic document processing
- ✅ Download tracking
- ✅ Privacy-first (PII anonymization)

---

## What is RAG?

**RAG = Retrieval-Augmented Generation**

Instead of relying solely on an AI model's training data, RAG systems:

1. **Retrieve** relevant documents from a knowledge base
2. **Augment** the AI prompt with document context
3. **Generate** responses based on both the model's knowledge AND the retrieved documents

**Why RAG?**
- ✅ Up-to-date information (documents can be updated anytime)
- ✅ Accurate, source-backed answers
- ✅ Reduced AI hallucinations
- ✅ Cost-effective (no model fine-tuning needed)
- ✅ Transparent (can cite sources)

**How it works in this system:**

```
User asks: "How do I write a resume?"
    ↓
System embeds question → [0.023, -0.456, ..., 0.789] (1536-dim vector)
    ↓
Search Pinecone vector database → Find top-5 similar document chunks
    ↓
Fetch chunks from Supabase → "Resume Writing Guide" (sections 2.1, 2.3, 4.5)
    ↓
Build context → Include document text + download link
    ↓
Send to OpenAI GPT-4o-mini → "Based on our Resume Writing Guide..."
    ↓
Stream response to user → Real-time chat message with download link
```

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ChatWidget Component                                   │ │
│  │  - Floating chat button (bottom-right)                 │ │
│  │  - Real-time streaming display                         │ │
│  │  - Markdown formatting                                 │ │
│  │  - Session token management (localStorage)            │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │ POST /api/chat/stream
                        │ {message, sessionToken}
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Node.js 20)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /api/chat/stream                                      │ │
│  │  1. Generate embedding of user question                │ │
│  │  2. Query Pinecone (vector search)                     │ │
│  │  3. Fetch chunks from Supabase                         │ │
│  │  4. Build context with documents                       │ │
│  │  5. Stream response from OpenAI                        │ │
│  │  6. Save messages & analytics                          │ │
│  └────────────────────────────────────────────────────────┘ │
└───────┬─────────────────┬─────────────────┬─────────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌─────────────┐
│  Pinecone    │  │  Supabase    │  │   OpenAI    │
│ (Vector DB)  │  │ (PostgreSQL) │  │   (LLM)     │
│              │  │              │  │             │
│ - Embeddings │  │ - Documents  │  │ - Chat GPT  │
│ - Semantic   │  │ - Chunks     │  │ - Embeddings│
│   search     │  │ - Chat logs  │  │             │
│ - Metadata   │  │ - Analytics  │  │             │
└──────────────┘  └──────────────┘  └─────────────┘
```

### Data Flow: Chat Request

```
1. User types message in ChatWidget
   ↓
2. POST /api/chat/stream
   - Save user message to DB
   - Generate embedding (OpenAI text-embedding-3-small)
   ↓
3. Query Pinecone
   - Vector similarity search
   - Top-5 results with scores
   - Filter by relevance (>= 0.5)
   ↓
4. Fetch from Supabase
   - Get full chunk content
   - Get document metadata
   - Build download URLs
   ↓
5. Build prompt
   - System prompt (office info, instructions)
   - Context (document chunks + download links)
   - Conversation history (last 8 messages)
   - Current user message
   ↓
6. Stream from OpenAI
   - GPT-4o-mini model
   - Temperature: 0.7
   - Max tokens: 4000
   - Stream: true
   ↓
7. Pipe to browser via SSE
   - data: {"content": "text"}
   - Progressive display
   ↓
8. Save & track
   - Save assistant message
   - Log analytics (anonymized)
   - Update session timestamp
```

---

## Tech Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Frontend** | React | 19.2.0 | UI library |
| **Framework** | Next.js | 15.5.6 | React framework with App Router |
| **Language** | TypeScript | 5.9.3 | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 4.1.14 | Utility-first CSS |
| **Database** | Supabase | (PostgreSQL) | Document storage, chat history |
| **Vector DB** | Pinecone | 6.1.2 | Semantic search (1536-dim) |
| **LLM** | OpenAI | GPT-4o-mini | Chat completions |
| **Embeddings** | OpenAI | text-embedding-3-small | Document embeddings |
| **Deployment** | Railway | - | Serverless platform |
| **Runtime** | Node.js | 20.16.0+ | Server runtime |

### Document Processing

| Task | Library | Version | Purpose |
|------|---------|---------|---------|
| PDF extraction | pdf-parse | 2.4.4 | Extract text from PDFs |
| Word docs | mammoth | 1.11.0 | Extract from DOCX files |
| OCR (images) | tesseract.js | 6.0.1 | Extract text from JPG/PNG |
| File uploads | react-dropzone | 14.3.8 | Drag-and-drop UI |

### Utilities

- **react-markdown** 10.1.0 - Render markdown in chat
- **uuid** 13.0.0 - Session token generation
- **server-only** 0.0.1 - Type safety for server code

---

## Step-by-Step Implementation

### Prerequisites

Before starting, you'll need accounts and API keys for:

1. **Supabase** (free tier available)
   - Sign up at https://supabase.com
   - Create a new project
   - Note your project URL and API keys

2. **Pinecone** (free tier: 100K vectors)
   - Sign up at https://www.pinecone.io
   - Create a serverless index
   - Dimensions: **1536**
   - Metric: **cosine**

3. **OpenAI** (pay-as-you-go)
   - Sign up at https://platform.openai.com
   - Add payment method
   - Generate API key

4. **Railway** (free trial available)
   - Sign up at https://railway.app
   - Connect GitHub account

### Step 1: Set Up Supabase Database

**1.1 Create Supabase Project**
- Go to https://supabase.com/dashboard
- Click "New Project"
- Choose organization, name, password, region
- Wait for provisioning (~2 minutes)

**1.2 Run Database Schema**

Copy the schema from `supabase-schema.sql` (in project) or use this essential schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat Sessions (anonymous users)
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  type TEXT, -- job-seeker-guide, employer-info, youth-program, event, general
  content TEXT,
  content_preview TEXT,
  status TEXT DEFAULT 'processing', -- processing, processed, failed
  file_size INTEGER,
  storage_path TEXT,
  public_url TEXT,
  is_downloadable BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Chunks (for RAG)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding_id TEXT, -- FK to Pinecone vector ID
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Analytics
CREATE TABLE chat_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_text TEXT,
  query_category TEXT,
  query_topics TEXT[],
  word_count INTEGER,
  response_time_ms INTEGER,
  has_web_search BOOLEAN DEFAULT FALSE,
  sources_used JSONB,
  error_occurred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Downloads (tracking)
CREATE TABLE document_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  download_count INTEGER DEFAULT 1,
  last_downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_chat_analytics_created_at ON chat_analytics(created_at DESC);
CREATE INDEX idx_chat_sessions_token ON chat_sessions(session_token);

-- Row-Level Security (RLS)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;

-- Public access for chat
CREATE POLICY "Anyone can create sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read sessions" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read messages" ON chat_messages FOR SELECT USING (true);

-- Public can read processed documents
CREATE POLICY "Public can read processed documents"
  ON documents FOR SELECT USING (status = 'processed');

CREATE POLICY "Public can read chunks"
  ON document_chunks FOR SELECT USING (true);

-- Analytics: Anyone can write (anonymized)
CREATE POLICY "Anyone can write analytics"
  ON chat_analytics FOR INSERT WITH CHECK (true);

-- Admin only: Document management
CREATE POLICY "Admins can manage documents"
  ON documents FOR ALL
  USING (auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true));

CREATE POLICY "Admins can manage chunks"
  ON document_chunks FOR ALL
  USING (auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true));

CREATE POLICY "Admins can read analytics"
  ON chat_analytics FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true));
```

**1.3 Create Storage Bucket**
- Go to Storage → Create bucket
- Name: `documents`
- Public bucket: Yes
- Configure policies:

```sql
-- Public can read
CREATE POLICY "Public can read document files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Admins can upload
CREATE POLICY "Admins can upload document files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true)
  );
```

**1.4 Create Admin User**
- Go to Authentication → Add user
- Enter email and password
- Copy the user UUID
- Run in SQL Editor:

```sql
INSERT INTO admin_users (auth_id, email, is_active)
VALUES ('paste-uuid-here', 'your-email@example.com', true);
```

### Step 2: Set Up Pinecone Index

**2.1 Create Index**
- Go to https://app.pinecone.io
- Click "Create Index"
- Name: `your-app-name` (e.g., `omjec`)
- Dimensions: **1536** (critical!)
- Metric: **cosine**
- Environment: Choose closest region
- Plan: Starter (free) or Serverless

**2.2 Get API Key and Host**
- Go to API Keys
- Copy your API key
- Go to your index → Copy the index host URL
  - Example: `https://your-index-abc123.svc.aped-4627-b74a.pinecone.io`

### Step 3: Get OpenAI API Key

**3.1 Create API Key**
- Go to https://platform.openai.com/api-keys
- Click "Create new secret key"
- Name: "RAG Chat System"
- Copy the key (starts with `sk-proj-...`)

**3.2 Add Payment Method**
- Go to Settings → Billing
- Add credit card
- Set usage limits (optional but recommended)

### Step 4: Clone and Configure Next.js Project

**4.1 Create New Next.js Project**

```bash
# Option A: Start fresh
npx create-next-app@latest my-rag-chat --typescript --tailwind --app

# Option B: Clone from existing project
git clone <your-repo> my-rag-chat
cd my-rag-chat
```

**4.2 Install Dependencies**

```bash
npm install @pinecone-database/pinecone@6.1.2
npm install @supabase/supabase-js@2.75.1
npm install @supabase/auth-helpers-nextjs@0.10.0
npm install @supabase/ssr@0.7.0
npm install openai@6.5.0
npm install pdf-parse@2.4.4
npm install mammoth@1.11.0
npm install tesseract.js@6.0.1
npm install react-dropzone@14.3.8
npm install react-markdown@10.1.0
npm install uuid@13.0.0
npm install server-only@0.0.1
```

**4.3 Configure Environment Variables**

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=your-index-name
PINECONE_INDEX_HOST=https://your-index.pinecone.io

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
OPENAI_CHAT_MODEL=gpt-4o-mini

# Site (update after Railway deployment)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 5: Copy Core Files

Copy these essential files from the Huron County Means Jobs project:

**5.1 Library Files**
```
/lib/pinecone.ts          → Pinecone client initialization
/lib/openai.ts            → OpenAI API calls
/lib/supabase.ts          → Supabase clients (anon & admin)
/lib/supabase-auth.ts     → Auth helpers
/lib/document-processor.ts → Document processing pipeline
/lib/text-extraction.ts   → PDF/Image/Word extraction
/lib/chunking.ts          → Semantic chunking
/lib/chat-analytics.ts    → Analytics helpers
```

**5.2 API Routes**
```
/app/api/chat/stream/route.ts         → Chat streaming endpoint
/app/api/chat/history/route.ts        → Chat history
/app/api/documents/upload/route.ts    → Document upload
/app/api/documents/process/[id]/route.ts → Process documents
/app/api/documents/download/[id]/route.ts → Download tracking
/app/api/analytics/queries/route.ts   → Analytics
```

**5.3 Components**
```
/components/ChatWidget/ChatWidget.tsx → Main chat UI
/components/ChatWidget/ChatWidget.module.css → Chat styles
/contexts/ChatContext.tsx             → Session management
/components/DocumentUploadModal.tsx   → Admin upload UI
```

**5.4 Configuration**
```
next.config.js    → Next.js config
tsconfig.json     → TypeScript config
tailwind.config.ts → Tailwind config
```

### Step 6: Customize for Your Application

**6.1 Update System Prompt**

Edit `/app/api/chat/stream/route.ts` and customize the system prompt:

```typescript
const systemPrompt = `You are a helpful assistant for [YOUR ORGANIZATION NAME].

Our office is located at: [ADDRESS]
Phone: [PHONE]
Email: [EMAIL]
Hours: [HOURS]

We provide:
- [SERVICE 1]
- [SERVICE 2]
- [SERVICE 3]

When providing information from documents, always format download links like this:
[📄 Document Name](download-url)

Be friendly, professional, and concise.`
```

**6.2 Update Document Types**

Edit your schema and forms to match your document categories:

```typescript
// Current categories (customize as needed)
type DocumentType =
  | 'job-seeker-guide'
  | 'employer-info'
  | 'youth-program'
  | 'event'
  | 'general'
```

**6.3 Update UI Branding**

- Customize colors in `tailwind.config.ts`
- Update ChatWidget icon and styling
- Modify header/footer components
- Adjust chat widget positioning

### Step 7: Test Locally

**7.1 Start Development Server**

```bash
npm run dev
```

Visit http://localhost:3000

**7.2 Test Admin Panel**

- Go to `/admin/login`
- Sign in with Supabase credentials
- Upload a test PDF
- Wait for processing
- Check document status

**7.3 Test Chat**

- Click chat widget
- Ask a question
- Verify streaming response
- Check if documents are retrieved
- Test download links

**7.4 Verify Database**

Check Supabase:
- `documents` table has records
- `document_chunks` table has chunks
- `chat_sessions` created
- `chat_messages` saved

**7.5 Verify Pinecone**

- Go to Pinecone dashboard
- Check index stats (vector count should match chunks)
- Test query in Pinecone console

---

## Railway Deployment Guide

### Overview

Railway is a modern platform-as-a-service (PaaS) that deploys Next.js apps with zero configuration. It:

- ✅ Auto-detects Next.js
- ✅ Builds and deploys automatically
- ✅ Provides HTTPS domains
- ✅ Scales automatically
- ✅ Offers generous free tier

### Step 1: Prepare Repository

**1.1 Create `.gitignore`**

```
node_modules/
.next/
.env
.env.local
.env*.local
out/
build/
.DS_Store
*.log
```

**1.2 Create Railway Configuration**

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

**1.3 Commit and Push**

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Create Railway Project

**2.1 Sign Up for Railway**
- Go to https://railway.app
- Click "Start a New Project"
- Connect GitHub account

**2.2 Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository
- Click "Deploy Now"

### Step 3: Configure Environment Variables

**3.1 Add Variables in Railway Dashboard**

Go to your project → Variables → Raw Editor:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=omjec
PINECONE_INDEX_HOST=https://omjec-abc123.svc.pinecone.io

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
OPENAI_CHAT_MODEL=gpt-4o-mini

# Site (update after getting Railway URL)
NEXT_PUBLIC_SITE_URL=https://your-app.railway.app
```

**3.2 Get Railway URL**
- Wait for deployment to complete
- Copy your Railway URL (e.g., `https://your-app.up.railway.app`)
- Update `NEXT_PUBLIC_SITE_URL` in Railway variables
- Redeploy (Railway auto-deploys on variable change)

### Step 4: Verify Deployment

**4.1 Check Build Logs**
- Go to Deployments → Latest deployment
- Check logs for errors
- Verify build completed successfully

**4.2 Test Production Site**
- Visit your Railway URL
- Test chat widget
- Upload document (if admin panel configured)
- Check chat responses

**4.3 Monitor Performance**
- Go to Metrics tab
- Check response times
- Monitor memory usage
- Check for errors

### Step 5: Set Up Custom Domain (Optional)

**5.1 Add Domain in Railway**
- Go to Settings → Domains
- Click "Add Custom Domain"
- Enter your domain (e.g., `chat.yourdomain.com`)

**5.2 Update DNS**
- Add CNAME record in your DNS provider:
  ```
  Type: CNAME
  Name: chat (or your subdomain)
  Value: your-app.up.railway.app
  TTL: Auto
  ```

**5.3 Update Environment Variable**
- Update `NEXT_PUBLIC_SITE_URL` to your custom domain
- Redeploy

### Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] railway.json and nixpacks.toml created
- [ ] Railway project created
- [ ] All environment variables set
- [ ] NEXT_PUBLIC_SITE_URL updated with Railway URL
- [ ] Build completed successfully
- [ ] Site accessible via Railway URL
- [ ] Chat widget functional
- [ ] Documents can be uploaded
- [ ] Admin panel accessible
- [ ] Custom domain configured (optional)

### Common Deployment Issues

**Build Fails - "Module not found"**
```bash
Solution:
- Check package.json has all dependencies
- Run `npm install` locally first
- Push updated package-lock.json
```

**Runtime Error - "Cannot find module"**
```bash
Solution:
- Verify import paths use correct case
- Check file extensions (.ts vs .tsx)
- Ensure server-only code uses 'server-only' package
```

**Environment Variables Not Working**
```bash
Solution:
- Verify all variables are set in Railway dashboard
- Check for typos in variable names
- Redeploy after adding/changing variables
- Use NEXT_PUBLIC_ prefix for client-side vars
```

**Chat Not Working**
```bash
Solution:
- Check OpenAI API key is valid
- Verify Pinecone index exists and is accessible
- Check Supabase RLS policies allow public chat access
- Review Railway logs for errors
```

---

## Code Examples

### Core Chat Endpoint (Simplified)

```typescript
// /app/api/chat/stream/route.ts
import { NextRequest } from 'next/server'
import { getRelevantContext } from '@/lib/pinecone'
import { getChatCompletionStream } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const { message, sessionToken } = await request.json()

  // 1. Get or create session
  const session = await getOrCreateSession(sessionToken)

  // 2. Save user message
  await saveMessage(session.id, 'user', message)

  // 3. Get relevant documents via RAG
  const context = await getRelevantContext(message)

  // 4. Fetch conversation history
  const history = await getChatHistory(session.id, 8)

  // 5. Build messages array
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `Context:\n${context}` },
    ...history,
    { role: 'user', content: message }
  ]

  // 6. Stream response from OpenAI
  const stream = await getChatCompletionStream(messages)

  // 7. Pipe to client via SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

### RAG Context Retrieval

```typescript
// /lib/pinecone.ts
export async function getRelevantContext(query: string): Promise<string> {
  // 1. Generate embedding for user query
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })

  const queryVector = embedding.data[0].embedding

  // 2. Query Pinecone for similar vectors
  const pineconeResults = await index.query({
    vector: queryVector,
    topK: 5,
    includeMetadata: true
  })

  // 3. Filter by relevance score
  const relevantMatches = pineconeResults.matches.filter(
    match => match.score >= 0.5
  )

  if (relevantMatches.length === 0) {
    return 'No relevant documents found.'
  }

  // 4. Fetch full chunks from Supabase
  const embeddingIds = relevantMatches.map(m => m.id)
  const { data: chunks } = await supabase
    .from('document_chunks')
    .select('*, documents(*)')
    .in('embedding_id', embeddingIds)

  // 5. Build context string
  const contextParts = chunks.map(chunk => {
    const downloadUrl = chunk.documents.is_downloadable
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/documents/download/${chunk.document_id}`
      : null

    return `[${chunk.documents.title}]${downloadUrl ? ` 📄 DOWNLOADABLE: ${downloadUrl}` : ''}\n${chunk.content}`
  })

  return contextParts.join('\n\n---\n\n')
}
```

### Document Processing Pipeline

```typescript
// /lib/document-processor.ts
export async function processDocument(document: Document) {
  try {
    // 1. Download file from Supabase storage
    const fileBuffer = await downloadFile(document.storage_path)

    // 2. Extract text
    const text = await extractText(fileBuffer, document.metadata.mimeType)

    // 3. Update document with extracted text
    await updateDocument(document.id, {
      content: text,
      content_preview: text.slice(0, 500)
    })

    // 4. Create semantic chunks
    const chunks = await chunkText(text, {
      documentId: document.id,
      documentTitle: document.title,
      documentType: document.type,
      isDownloadable: document.is_downloadable
    })

    // 5. Generate embeddings and store in Pinecone
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i].content)

      const embeddingId = `${document.id}_chunk_${i}`

      await index.upsert([{
        id: embeddingId,
        values: embedding,
        metadata: {
          document_id: document.id,
          document_title: document.title,
          chunk_index: i,
          total_chunks: chunks.length,
          is_downloadable: document.is_downloadable
        }
      }])

      // Add small delay to respect rate limits
      await delay(200)
    }

    // 6. Store chunks in Supabase
    await storeChunks(chunks)

    // 7. Update document status
    await updateDocument(document.id, { status: 'processed' })

  } catch (error) {
    await updateDocument(document.id, {
      status: 'failed',
      metadata: { error: error.message }
    })
    throw error
  }
}
```

### Chat Widget Component

```typescript
// /components/ChatWidget/ChatWidget.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import ReactMarkdown from 'react-markdown'

export function ChatWidget() {
  const { sessionToken, isOpen, setIsOpen } = useChatContext()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Fetch history on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchHistory()
    }
  }, [isOpen])

  async function fetchHistory() {
    const res = await fetch(`/api/chat/history?sessionToken=${sessionToken}`)
    const data = await res.json()
    setMessages(data.messages)
  }

  async function sendMessage() {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, sessionToken })
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.content) {
              assistantMessage += data.content
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: assistantMessage }
              ])
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Chat button */}
      <button onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={styles[msg.role]}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}
          </div>

          <div className={styles.inputArea}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
            />
            <button onClick={sendMessage} disabled={isLoading}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Testing & Validation

### Pre-Deployment Testing

**1. Test Document Upload**
```bash
# Upload a test PDF
- Go to /admin/dashboard
- Click "Upload Document"
- Select PDF, enter title
- Verify status changes to "processing"
- Wait for "processed" status
```

**2. Test Document Processing**
```bash
# Check Supabase
- Query documents table → verify content field populated
- Query document_chunks → verify chunks created
- Check chunk count matches expectations

# Check Pinecone
- Go to Pinecone dashboard
- Check index stats → vector count should equal chunk count
- Run test query → verify results returned
```

**3. Test RAG Retrieval**
```bash
# Test chat with known document content
- Ask question about uploaded document
- Verify response references document
- Check for download link in response
- Verify link works
```

**4. Test Analytics**
```bash
# Check analytics tracking
- Query chat_analytics table
- Verify anonymization working (no PII)
- Check categorization accurate
- Verify response times logged
```

### Post-Deployment Validation

**1. Production Health Check**
```bash
# Test endpoints
curl https://your-app.railway.app/api/health

# Test chat
curl -X POST https://your-app.railway.app/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"test","sessionToken":"test-uuid"}'
```

**2. Performance Testing**
```bash
# Monitor response times
- Chat response: Should be 2-4 seconds
- Document upload: Should be <5 seconds
- Download redirect: Should be <1 second
```

**3. Error Handling**
```bash
# Test edge cases
- Invalid session token
- Empty messages
- Very long messages (>4000 tokens)
- Unsupported file types
- Files >10MB
```

### Monitoring Checklist

- [ ] Chat responses working
- [ ] Documents uploading successfully
- [ ] Processing completing (check status)
- [ ] Downloads working
- [ ] Analytics recording
- [ ] No errors in Railway logs
- [ ] Pinecone index growing
- [ ] Supabase queries performing well
- [ ] OpenAI API calls succeeding

---

## Cost Analysis

### Monthly Cost Estimates

Based on moderate usage (1,000 chat messages/month, 50 documents):

| Service | Free Tier | Paid Usage | Estimated Cost |
|---------|-----------|------------|----------------|
| **OpenAI Chat** | - | 1,000 msgs × ~500 tokens × $0.15/1M | ~$0.08 |
| **OpenAI Embeddings** | - | 50 docs × 10K tokens × $0.02/1M | ~$0.01 |
| **Pinecone** | 100K vectors free | Likely within free tier | $0 |
| **Supabase** | 500MB DB, 1GB storage free | Likely within free tier | $0 |
| **Railway** | $5 credit/month | Overages charged | $0-$10 |
| **Total** | | | **$0-$10/month** |

### Scaling Costs (10,000 messages/month)

| Service | Usage | Cost |
|---------|-------|------|
| OpenAI Chat | 10K msgs × 500 tokens × $0.15/1M | ~$0.75 |
| OpenAI Embeddings | 200 docs × 10K tokens × $0.02/1M | ~$0.04 |
| Pinecone | >100K vectors (Serverless tier) | ~$20 |
| Supabase | Pro plan (better performance) | $25 |
| Railway | More resources | ~$20 |
| **Total** | | **~$65/month** |

### Cost Optimization Tips

1. **Use cheaper OpenAI models**
   - Chat: gpt-4o-mini (current) is already very cost-effective
   - Embeddings: text-embedding-3-small (current) is optimal

2. **Limit context length**
   - Reduce topK from 5 to 3 documents
   - Reduce conversation history from 8 to 5 messages
   - Lower max_tokens from 4000 to 2000

3. **Chunk size optimization**
   - Increase chunk size from 500 to 1000 tokens
   - Reduces total vector count
   - Trades off retrieval granularity

4. **Pinecone optimization**
   - Use serverless tier (pay only for usage)
   - Delete old/unused vectors
   - Consider sparse-dense hybrid search

5. **Railway optimization**
   - Use efficient build process
   - Minimize bundle size
   - Enable caching where possible

---

## Troubleshooting

### Issue: "No relevant documents found"

**Symptoms:**
- Chat responds but doesn't reference documents
- Context is always empty
- No download links provided

**Causes & Solutions:**

1. **Pinecone index is empty**
   ```bash
   # Check Pinecone dashboard → Index stats
   # If vector count = 0:
   - Upload documents via admin panel
   - Verify processing completes
   - Check document status = 'processed'
   ```

2. **Embedding dimension mismatch**
   ```bash
   # Verify in .env:
   EMBEDDING_DIMENSIONS=1536  # Must match Pinecone index

   # Check Pinecone index dimensions
   # If mismatch: Recreate index with correct dimensions
   ```

3. **Relevance threshold too high**
   ```typescript
   // In /lib/pinecone.ts, try lowering threshold:
   const relevantMatches = pineconeResults.matches.filter(
     match => match.score >= 0.3  // Lower from 0.5 to 0.3
   )
   ```

4. **Embedding ID format mismatch**
   ```bash
   # Check document_chunks table:
   SELECT embedding_id FROM document_chunks LIMIT 1;
   # Should be: "document-uuid_chunk_0"

   # Check Pinecone console → Query results
   # IDs should match format
   ```

### Issue: "Document stuck in processing"

**Symptoms:**
- Document uploaded but status never changes to "processed"
- No chunks created
- No Pinecone vectors added

**Solutions:**

1. **Check Railway logs**
   ```bash
   # Look for errors during processing
   # Common errors:
   - "Text too short" → PDF extraction failed
   - "OpenAI rate limit" → Too many requests
   - "Pinecone timeout" → Network issue
   ```

2. **Manually trigger reprocessing**
   ```bash
   # Call processing endpoint:
   curl -X POST https://your-app.railway.app/api/documents/process/[document-id]
   ```

3. **Check document content**
   ```sql
   -- In Supabase SQL Editor:
   SELECT content, metadata
   FROM documents
   WHERE id = 'document-uuid';

   -- If content is empty/too short:
   -- Re-upload with different file or format
   ```

### Issue: "Streaming disconnects mid-response"

**Symptoms:**
- Response starts but cuts off
- "Network error" in browser console
- Incomplete messages in database

**Solutions:**

1. **Check Railway logs for errors**
   ```bash
   # Look for:
   - OpenAI API errors
   - Network timeouts
   - Memory issues
   ```

2. **Implement retry logic**
   ```typescript
   // In ChatWidget.tsx:
   async function sendMessage() {
     let retries = 3
     while (retries > 0) {
       try {
         // ... existing code
         break
       } catch (error) {
         retries--
         if (retries === 0) throw error
         await delay(1000)
       }
     }
   }
   ```

3. **Check OpenAI API status**
   - Visit https://status.openai.com
   - Verify no outages

### Issue: "Admin can't upload documents"

**Symptoms:**
- 403 Forbidden on upload
- "Not authorized" error
- Upload button doesn't work

**Solutions:**

1. **Verify admin_users record**
   ```sql
   -- Check admin user exists:
   SELECT * FROM admin_users WHERE email = 'your-email@example.com';

   -- If not found, insert:
   INSERT INTO admin_users (auth_id, email, is_active)
   VALUES ('auth-user-uuid', 'your-email@example.com', true);
   ```

2. **Check RLS policies**
   ```sql
   -- Verify policies exist:
   SELECT * FROM pg_policies WHERE tablename = 'documents';

   -- If missing, recreate from schema
   ```

3. **Verify authentication token**
   ```typescript
   // In browser console:
   const session = await supabase.auth.getSession()
   console.log(session)
   // Should show valid user
   ```

### Issue: "High costs / Unexpected charges"

**Symptoms:**
- OpenAI bills higher than expected
- Pinecone usage spike
- Railway overages

**Solutions:**

1. **Check OpenAI usage**
   ```bash
   # Go to: https://platform.openai.com/usage
   # Review:
   - Token usage per day
   - Which models consuming most
   - Unexpected patterns
   ```

2. **Implement rate limiting**
   ```typescript
   // Add to chat endpoint:
   const userRequests = await countRecentRequests(sessionToken)
   if (userRequests > 10) {
     return new Response('Rate limit exceeded', { status: 429 })
   }
   ```

3. **Optimize context size**
   ```typescript
   // Reduce retrieved documents:
   const pineconeResults = await index.query({
     vector: queryVector,
     topK: 3,  // Reduced from 5
   })

   // Reduce history length:
   .limit(5)  // Reduced from 8
   ```

### Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| `PINECONE_INDEX_HOST is not defined` | Env var missing | Add to Railway variables |
| `Invalid embedding dimension` | Dimension mismatch | Verify 1536 in both Pinecone and code |
| `Session not found` | Invalid session token | Regenerate session token |
| `Document not downloadable` | is_downloadable = false | Update document record |
| `Insufficient quota` | OpenAI rate limit hit | Wait or increase quota |
| `RLS policy violation` | Permission denied | Check RLS policies and auth |

---

## Next Steps After Implementation

### 1. Production Hardening

- [ ] Add rate limiting
- [ ] Implement request caching
- [ ] Add error alerting (Sentry, LogRocket)
- [ ] Set up monitoring (Railway metrics, Supabase analytics)
- [ ] Configure backup strategy
- [ ] Add load testing

### 2. Feature Enhancements

- [ ] Add user feedback (thumbs up/down)
- [ ] Implement suggested questions
- [ ] Add voice input/output
- [ ] Create email digest of popular questions
- [ ] Add multi-language support
- [ ] Implement advanced search filters

### 3. Analytics & Optimization

- [ ] Set up conversion tracking
- [ ] A/B test different prompts
- [ ] Analyze common queries
- [ ] Optimize chunk sizes based on usage
- [ ] Monitor and improve response quality
- [ ] Track document download patterns

### 4. Scaling Preparation

- [ ] Implement Redis caching
- [ ] Add CDN for document downloads
- [ ] Consider moving to dedicated OpenAI instance
- [ ] Plan for Pinecone scaling
- [ ] Optimize database indexes
- [ ] Consider read replicas

---

## Additional Resources

### Documentation Files
- **RAG_ARCHITECTURE_REPORT.md** - Full technical architecture
- **QUICK_REFERENCE.md** - Quick lookup guide
- **FILE_STRUCTURE.txt** - Complete file inventory

### External Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Pinecone Vector Database](https://docs.pinecone.io)
- [Supabase PostgreSQL](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Railway Deployment](https://docs.railway.app)

### Useful Tools
- [Pinecone Console](https://app.pinecone.io)
- [Supabase Dashboard](https://app.supabase.com)
- [OpenAI Playground](https://platform.openai.com/playground)
- [Railway Dashboard](https://railway.app/dashboard)

---

## Support & Maintenance

### Getting Help

1. **Check documentation first**
   - Review this guide
   - Check RAG_ARCHITECTURE_REPORT.md
   - Search QUICK_REFERENCE.md

2. **Common issues**
   - See Troubleshooting section above
   - Check Railway logs
   - Review Supabase logs

3. **Community resources**
   - Next.js Discord
   - Pinecone community
   - Supabase Discord
   - Railway Discord

### Maintenance Schedule

**Weekly:**
- Review error logs
- Check analytics trends
- Monitor costs

**Monthly:**
- Update dependencies
- Review and optimize prompts
- Analyze document usage
- Clean up old sessions (optional)

**Quarterly:**
- Security audit
- Performance optimization
- Feature enhancements
- User feedback review

---

## Conclusion

You now have a complete guide to implementing a production-ready RAG AI chat system! This system combines:

- ✅ Modern AI (OpenAI GPT-4o-mini)
- ✅ Vector search (Pinecone)
- ✅ Reliable database (Supabase)
- ✅ Serverless deployment (Railway)
- ✅ Real-time streaming (SSE)
- ✅ Document processing (PDF, Word, Images)
- ✅ Analytics tracking
- ✅ Admin management

The implementation is battle-tested, scalable, and ready for production use. Follow this guide step-by-step, and you'll have a fully functional RAG chat system deployed to Railway in a few hours.

**Key Takeaways:**
1. RAG provides accurate, document-backed answers
2. The system is modular and easy to customize
3. Deployment to Railway is straightforward
4. Costs are very reasonable ($0-10/month for moderate usage)
5. The architecture scales with your needs

Good luck with your implementation! 🚀

---

**Document Version:** 1.0
**Last Updated:** October 24, 2025
**Source Project:** OhioMeansJobs Huron County
**Status:** Production Ready
