# AI Chat Widget Implementation Plan
## Huron County Means Jobs Website

**Date:** October 19, 2025
**Project:** Add AI Chat Functionality to Huron County Means Jobs Site
**Reference:** Sandusky Current AI Chat Implementation

---

## Overview

Convert the static HTML Huron County Means Jobs site to Next.js and add a floating AI chat widget (similar to Sandusky Current) with anonymous access, admin document uploads, and Railway deployment.

### Architecture Decisions

- **Framework:** Next.js 14 with TypeScript (migrating from static HTML)
- **Authentication:** Anonymous chat access (no login required for users)
- **Admin Access:** Separate admin panel with Supabase Auth
- **Deployment:** Railway
- **AI Service:** OpenAI GPT-4o-mini
- **Vector Database:** Pinecone
- **Backend Database:** Supabase (PostgreSQL)
- **Document Processing:** PDF parsing with OCR fallback

---

## Sandusky Current Reference Implementation

**Repository:** https://github.com/dustinschwanger/sandusky-current

This implementation is based on the Sandusky Current AI chat system. Below is a detailed breakdown of how their implementation works, which serves as our reference architecture.

### Key Implementation Files from Sandusky Current

#### 1. Chat Component (`/apps/web/components/ChatAssistant.tsx`)

**Purpose:** Main chat UI component (embedded, not floating widget)

**Key Features:**
- Server-Sent Events (SSE) streaming for real-time responses
- ReactMarkdown for formatting assistant messages
- Session token management via ChatContext
- Message history display with user/assistant bubbles
- Loading states and error handling

**Architecture Pattern:**
```typescript
// Streaming fetch pattern
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage, sessionToken })
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
        streamedContent += data.content
        // Update UI with streamed content
      }
    }
  }
}
```

**What to Adapt:**
- Convert embedded chat to floating widget
- Add circular button trigger
- Implement expand/collapse animations
- Make full-screen on mobile

#### 2. Chat Context (`/apps/web/contexts/ChatContext.tsx`)

**Purpose:** Session and user management for anonymous chat

**Key Features:**
- UUID-based session tokens stored in localStorage
- Anonymous user creation (no email/password required)
- Subscription status tracking (can be removed for Huron County)
- Query count limits (can be removed for unlimited free access)

**Session Flow:**
```typescript
// On app load
1. Check localStorage for 'chat_session_token'
2. If not found, generate new UUID and store it
3. Check if session exists in Supabase
4. If user attached to session, load their profile
5. Otherwise, create anonymous user on first chat

// On first message
1. initializeUser() creates anonymous user_profile
2. Links session to user_id
3. Stores message in chat_messages table
```

**What to Adapt:**
- Remove subscription/payment logic
- Remove query count limits
- Keep anonymous session management
- Simplify to basic session tracking

#### 3. Chat API Route (`/apps/web/app/api/chat/stream/route.js`)

**Purpose:** Streaming chat endpoint using OpenAI + RAG

**Request Format:**
```json
{
  "message": "What job seeker services do you offer?",
  "sessionToken": "uuid-v4-token"
}
```

**Response Format (Server-Sent Events):**
```
data: {"content": "We offer "}
data: {"content": "resume help, "}
data: {"content": "job search assistance..."}
data: {"done": true}
```

**Processing Flow:**
```javascript
1. Validate session token, create session if missing
2. Retrieve last 10 messages for conversation history
3. Call searchContext() to get relevant documents/incidents/events
4. Build system prompt with context
5. Create messages array: [system, ...history, user]
6. Stream OpenAI response with gpt-4o-mini
7. Store user message and full assistant response in DB
8. Track analytics
```

**What to Adapt:**
- Keep streaming architecture (excellent UX)
- Simplify system prompt for Huron County use case
- Remove incident/article/event search (unless needed)
- Focus on document search only
- Remove subscription checks

#### 4. RAG System (`/apps/web/lib/rag.js`)

**Purpose:** Retrieval Augmented Generation - search for relevant context

**Core Functions:**

**`searchContext(query, limit)`**
- Generates embedding from query using OpenAI
- Searches Pinecone namespaces: `documents`, `articles`, `content`
- Fetches full document content from Supabase if available
- Queries recent incidents from Supabase
- Queries upcoming events from Supabase
- Returns structured results object

**`buildContextPrompt(searchResults)`**
- Formats search results into readable context
- Includes: articles, election guide, incidents, documents, events
- Adds relevance scores and metadata
- Handles very long documents by extracting key sections

**RAG Architecture:**
```
User Query
  ↓
Generate Query Embedding (OpenAI text-embedding-3-small)
  ↓
Vector Search in Pinecone (cosine similarity)
  ↓
Fetch Full Content from Supabase (by document IDs)
  ↓
Build Context Prompt (formatted for GPT)
  ↓
Send to OpenAI with System Prompt + Context
  ↓
Stream Response to User
```

**What to Adapt:**
- Simplify to single `documents` namespace
- Remove articles, incidents, events namespaces
- Keep full document content retrieval pattern
- Adjust relevance score thresholds
- Customize context prompt format

#### 5. Document Processor (`/apps/web/lib/document-processor.js`)

**Purpose:** Process uploaded PDFs/TXT files into searchable chunks

**Processing Pipeline:**
```javascript
1. File Upload
   ↓
2. Text Extraction
   - PDF: pdf-parse library
   - Fallback: Tesseract.js OCR for scanned PDFs
   - TXT: direct text reading
   ↓
3. Store File in Supabase Storage
   - Upload to 'media' bucket
   - Get public URL
   ↓
4. Create Document Record in Supabase
   - Store full content in 'documents' table
   - Save metadata (title, type, file_size, etc.)
   ↓
5. Chunk Document
   - Chunk size: 1000 characters
   - Overlap: 200 characters
   - Split long documents into manageable pieces
   ↓
6. Generate Embeddings
   - For each chunk, call OpenAI embeddings API
   - Model: text-embedding-3-small (1536 dimensions)
   ↓
7. Store Chunks in Supabase
   - 'document_chunks' table
   - Link to parent document
   - Save embedding_id for reference
   ↓
8. Upload Vectors to Pinecone
   - Namespace: 'documents'
   - Batch upsert (100 vectors at a time)
   - Metadata: documentId, chunkIndex, content preview, type
   ↓
9. Mark Document as Processed
   - Update status from 'processing' to 'processed'
```

