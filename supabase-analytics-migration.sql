-- Migration to add analytics fields to existing database
-- Run this in Supabase SQL Editor if you already have the database created

-- Add missing columns to chat_analytics table
ALTER TABLE chat_analytics ADD COLUMN IF NOT EXISTS word_count INTEGER;
ALTER TABLE chat_analytics ADD COLUMN IF NOT EXISTS has_web_search BOOLEAN DEFAULT FALSE;

-- Create admin analytics read policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'chat_analytics'
    AND policyname = 'Admins can read analytics'
  ) THEN
    CREATE POLICY "Admins can read analytics"
      ON chat_analytics FOR SELECT
      USING (
        auth.uid() IN (SELECT auth_id FROM admin_users WHERE is_active = true)
      );
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Analytics migration completed successfully!';
  RAISE NOTICE 'New fields: word_count, has_web_search';
END $$;
