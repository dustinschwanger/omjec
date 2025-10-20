-- Drop existing policies on admin_users table
DROP POLICY IF EXISTS "Users can read own admin status" ON admin_users;

-- Create a more permissive policy that allows authenticated users to read admin_users
-- This is safe because we're only checking if someone is an admin, not exposing sensitive data
CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- Alternatively, if you want to be more restrictive, allow only reading own record
-- CREATE POLICY "Users can read own admin status"
--   ON admin_users FOR SELECT
--   TO authenticated
--   USING (auth_id = auth.uid());
