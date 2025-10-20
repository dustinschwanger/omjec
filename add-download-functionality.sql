-- Phase 7: Add Download Functionality to Documents
-- Run this in your Supabase SQL Editor

-- ============================================
-- Add is_downloadable field to documents table
-- ============================================

ALTER TABLE documents
ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN DEFAULT false;

-- ============================================
-- Create download analytics table (anonymous tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS document_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  download_count INTEGER DEFAULT 1,
  last_downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_document_downloads_document_id
ON document_downloads(document_id);

-- ============================================
-- Row Level Security for document_downloads
-- ============================================

ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read download stats" ON document_downloads;
DROP POLICY IF EXISTS "Service role can manage download stats" ON document_downloads;

-- Public can read download stats
CREATE POLICY "Public can read download stats"
  ON document_downloads FOR SELECT
  TO public
  USING (true);

-- Only service role can insert/update download stats
CREATE POLICY "Service role can manage download stats"
  ON document_downloads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Update existing documents
-- ============================================

-- Set all existing documents as non-downloadable by default
UPDATE documents
SET is_downloadable = false
WHERE is_downloadable IS NULL;

-- ============================================
-- Verification queries
-- ============================================

-- Check that column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'documents' AND column_name = 'is_downloadable';

-- Check that table was created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'document_downloads'
ORDER BY ordinal_position;
