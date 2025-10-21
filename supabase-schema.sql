-- Huron County Means Jobs - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Chat sessions (anonymous users)
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
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
  word_count INTEGER,
  response_time_ms INTEGER,
  has_web_search BOOLEAN DEFAULT FALSE,
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
  is_downloadable BOOLEAN DEFAULT TRUE,
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
  metadata JSONB,
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

-- Document downloads tracking
CREATE TABLE document_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  download_count INTEGER DEFAULT 1,
  last_downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_downloadable ON documents(is_downloadable) WHERE is_downloadable = true;
CREATE INDEX idx_chat_analytics_created_at ON chat_analytics(created_at DESC);
CREATE INDEX idx_chat_sessions_token ON chat_sessions(session_token);
CREATE UNIQUE INDEX idx_document_downloads_document_id ON document_downloads(document_id);
CREATE INDEX idx_document_downloads_last_downloaded ON document_downloads(last_downloaded_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read for processed documents
CREATE POLICY "Public can read processed documents"
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

-- Admins can read analytics
CREATE POLICY "Admins can read analytics"
  ON chat_analytics FOR SELECT
  USING (
    auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true)
  );

-- Public can read download stats
CREATE POLICY "Public can read download stats"
  ON document_downloads FOR SELECT
  USING (true);

-- System can track downloads
CREATE POLICY "System can track downloads"
  ON document_downloads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update download stats"
  ON document_downloads FOR UPDATE
  USING (true);

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

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can read document files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Admins can upload document files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY "Admins can delete document files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true)
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for documents table
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_activity_at on chat sessions
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET last_activity_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for chat_messages
CREATE TRIGGER update_session_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- ============================================
-- DONE!
-- ============================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create your admin user account in Supabase Auth';
  RAISE NOTICE '2. Add your user ID to the admin_users table';
  RAISE NOTICE '3. Start uploading documents through the admin panel';
END $$;
