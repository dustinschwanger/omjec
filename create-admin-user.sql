-- Create Admin User SQL Script
-- Run this in your Supabase SQL Editor

-- Step 1: Create the auth user
-- Replace 'your-email@example.com' and 'your-secure-password' with your desired credentials
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'dustinschwanger@gmail.com', 
  crypt('YourSecurePassword123', gen_salt('bf')), 
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
)
RETURNING id;

-- Step 2: Add user to admin_users table
-- This will use the ID from the user just created above
-- Run this as a SEPARATE query after the first one completes:

INSERT INTO admin_users (auth_id, email, is_active)
SELECT
  id,
  email,
  TRUE
FROM auth.users
WHERE email = 'dustinschwanger@gmail.com'; -- CHANGE THIS to match the email above

-- Step 3: Verify the admin user was created successfully
SELECT
  u.id,
  u.email,
  u.created_at,
  a.is_active as is_admin
FROM auth.users u
LEFT JOIN admin_users a ON a.auth_id = u.id
WHERE u.email = 'dustinschwanger@gmail.com'; -- CHANGE THIS to match the email above
