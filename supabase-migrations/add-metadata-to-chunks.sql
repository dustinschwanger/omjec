-- Add metadata column to document_chunks table
-- This stores chunk metadata like document title, type, download URL, etc.

ALTER TABLE document_chunks
ADD COLUMN metadata JSONB;

-- Create index on metadata for faster queries
CREATE INDEX idx_document_chunks_metadata ON document_chunks USING GIN (metadata);
