-- Safe migration: Only add what's missing for download tracking

-- Create index for faster queries on downloadable documents (if not exists)
CREATE INDEX IF NOT EXISTS idx_documents_downloadable ON documents(is_downloadable) WHERE is_downloadable = true;

-- Create document_downloads tracking table (if not exists)
CREATE TABLE IF NOT EXISTS document_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  download_count INTEGER DEFAULT 1,
  last_downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index to prevent duplicate tracking records
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_downloads_document_id ON document_downloads(document_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_document_downloads_last_downloaded ON document_downloads(last_downloaded_at DESC);

-- Enable RLS on document_downloads
ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist and recreate them
DROP POLICY IF EXISTS "Public can read download stats" ON document_downloads;
DROP POLICY IF EXISTS "System can track downloads" ON document_downloads;
DROP POLICY IF EXISTS "System can update download stats" ON document_downloads;

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
