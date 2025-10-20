-- Fix admin_users RLS Policy
-- This allows authenticated users to check their own admin status

-- Add policy for users to read their own admin record
CREATE POLICY "Users can read own admin status"
  ON admin_users FOR SELECT
  USING (auth.uid() = auth_id);

-- Alternatively, if you want to allow all authenticated users to check if they're admins:
-- (This is useful for the login flow)
-- DROP POLICY IF EXISTS "Users can read own admin status" ON admin_users;
-- CREATE POLICY "Authenticated users can read admin_users"
--   ON admin_users FOR SELECT
--   USING (auth.role() = 'authenticated');
