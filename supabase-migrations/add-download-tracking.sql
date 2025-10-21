-- Add download tracking to documents table and create downloads tracking table
-- This enables the download feature in the AI chat

-- Add is_downloadable column to documents table
ALTER TABLE documents
ADD COLUMN is_downloadable BOOLEAN DEFAULT true;

-- Create index for faster queries on downloadable documents
CREATE INDEX idx_documents_downloadable ON documents(is_downloadable) WHERE is_downloadable = true;

-- Create document_downloads tracking table
CREATE TABLE document_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  download_count INTEGER DEFAULT 1,
  last_downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index to prevent duplicate tracking records
CREATE UNIQUE INDEX idx_document_downloads_document_id ON document_downloads(document_id);

-- Create index for faster queries
CREATE INDEX idx_document_downloads_last_downloaded ON document_downloads(last_downloaded_at DESC);

-- Enable RLS on document_downloads
ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;

-- Public can read download stats
CREATE POLICY "Public can read download stats"
  ON document_downloads FOR SELECT
  USING (true);

-- System can write download tracking (no user auth required)
CREATE POLICY "System can track downloads"
  ON document_downloads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update download stats"
  ON document_downloads FOR UPDATE
  USING (true);