**What to Adapt:**
- Keep entire pipeline (it's excellent!)
- Remove automatic incident processing
- Adjust chunk size if needed
- Add admin-only access control
- Simplify document types for Huron County

#### 6. OpenAI Library (`/apps/web/lib/openai.js`)

**Functions:**
- `generateEmbedding(text)` - Creates 1536-dim vectors
- `getChatCompletion(messages, stream, tools)` - Chat with retry logic

**Configuration:**
- Model: `gpt-4o-mini` (cost-effective)
- Max tokens: 4000
- Temperature: 0.7 (balanced creativity)
- Streaming: true
- Embeddings: `text-embedding-3-small`

**What to Adapt:**
- Keep all settings
- Ensure proper error handling
- Add retry logic for production

#### 7. Pinecone Library (`/apps/web/lib/pinecone.js`)

**Functions:**
- `getPineconeClient()` - Initialize Pinecone client (singleton)
- `getPineconeIndex()` - Get index reference

**Configuration:**
- Index name: Environment variable
- API key: Environment variable
- Namespaces used: `documents`, `articles`, `content`

**What to Adapt:**
- Single namespace: `huron-county-documents`
- Keep singleton pattern
- Add error handling

#### 8. Supabase Configuration

**Database Tables (from Sandusky Current):**

**`chat_sessions`**
```sql
- id: uuid (PK)
- session_token: uuid (unique)
- user_id: uuid (FK to user_profiles)
- created_at: timestamptz
- last_activity_at: timestamptz
```

**`chat_messages`**
```sql
- id: uuid (PK)
- session_id: uuid (FK)
- role: text ('user' | 'assistant')
- content: text
- created_at: timestamptz
```

**`user_profiles`** (simplified for anonymous)
```sql
- id: uuid (PK)
- auth_id: uuid (FK to auth.users) [nullable for anonymous]
- free_queries_used: integer
- subscription_status: text
- created_at: timestamptz
```

**`documents`**
```sql
- id: uuid (PK)
- title: text
- filename: text
- type: text
- source: text
- file_size: integer
- content_preview: text
- content: text (FULL document text)
- status: text ('processing' | 'processed' | 'failed')
- storage_path: text
- public_url: text
- metadata: jsonb
- created_at: timestamptz
```

**`document_chunks`**
```sql
- id: uuid (PK)
- document_id: uuid (FK)
- content: text
- chunk_index: integer
- embedding_id: text (Pinecone vector ID)
- created_at: timestamptz
```

**`chat_analytics`**
```sql
- id: uuid (PK)
- query_text: text (anonymized)
- query_category: text
- query_topics: text[]
- response_time_ms: integer
- sources_used: jsonb
- error_occurred: boolean
- created_at: timestamptz
```

**What to Adapt:**
- Remove subscription fields from user_profiles
- Add admin_users table for document upload access
- Simplify document types
- Add RLS policies for admin access

### Technology Stack Summary

| Component | Sandusky Current | Huron County (Adapted) |
|-----------|-----------------|----------------------|
| Framework | Next.js 14 | ✅ Same |
| Language | TypeScript | ✅ Same |
| Styling | Tailwind CSS | ✅ Same |
| Chat Component | Embedded | 🔄 Floating Widget |
| Authentication | Anonymous + Stripe | 🔄 Anonymous + Admin Auth |
| Vector DB | Pinecone | ✅ Same |
| Database | Supabase | ✅ Same |
| AI Model | GPT-4o-mini | ✅ Same |
| Embeddings | text-embedding-3-small | ✅ Same |
| PDF Parsing | pdf-parse + Tesseract OCR | ✅ Same |
| Streaming | Server-Sent Events | ✅ Same |
| Deployment | Railway | ✅ Same |
| Payment | Stripe | ❌ Not needed |

### Key Differences: Sandusky Current vs. Huron County

**Sandusky Current:**
- Embedded chat widget (always visible on page)
- Subscription-based (Stripe integration)
- Query limits for free users (3 queries)
- Multiple Pinecone namespaces (documents, articles, incidents, content)
- Real-time scanner incidents
- News articles with full CMS
- Event calendar system
- Election guide
- Marketplace with featured purchases

**Huron County Means Jobs:**
- Floating chat widget (circular button → expands)
- Completely free, unlimited queries
- Admin-only document upload (no public submissions)
- Single Pinecone namespace (documents only)
- Focus on job seeker/employer services documents
- No news, incidents, or events (unless added later)
- Simpler data model
- Anonymous chat only (no user authentication for chat)

### Files to Reference When Building

1. **Chat UI**: `/apps/web/components/ChatAssistant.tsx` → Adapt to floating widget
2. **Chat Logic**: `/apps/web/app/api/chat/stream/route.js` → Use as-is, simplify prompt
3. **RAG**: `/apps/web/lib/rag.js` → Simplify to documents-only
4. **Document Processing**: `/apps/web/lib/document-processor.js` → Use as-is
5. **Session Management**: `/apps/web/contexts/ChatContext.tsx` → Remove subscription logic
6. **OpenAI**: `/apps/web/lib/openai.js` → Use as-is
7. **Pinecone**: `/apps/web/lib/pinecone.js` → Use as-is

### Environment Variables from Sandusky Current

```env
# Core Services
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Vector Database
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
PINECONE_INDEX_HOST=

# AI
OPENAI_API_KEY=
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
OPENAI_CHAT_MODEL=gpt-4o-mini

# Site
NEXT_PUBLIC_SITE_URL=
```

**Not Needed for Huron County:**
```env
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
BRAVE_API_KEY=
```

---

## Phase 1: Project Setup & Next.js Migration Foundation

**Duration:** ~1 hour

### 1.1 Initialize Next.js 14 Project with TypeScript

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

**Configuration:**
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router (not Pages Router)
- ✅ No src directory
- ✅ Import alias (@/*)

### 1.2 Install Core Dependencies

```bash
npm install @supabase/supabase-js @pinecone-database/pinecone openai
npm install pdf-parse tesseract.js
npm install react-markdown react-dropzone
npm install uuid
npm install -D @types/uuid @types/pdf-parse
```

**Dependencies Breakdown:**
- `@supabase/supabase-js` - Database & Auth
- `@pinecone-database/pinecone` - Vector search
- `openai` - GPT-4o-mini & embeddings
- `pdf-parse` - PDF text extraction
- `tesseract.js` - OCR for scanned PDFs
- `react-markdown` - Render markdown in chat
- `react-dropzone` - File upload UI
- `uuid` - Session token generation

### 1.3 Configure Tailwind with Ohio State Colors

**tailwind.config.ts:**
```typescript
colors: {
  'ohio-red': '#BA0C2F',
  'ohio-blue': '#003B7A',
  'text-dark': '#2C3E50',
  'text-light': '#6C757D',
  'bg-light': '#F8F9FA',
}
```

### 1.4 Environment Variables Template

**Create `.env.example`:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=huron-county-chat
PINECONE_INDEX_HOST=your-index-host.pinecone.io

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
OPENAI_CHAT_MODEL=gpt-4o-mini

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://huroncountymeansjobs.com
```

**Create `.env.local`** (copy from .env.example and fill in real values)

---

## Phase 2: Convert HTML Pages to Next.js

**Duration:** ~3-4 hours

### 2.1 Page Structure

**Current static pages:**
- index.html → `app/page.tsx`
- job-seekers.html → `app/job-seekers/page.tsx`
- employers.html → `app/employers/page.tsx`
- youth-program.html → `app/youth-program/page.tsx`
- about-us.html → `app/about-us/page.tsx`
- events.html → `app/events/page.tsx`
- contact.html → `app/contact/page.tsx`

### 2.2 Create Shared Layout Components

**`app/layout.tsx`** - Root layout with:
- HTML structure
- Metadata (title, description, Open Graph)
- Google Fonts (Open Sans)
- Font Awesome 6.4.0
- ChatWidget component (included on all pages)

**`components/Header.tsx`** - Navigation with:
- Logo
- Desktop navigation menu
- Mobile hamburger menu
- Sticky header with scroll shadow
- Ohio state branding

**`components/Footer.tsx`** - Footer with:
- Contact information
- Social links
- Copyright notice

**`components/Hero.tsx`** - Reusable hero section with:
- Parallax effect
- Background images
- Title and subtitle props
- Call-to-action buttons

### 2.3 Convert CSS to Tailwind + CSS Modules

**Strategy:**
1. Convert utility styles to Tailwind classes
2. Keep complex animations in CSS modules
3. Preserve all existing visual effects:
   - Parallax hero sections
   - FAQ accordion animations
   - Form validation states
   - Button hover effects
   - Mobile menu slide-in

**Example conversion:**
```html
<!-- Old HTML -->
<section class="hero-section">
  <h1 class="hero-title">Welcome</h1>
</section>

<!-- New Next.js -->
<section className="relative h-[500px] bg-ohio-blue">
  <h1 className="text-4xl font-bold text-white">Welcome</h1>
</section>
```

### 2.4 Port JavaScript Functionality

**Convert main.js features to React:**
- Mobile menu toggle → useState hook
- Form validation → React forms with validation
- FAQ accordions → Accordion component
- Smooth scrolling → Next.js Link with scroll behavior
- Back-to-top button → useEffect with scroll listener
- Parallax effect → useEffect with scroll listener
- Intersection Observer animations → Framer Motion or CSS modules

**Example:**
```typescript
// Mobile menu
const [menuOpen, setMenuOpen] = useState(false);

// Form validation
const [formData, setFormData] = useState({ name: '', email: '' });
const [errors, setErrors] = useState({});
```

### 2.5 Asset Migration

- Move `/public/*` files to Next.js `/public` directory
- Update image paths in components
- Optimize images with Next.js Image component

---

## Phase 3: Supabase & Pinecone Setup

**Duration:** ~1-2 hours

### 3.1 Create Supabase Project

1. Go to https://supabase.com
2. Create new project: "huron-county-means-jobs"
3. Save database password securely
4. Copy project URL and anon key to `.env.local`

### 3.2 Create Database Schema

**Run SQL in Supabase SQL Editor:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat sessions (anonymous tracking)
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token UUID UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat analytics (anonymized)
CREATE TABLE chat_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_text TEXT,
  query_category TEXT,
  query_topics TEXT[],
  response_time_ms INTEGER,
  sources_used JSONB,
  error_occurred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (uploaded files)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  type TEXT CHECK (type IN ('job-seeker-guide', 'employer-info', 'youth-program', 'event', 'general')),
  content TEXT NOT NULL,
  content_preview TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'failed')),
  file_size INTEGER,
  storage_path TEXT,
  public_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks (for vector search)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users (for document upload access)
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
```

### 3.3 Configure Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read for documents
CREATE POLICY "Public can read documents"
  ON documents FOR SELECT
  USING (status = 'processed');

CREATE POLICY "Public can read document chunks"
  ON document_chunks FOR SELECT
  USING (true);

-- Anonymous users can create sessions and messages
CREATE POLICY "Anyone can create sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read own session"
  ON chat_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read messages"
  ON chat_messages FOR SELECT
  USING (true);

-- Analytics can be written by anyone (anonymized)
CREATE POLICY "Anyone can write analytics"
  ON chat_analytics FOR INSERT
  WITH CHECK (true);

-- Admin-only access for document management
CREATE POLICY "Admins can manage documents"
  ON documents FOR ALL
  USING (
    auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY "Admins can manage chunks"
  ON document_chunks FOR ALL
  USING (
    auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true)
  );
```

### 3.4 Create Supabase Storage Bucket

```sql
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

-- Storage policies
CREATE POLICY "Public can read documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Admins can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true)
  );
```

### 3.5 Set Up Pinecone Vector Database

1. Go to https://www.pinecone.io
2. Create new index:
   - Name: `huron-county-chat`
   - Dimensions: `1536` (OpenAI text-embedding-3-small)
   - Metric: `cosine`
   - Cloud: AWS or GCP (choose closest region)
3. Copy API key and index host to `.env.local`

**Create namespace:**
- `huron-county-documents` - For all uploaded documents

### 3.6 Create Supabase Client Library

**`lib/supabase.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);
```

### 3.7 Create Pinecone Client Library

**`lib/pinecone.ts`:**
```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const pineconeIndex = pinecone.index(
  process.env.PINECONE_INDEX_NAME!,
  process.env.PINECONE_INDEX_HOST!
);

export default pinecone;
```

---

## Phase 4: Build Floating Chat Widget UI

**Duration:** ~2-3 hours

### 4.1 Create ChatWidget Component

**`components/ChatWidget.tsx`:**

**Features:**
- Fixed position: bottom-right, 20px from edges
- Initial state: Circular button (60px diameter)
- Expanded state: 400px × 600px chat window
- Smooth animations (300ms ease-in-out)
- Mobile: full screen when expanded
- Z-index: 9999 (always on top)

**States:**
```typescript
const [isOpen, setIsOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [sessionToken, setSessionToken] = useState<string | null>(null);
```

**Visual Structure:**

```
┌─────────────────────────────┐
│  Ask about Huron County     │ ← Header (Ohio Blue)
│  [Close Button]             │
├─────────────────────────────┤
│                             │
│  [User Message]             │ ← Right-aligned
│                             │
│  [Assistant Message]        │ ← Left-aligned
│  • Job seeker services...  │
│                             │
│                             │ ← Scroll area (500px)
│                             │
├─────────────────────────────┤
│ [Input field...........] [→]│ ← Input area
└─────────────────────────────┘
```

### 4.2 Chat Button Design

**Circular button (collapsed state):**
- Diameter: 60px
- Background: Ohio Red (#BA0C2F)
- Icon: Chat bubble or message icon (white)
- Shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
- Hover: Scale 1.05, shadow increases
- Pulse animation: subtle breathing effect

**CSS:**
```css
.chat-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #BA0C2F;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 9999;
}

.chat-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### 4.3 Chat Window Design (Expanded State)

**Container:**
- Width: 400px (desktop), 100vw (mobile)
- Height: 600px (desktop), 100vh (mobile)
- Border radius: 12px (desktop only)
- Shadow: 0 8px 32px rgba(0, 0, 0, 0.2)
- Background: white

**Header:**
- Height: 60px
- Background: Ohio Blue (#003B7A)
- Text: White, bold
- Close button: X icon, top-right

**Message Area:**
- Height: calc(100% - 120px)
- Overflow-y: scroll
- Padding: 16px
- Auto-scroll to bottom on new message

**Message Bubbles:**

User messages:
- Right-aligned
- Background: Ohio Blue (#003B7A)
- Text: White
- Border radius: 18px 18px 4px 18px
- Max width: 80%

Assistant messages:
- Left-aligned
- Background: #F8F9FA
- Text: Dark gray (#2C3E50)
- Border radius: 18px 18px 18px 4px
- Max width: 80%
- Markdown rendering (bold, lists, links)

**Input Area:**
- Height: 60px
- Border-top: 1px solid #E5E7EB
- Flex layout: input + send button
- Input: Flex-grow, padding 12px
- Send button: Ohio Red, arrow icon

**Loading State:**
- Typing indicator: three animated dots
- Input disabled
- Send button shows spinner

### 4.4 Animations

**Expand/Collapse:**
```typescript
const variants = {
  collapsed: {
    width: 60,
    height: 60,
    borderRadius: '50%',
  },
  expanded: {
    width: 400,
    height: 600,
    borderRadius: 12,
  },
};
```

**Message Fade-In:**
- New messages slide up and fade in
- Duration: 200ms

### 4.5 Responsive Behavior

**Mobile (< 768px):**
- Expanded chat fills entire screen
- Header shows "Ask about Huron County"
- Close button → Back arrow
- No border radius (full screen)
- Collapse button becomes "Minimize"

**Desktop:**
- Fixed position bottom-right
- Widget style
- Outside click doesn't close (intentional)

### 4.6 Accessibility

- Keyboard navigation (Tab, Enter, Escape)
- ARIA labels on all interactive elements
- Focus management (auto-focus input when opened)
- Screen reader announcements for new messages
- High contrast mode support

---

## Phase 5: Implement Chat Functionality (Backend)

**Duration:** ~3-4 hours

### 5.1 Create API Routes

**`app/api/chat/stream/route.ts`** - Main streaming chat endpoint

**Request:**
```typescript
{
  message: string;
  sessionToken?: string;
}
```

**Response:**
- Content-Type: `text/event-stream`
- Format: Server-Sent Events (SSE)
- Data: `{"content": "streamed text"}` or `{"done": true}`

**`app/api/chat/session/route.ts`** - Create anonymous session

**Request:** `POST /api/chat/session`

**Response:**
```typescript
{
  sessionToken: string; // UUID v4
}
```

### 5.2 Build RAG System

**`lib/rag.ts`** - Retrieval Augmented Generation

```typescript
export async function queryRelevantContext(
  query: string,
  topK: number = 10
): Promise<ContextResult[]> {
  // 1. Generate embedding for query
  const embedding = await generateEmbedding(query);

  // 2. Query Pinecone
  const results = await pineconeIndex.namespace('huron-county-documents').query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });

  // 3. Fetch full content from Supabase
  const contextResults = await fetchDocumentChunks(
    results.matches.map(m => m.id)
  );

  return contextResults;
}
```

**Context retrieval strategy:**
1. Convert user query to 1536-dim vector (OpenAI)
2. Search Pinecone for top 10 similar chunks
3. Fetch chunk content from Supabase
4. Rank by relevance score (cosine similarity)
5. Return top 5-10 chunks as context

**`lib/openai.ts`** - OpenAI integration

```typescript
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (text: string) => void
): Promise<string> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 4000,
    stream: true,
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullResponse += content;
    onChunk(content);
  }

  return fullResponse;
}
```

### 5.3 Implement Chat Logic

**Flow Diagram:**

```
User sends message
  ↓
Check session token → Create if missing
  ↓
Store user message in Supabase
  ↓
Retrieve conversation history (last 10 messages)
  ↓
Query RAG for relevant context
  ↓
Build system prompt with context
  ↓
Call OpenAI GPT-4o-mini (streaming)
  ↓
Stream response to client
  ↓
Store assistant message in Supabase
  ↓
Track analytics (anonymized)
```

**`app/api/chat/stream/route.ts`** implementation:

```typescript
export async function POST(req: Request) {
  const { message, sessionToken } = await req.json();

  // 1. Validate/create session
  let session = sessionToken
    ? await getSession(sessionToken)
    : await createSession();

  // 2. Store user message
  await storeMessage(session.id, 'user', message);

  // 3. Get conversation history
  const history = await getConversationHistory(session.id, 10);

  // 4. Query RAG
  const context = await queryRelevantContext(message);

  // 5. Build system prompt
  const systemPrompt = buildSystemPrompt(context);

  // 6. Build messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  // 7. Stream response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = '';

      await streamChatCompletion(messages, (chunk) => {
        fullResponse += chunk;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
        );
      });

      // Store assistant message
      await storeMessage(session.id, 'assistant', fullResponse);

      // Track analytics
      await trackChatAnalytics({
        query: message,
        context,
        responseTime: Date.now() - startTime,
      });

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 5.4 System Prompt Engineering

**`lib/prompts.ts`:**

```typescript
export function buildSystemPrompt(context: ContextResult[]): string {
  const contextText = context
    .map((c, i) => `[${i + 1}] ${c.content}`)
    .join('\n\n');

  return `You are a helpful AI assistant for Huron County Means Jobs, a workforce development center in Norwalk, Ohio.

Your role is to help users with:
- Job seeker services (resume help, job search, career counseling)
- Employer services (recruitment, job postings, on-the-job training)
- Youth programs (L.Y.F.E. program)
- Events and workshops
- General information about Huron County employment resources

IMPORTANT INSTRUCTIONS:
1. Be professional, friendly, and concise
2. Use the context provided below to answer questions accurately
3. If you don't know the answer, say so and direct them to contact the office at (419) 668-3211
4. Always encourage users to visit the office at 10 Shady Lane Drive, Norwalk, OH 44857
5. For complex cases, suggest scheduling an appointment
6. Do not make up information - only use the context provided

CONTEXT FROM KNOWLEDGE BASE:
${contextText}

If the question cannot be answered using the context above, politely explain that you don't have that specific information and provide the contact information.`;
}
```

**Key characteristics:**
- Professional but approachable tone
- Specific to Huron County services
- Encourages in-person visits when appropriate
- Provides accurate contact information
- Doesn't hallucinate beyond context

### 5.5 Analytics Tracking

**`lib/chat-analytics.ts`:**

```typescript
export async function trackChatAnalytics(data: {
  query: string;
  context: ContextResult[];
  responseTime: number;
  error?: boolean;
}) {
  // Anonymize query (remove emails, phone numbers, names)
  const anonymizedQuery = anonymizeQuery(data.query);

  // Categorize query
  const category = categorizeQuery(data.query);
  const topics = extractTopics(data.query);

  await supabaseAdmin.from('chat_analytics').insert({
    query_text: anonymizedQuery,
    query_category: category,
    query_topics: topics,
    response_time_ms: data.responseTime,
    sources_used: {
      documents: data.context.length,
    },
    error_occurred: data.error || false,
  });
}

function categorizeQuery(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('job') || lowerQuery.includes('resume')) {
    return 'job-seeker';
  }
  if (lowerQuery.includes('employer') || lowerQuery.includes('hiring')) {
    return 'employer';
  }
  if (lowerQuery.includes('youth') || lowerQuery.includes('lyfe')) {
    return 'youth-program';
  }
  if (lowerQuery.includes('event') || lowerQuery.includes('workshop')) {
    return 'events';
  }

  return 'general';
}
```

---

## Phase 6: Admin Document Upload System

**Duration:** ~2-3 hours

### 6.1 Create Admin Authentication

**`app/admin/login/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_id', data.user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      await supabase.auth.signOut();
      setError('Unauthorized: Not an admin user');
      return;
    }

    router.push('/admin/documents');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-ohio-blue mb-6">
          Admin Login
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-ohio-red text-white py-2 rounded-lg hover:bg-red-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
```

**`middleware.ts`** - Protect admin routes:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_id', session.user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: '/admin/:path*',
};
```

### 6.2 Build Document Upload Interface

**`app/admin/documents/page.tsx`:**

**Features:**
- Drag-and-drop file upload
- File type validation (PDF, TXT only)
- File size validation (max 500MB)
- Upload progress bar
- Document list with search
- Delete documents
- Re-process failed documents
- Document metadata display

**UI Layout:**

```
┌────────────────────────────────────────────┐
│  Huron County Means Jobs - Admin Panel    │
│  [Logout]                                  │
├────────────────────────────────────────────┤
│  Upload Documents                          │
│  ┌──────────────────────────────────────┐ │
│  │  Drag & drop PDF or TXT files here   │ │
│  │  or click to browse                   │ │
│  │                                        │ │
│  └──────────────────────────────────────┘ │
│  [Upload Button] [Cancel]                 │
├────────────────────────────────────────────┤
│  Documents (23)          [Search: ____]   │
│  ┌──────────────────────────────────────┐ │
│  │ ✓ Job Seeker Guide.pdf               │ │
│  │   Processed • 2.3 MB • 45 chunks     │ │
│  │   [View] [Delete]                    │ │
│  ├──────────────────────────────────────┤ │
│  │ ✓ Employer Services.pdf              │ │
│  │   Processed • 1.8 MB • 32 chunks     │ │
│  │   [View] [Delete]                    │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

**Component structure:**

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase';

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await uploadDocument(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  const uploadDocument = async (file: File) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'general');

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      // Refresh document list
      await fetchDocuments();
    }

    setUploading(false);
    setProgress(100);
  };

  // ... render UI
}
```

### 6.3 Create Document Processing API

**`app/api/documents/upload/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/document-processor';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as string;

  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }

  // Validate file type
  if (!file.type.includes('pdf') && !file.type.includes('text')) {
    return NextResponse.json(
      { error: 'Only PDF and TXT files are supported' },
      { status: 400 }
    );
  }

  // Validate file size (500MB max)
  if (file.size > 500 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'File size must be less than 500MB' },
      { status: 400 }
    );
  }

  try {
    const result = await processDocument(file, type);

    return NextResponse.json({
      success: true,
      documentId: result.documentId,
      chunks: result.chunkCount,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
```

**`lib/document-processor.ts`:**

```typescript
import pdf from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from './supabase';
import { pineconeIndex } from './pinecone';
import { generateEmbedding } from './openai';

export async function processDocument(
  file: File,
  type: string
): Promise<{ documentId: string; chunkCount: number }> {
  // 1. Extract text from file
  const buffer = await file.arrayBuffer();
  let text = '';

  if (file.type.includes('pdf')) {
    text = await extractTextFromPDF(Buffer.from(buffer));
  } else {
    text = new TextDecoder().decode(buffer);
  }

  // 2. Create document record
  const documentId = uuidv4();
  const { error: docError } = await supabaseAdmin.from('documents').insert({
    id: documentId,
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
    filename: file.name,
    type,
    content: text,
    content_preview: text.substring(0, 500),
    status: 'processing',
    file_size: file.size,
  });

  if (docError) throw docError;

  // 3. Upload file to Supabase Storage
  const storagePath = `${documentId}/${file.name}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from('documents')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // 4. Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('documents')
    .getPublicUrl(storagePath);

  // 5. Update document with storage info
  await supabaseAdmin
    .from('documents')
    .update({
      storage_path: storagePath,
      public_url: urlData.publicUrl,
    })
    .eq('id', documentId);

  // 6. Chunk document
  const chunks = chunkText(text, 1000, 200);

  // 7. Generate embeddings and upload to Pinecone
  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await generateEmbedding(chunk);
    const embeddingId = `${documentId}-chunk-${i}`;

    vectors.push({
      id: embeddingId,
      values: embedding,
      metadata: {
        documentId,
        chunkIndex: i,
        content: chunk.substring(0, 500), // Preview
        type,
      },
    });

    // Store chunk in database
    await supabaseAdmin.from('document_chunks').insert({
      document_id: documentId,
      content: chunk,
      chunk_index: i,
      embedding_id: embeddingId,
    });
  }

  // Batch upsert to Pinecone (100 at a time)
  for (let i = 0; i < vectors.length; i += 100) {
    const batch = vectors.slice(i, i + 100);
    await pineconeIndex.namespace('huron-county-documents').upsert(batch);
  }

  // 8. Mark document as processed
  await supabaseAdmin
    .from('documents')
    .update({ status: 'processed' })
    .eq('id', documentId);

  return {
    documentId,
    chunkCount: chunks.length,
  };
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    // Fallback to OCR for scanned PDFs
    console.log('PDF parsing failed, attempting OCR...');
    return await performOCR(buffer);
  }
}

async function performOCR(buffer: Buffer): Promise<string> {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  const { data: { text } } = await worker.recognize(buffer);
  await worker.terminate();

  return text;
}

function chunkText(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    chunks.push(text.substring(startIndex, endIndex));
    startIndex += chunkSize - overlap;
  }

  return chunks;
}
```

### 6.4 Document Management Features

**Delete Document:**

```typescript
// app/api/documents/[id]/route.ts
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1. Get document chunks
  const { data: chunks } = await supabaseAdmin
    .from('document_chunks')
    .select('embedding_id')
    .eq('document_id', id);

  // 2. Delete from Pinecone
  if (chunks) {
    const embeddingIds = chunks.map((c) => c.embedding_id);
    await pineconeIndex
      .namespace('huron-county-documents')
      .deleteMany(embeddingIds);
  }

  // 3. Delete from Supabase Storage
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (doc?.storage_path) {
    await supabaseAdmin.storage.from('documents').remove([doc.storage_path]);
  }

  // 4. Delete from database (cascades to chunks)
  await supabaseAdmin.from('documents').delete().eq('id', id);

  return NextResponse.json({ success: true });
}
```

---

## Phase 7: Testing & Quality Assurance

**Duration:** ~2-3 hours

### 7.1 Functional Testing Checklist

**Page Migration:**
- [ ] All 7 pages render correctly
- [ ] Navigation works (header links)
- [ ] Mobile menu toggles properly
- [ ] Hero sections display with parallax
- [ ] FAQ accordions expand/collapse
- [ ] Contact form validation works
- [ ] Back-to-top button appears on scroll
- [ ] All images load correctly
- [ ] Footer displays properly

**Chat Widget:**
- [ ] Circular button appears bottom-right on all pages
- [ ] Button expands to chat window on click
- [ ] Chat window closes properly
- [ ] Messages send successfully
- [ ] Streaming responses display in real-time
- [ ] Session persists across page navigation
- [ ] Chat history loads correctly
- [ ] Error messages display gracefully
- [ ] Input validation works
- [ ] Markdown rendering works (bold, lists, links)

**Document Upload:**
- [ ] Admin login works
- [ ] Non-admin users cannot access /admin
- [ ] Drag-and-drop upload works
- [ ] File type validation works (rejects non-PDF/TXT)
- [ ] File size validation works (rejects > 500MB)
- [ ] Upload progress displays
- [ ] PDF text extraction works
- [ ] OCR fallback works for scanned PDFs
- [ ] Documents chunk correctly
- [ ] Embeddings upload to Pinecone
- [ ] Document list displays uploaded files
- [ ] Search/filter works
- [ ] Delete removes from all systems (Supabase, Pinecone, Storage)

**RAG System:**
- [ ] Relevant documents retrieved for queries
- [ ] Context included in assistant responses
- [ ] Responses cite source documents when appropriate
- [ ] Empty state handles "no documents" gracefully
- [ ] Fallback to general knowledge when needed

**Analytics:**
- [ ] Chat messages stored in database
- [ ] Analytics tracked (anonymized)
- [ ] Query categorization works
- [ ] Response times logged

### 7.2 Cross-Browser Testing

**Desktop Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile Browsers:**
- [ ] iOS Safari
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet

### 7.3 Responsive Design Testing

**Breakpoints to test:**
- [ ] 375px (iPhone SE)
- [ ] 390px (iPhone 12/13/14)
- [ ] 768px (iPad portrait)
- [ ] 1024px (iPad landscape, small laptop)
- [ ] 1440px (standard desktop)
- [ ] 1920px (large desktop)

**What to verify:**
- [ ] Chat button doesn't overlap content
- [ ] Chat window fills screen on mobile
- [ ] Navigation menu works at all sizes
- [ ] Text remains readable
- [ ] Images scale properly
- [ ] Forms usable on small screens

### 7.4 Performance Testing

**Metrics to measure:**

1. **Page Load Times:**
   - Target: < 2 seconds (3G)
   - Target: < 1 second (4G/WiFi)
   - Use Lighthouse CI

2. **Chat Response Latency:**
   - Target: < 2 seconds for first token
   - Target: < 5 seconds for complete response
   - Test with various query lengths

3. **Vector Search Speed:**
   - Target: < 500ms for Pinecone query
   - Test with 100+ documents in index

4. **Document Upload:**
   - Test with 1MB, 10MB, 50MB, 100MB files
   - Verify progress indicator accuracy

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse
- WebPageTest
- Network throttling (Fast 3G, Slow 3G)

### 7.5 Accessibility Testing

**WCAG 2.1 AA Compliance:**

- [ ] Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast ratios meet standards (4.5:1 for text)
- [ ] ARIA labels on buttons and inputs
- [ ] Screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] Form error messages announced
- [ ] Chat messages announced to screen readers
- [ ] Skip to main content link
- [ ] Headings in logical order (H1 → H2 → H3)
- [ ] Alt text on all images

**Tools:**
- axe DevTools
- WAVE (Web Accessibility Evaluation Tool)
- Screen readers (NVDA, VoiceOver)

### 7.6 Security Testing

- [ ] Environment variables not exposed to client
- [ ] API keys secure (not in git)
- [ ] RLS policies prevent unauthorized access
- [ ] Admin routes protected by middleware
- [ ] File upload validates type and size
- [ ] No SQL injection vulnerabilities
- [ ] XSS protection (React escapes by default)
- [ ] CSRF protection (Supabase handles)
- [ ] HTTPS enforced in production

### 7.7 Error Handling Testing

**Scenarios to test:**

- [ ] OpenAI API down → Show friendly error message
- [ ] Pinecone unavailable → Fallback to database search
- [ ] Supabase connection lost → Retry logic
- [ ] Invalid file upload → Clear error message
- [ ] Network timeout → Retry button
- [ ] Session expired → Create new session
- [ ] Malformed user input → Validation message
- [ ] Rate limiting → Queue requests

---

## Phase 8: Railway Deployment & Documentation

**Duration:** ~1-2 hours

### 8.1 Configure Railway Deployment

**Step 1: Create Railway Project**

1. Go to https://railway.app
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Connect GitHub account
5. Select your repository
6. Railway auto-detects Next.js

**Step 2: Set Environment Variables**

In Railway dashboard → Variables tab, add:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=huron-county-chat
PINECONE_INDEX_HOST=your-index.pinecone.io

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
OPENAI_CHAT_MODEL=gpt-4o-mini

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://huroncountymeansjobs.com

# Node Environment
NODE_ENV=production
```

**Step 3: Configure Build Settings**

Railway should auto-detect, but verify:

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Build Command:** `npm run build`
**Start Command:** `npm run start`

**Step 4: Deploy**

- Push to main branch → Auto-deploys
- Or click "Deploy" in Railway dashboard
- Monitor build logs for errors

**Step 5: Custom Domain (Optional)**

1. Railway Settings → Domains
2. Add custom domain
3. Update DNS records (CNAME or A record)
4. SSL auto-configured by Railway

### 8.2 Create Comprehensive Documentation

**`IMPLEMENTATION.md`** - Complete implementation overview

```markdown
# Huron County Means Jobs - AI Chat Implementation

## Overview
This document provides a comprehensive overview of the AI chat functionality added to the Huron County Means Jobs website.

## Architecture

### Technology Stack
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI Service:** OpenAI GPT-4o-mini
- **Vector Database:** Pinecone (1536 dimensions)
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Railway

### Key Features
1. Floating chat widget (bottom-right corner)
2. Anonymous chat (no login required)
3. RAG-powered responses using uploaded documents
4. Admin panel for document management
5. Real-time streaming responses
6. Mobile-responsive design

## System Architecture

[Include diagram of data flow]

User Query → Chat Widget → API Route → RAG System → Pinecone + Supabase → OpenAI → Streaming Response

## Implementation Details

[Include detailed sections on each component]
```

**`SETUP.md`** - Environment setup instructions

```markdown
# Setup Guide

## Prerequisites
- Node.js 18+ and npm
- Supabase account
- Pinecone account
- OpenAI API key
- Railway account (for deployment)

## Local Development Setup

### 1. Clone Repository
\`\`\`bash
git clone [repo-url]
cd huron-county-means-jobs
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in values:
\`\`\`bash
cp .env.example .env.local
\`\`\`

### 4. Set Up Supabase
[Step-by-step instructions]

### 5. Set Up Pinecone
[Step-by-step instructions]

### 6. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000
```

**`API_DOCUMENTATION.md`** - API routes reference

```markdown
# API Documentation

## Endpoints

### POST /api/chat/stream
Stream chat responses using Server-Sent Events.

**Request:**
\`\`\`json
{
  "message": "What job seeker services do you offer?",
  "sessionToken": "uuid-here" // optional
}
\`\`\`

**Response:**
\`\`\`
Content-Type: text/event-stream

data: {"content": "We offer "}
data: {"content": "resume help, "}
data: {"content": "job search assistance..."}
data: {"done": true}
\`\`\`

[Continue for all endpoints...]
```

**`ADMIN_GUIDE.md`** - How to use admin panel

```markdown
# Admin Guide

## Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Enter admin credentials
3. You'll be redirected to `/admin/documents`

## Uploading Documents

### Supported Formats
- PDF (up to 500MB)
- TXT (up to 500MB)

### Upload Process
1. Drag and drop files or click to browse
2. Select document type:
   - Job Seeker Guide
   - Employer Info
   - Youth Program
   - Event
   - General
3. Click "Upload"
4. Wait for processing to complete
5. Document appears in list when ready

## Managing Documents

### View Documents
- All uploaded documents appear in the list
- Shows: title, status, size, chunk count

### Search Documents
- Use search bar to filter by title

### Delete Documents
- Click "Delete" button
- Confirms before deletion
- Removes from all systems (Supabase, Pinecone, Storage)

## Troubleshooting

[Common issues and solutions...]
```

**`ARCHITECTURE.md`** - System architecture diagram

```markdown
# System Architecture

## High-Level Overview

\`\`\`
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Chat Widget    │ (React Component)
│  (Client-side)  │
└──────┬──────────┘
       │ POST /api/chat/stream
       ▼
┌─────────────────┐
│  API Route      │ (Next.js Server)
│  stream/route.ts│
└──────┬──────────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│   Supabase   │   │   Pinecone   │
│  (Database)  │   │ (Vector DB)  │
└──────────────┘   └──────────────┘
       │                  │
       │                  │
       └─────────┬────────┘
                 │ Context
                 ▼
        ┌─────────────────┐
        │   OpenAI API    │
        │   GPT-4o-mini   │
        └────────┬────────┘
                 │ Streaming
                 ▼
        ┌─────────────────┐
        │   User sees     │
        │   response      │
        └─────────────────┘
\`\`\`

## Component Details

[Detailed breakdown of each component...]
```

**`DEPLOYMENT.md`** - Railway deployment guide

```markdown
# Deployment Guide - Railway

## Prerequisites
- GitHub repository with code
- Railway account
- All environment variables ready

## Deployment Steps

### 1. Connect Railway to GitHub
[Step-by-step with screenshots]

### 2. Configure Environment Variables
[List all required variables]

### 3. Initial Deployment
[Deployment process]

### 4. Custom Domain Setup
[DNS configuration]

### 5. SSL Certificate
[Automatic HTTPS setup]

## Monitoring

### View Logs
\`\`\`bash
railway logs
\`\`\`

### Check Deployment Status
[Railway dashboard overview]

## Rollback

If deployment fails:
1. Railway → Deployments
2. Select previous successful deployment
3. Click "Redeploy"
```

**`MAINTENANCE.md`** - Ongoing maintenance tasks

```markdown
# Maintenance Guide

## Regular Tasks

### Weekly
- [ ] Review chat analytics
- [ ] Check error logs
- [ ] Monitor API usage (OpenAI, Pinecone)

### Monthly
- [ ] Update dependencies
- [ ] Review and clean up old chat sessions
- [ ] Optimize Pinecone index (if needed)
- [ ] Backup Supabase database

## Updating Documents

When content changes:
1. Log in to admin panel
2. Delete outdated document
3. Upload new version
4. Verify in chat widget

## Cost Management

### OpenAI Costs
- Monitor at platform.openai.com/usage
- Set usage limits if needed
- Typical: $X per month for Y queries

### Pinecone Costs
- Free tier: 1 index, 5GB storage
- Paid: $0.096/GB/month
- Monitor at pinecone.io/usage

### Supabase Costs
- Free tier: 500MB database, 1GB storage
- Paid: $25/month for Pro
- Monitor at supabase.com/dashboard

## Troubleshooting

[Common issues and solutions...]
```

### 8.3 Production Deployment

**Pre-Deployment Checklist:**

- [ ] All tests passing
- [ ] Environment variables configured in Railway
- [ ] Supabase database set up with correct schema
- [ ] Pinecone index created and configured
- [ ] OpenAI API key has sufficient credits
- [ ] Admin user created in Supabase
- [ ] At least 3-5 test documents uploaded
- [ ] `.env.local` added to `.gitignore`
- [ ] README.md updated with deployment info

**Deployment Process:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy AI chat functionality"
   git push origin main
   ```

2. **Railway Auto-Deploys:**
   - Monitor build logs in Railway dashboard
   - Watch for errors
   - Build should complete in 2-5 minutes

3. **Verify Deployment:**
   - Visit production URL
   - Test chat widget
   - Send test messages
   - Verify document retrieval
   - Test admin login
   - Upload test document

### 8.4 Final Verification

**Production Tests:**

1. **Chat Functionality:**
   - [ ] Widget loads on all pages
   - [ ] Messages send successfully
   - [ ] Responses stream properly
   - [ ] Relevant documents retrieved
   - [ ] Session persists

2. **Performance:**
   - [ ] Page load < 2 seconds
   - [ ] Chat response < 2 seconds
   - [ ] No console errors

3. **Admin Panel:**
   - [ ] Login works
   - [ ] Document upload works
   - [ ] Documents appear in chat context

4. **Monitoring:**
   - [ ] Railway logs show no errors
   - [ ] Supabase shows database activity
   - [ ] Pinecone shows query activity
   - [ ] OpenAI shows API calls

---

## Key Adaptations from Sandusky Current

### Simplifications (Anonymous Chat)

**Removed:**
- ❌ User authentication for chat
- ❌ Subscription/payment system (Stripe)
- ❌ Query limits (free tier management)
- ❌ User profile management
- ❌ Saved conversation history across devices

**Kept:**
- ✅ Anonymous session tracking (localStorage)
- ✅ Chat history per session
- ✅ Analytics (anonymized)

### Additions Needed

**New Features:**
- ✅ Floating widget UI (Sandusky has embedded chat)
- ✅ Circular button → Chat window expansion
- ✅ Mobile full-screen mode
- ✅ Huron County-specific system prompt
- ✅ Ohio state branding (red #BA0C2F, blue #003B7A)

### Admin Only Authentication

- ✅ Supabase Auth only for `/admin` routes
- ✅ Role-based access control (admin_users table)
- ✅ Document upload restricted to admins
- ✅ Public chat access (no auth)

---

## Success Criteria

### Functional Requirements
✅ All existing page content and functionality preserved
✅ Chat widget appears on all pages, bottom-right corner
✅ Chat provides relevant answers using uploaded documents
✅ Admin can upload documents via secure admin panel
✅ Site deployed successfully on Railway

### Technical Requirements
✅ Mobile responsive on all devices
✅ Fast response times (< 2 seconds for chat)
✅ WCAG 2.1 AA accessibility compliance
✅ Cross-browser compatibility
✅ Error handling and graceful degradation

### Documentation Requirements
✅ Comprehensive documentation created
✅ Setup guide for developers
✅ Admin guide for content managers
✅ API documentation for future development
✅ Maintenance guide for ongoing support

---

## Timeline Estimate

| Phase | Description | Duration |
|-------|-------------|----------|
| 1 | Project Setup & Next.js Migration Foundation | 1 hour |
| 2 | Convert HTML Pages to Next.js | 3-4 hours |
| 3 | Supabase & Pinecone Setup | 1-2 hours |
| 4 | Build Floating Chat Widget UI | 2-3 hours |
| 5 | Implement Chat Functionality (Backend) | 3-4 hours |
| 6 | Admin Document Upload System | 2-3 hours |
| 7 | Testing & Quality Assurance | 2-3 hours |
| 8 | Railway Deployment & Documentation | 1-2 hours |

**Total Estimated Time: 15-22 hours of development**

---

## Cost Estimate

### Monthly Recurring Costs

**OpenAI:**
- GPT-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens
- Embeddings: $0.02 per 1M tokens
- Estimated: $10-50/month (depends on usage)

**Pinecone:**
- Free tier: 1 index, 5GB storage
- Paid: ~$10-30/month for typical usage

**Supabase:**
- Free tier: 500MB database, 1GB storage
- Pro ($25/month) recommended for production

**Railway:**
- $5 starter credit/month
- Additional usage-based pricing
- Estimated: $5-20/month for this project

**Total: $30-125/month** (depends on traffic)

---

## Next Steps After Completion

1. **Content Population:**
   - Upload job seeker guides
   - Upload employer information
   - Upload youth program materials
   - Upload event calendars

2. **Monitoring Setup:**
   - Set up error alerting
   - Monitor API usage
   - Track chat analytics

3. **Optimization:**
   - Review chat analytics to improve prompts
   - Add frequently asked questions to knowledge base
   - Optimize embedding strategy based on queries

4. **Marketing:**
   - Add chat widget announcement to homepage
   - Train staff on admin panel
   - Promote AI assistant to users

---

## Support & Contact

**For technical issues:**
- Check documentation in `/docs` directory
- Review Railway logs
- Contact: [Your contact info]

**For content updates:**
- Log in to admin panel at `/admin`
- Upload new documents
- Refer to Admin Guide

---

*This implementation plan is a living document and should be updated as the project evolves.*
