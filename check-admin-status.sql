-- Check current admin users
SELECT
  au.id,
  au.email,
  au.auth_id,
  au.is_active,
  u.email as auth_email
FROM admin_users au
LEFT JOIN auth.users u ON au.auth_id = u.id;

-- If your record is missing or has the wrong auth_id, run this:
-- First, get your current auth user ID:
SELECT id, email FROM auth.users WHERE email = 'dustinschwanger@gmail.com';

-- Then either insert or update your admin record:
-- Replace 'YOUR_AUTH_ID' with the id from the query above

-- If record exists but wrong auth_id, update it:
UPDATE admin_users
SET auth_id = (SELECT id FROM auth.users WHERE email = 'dustinschwanger@gmail.com'),
    is_active = true
WHERE email = 'dustinschwanger@gmail.com';

-- If record doesn't exist at all, insert it:
INSERT INTO admin_users (email, auth_id, is_active)
VALUES (
  'dustinschwanger@gmail.com',
  (SELECT id FROM auth.users WHERE email = 'dustinschwanger@gmail.com'),
  true
)
ON CONFLICT (email)
DO UPDATE SET
  auth_id = (SELECT id FROM auth.users WHERE email = 'dustinschwanger@gmail.com'),
  is_active = true;
