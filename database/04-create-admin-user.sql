-- =============================================
-- Create Your Admin User
-- Run this AFTER you've signed up via the admin signup page
-- =============================================

-- Replace 'your-email@example.com' with the email you used to sign up
-- This will add you to the admin.users table with super_admin role

BEGIN;

-- Find the user ID from Supabase auth.users and insert into admin.users
INSERT INTO admin.users (id, email, name, role, is_active)
SELECT
  id,
  email,
  raw_user_meta_data->>'name' as name,
  'super_admin' as role,
  true as is_active
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE
SET
  role = 'super_admin',
  is_active = true,
  updated_at = now();

COMMIT;

-- Verify the admin user was created
SELECT
  id,
  email,
  name,
  role,
  is_active,
  created_at
FROM admin.users
WHERE email = 'your-email@example.com';

-- Success message
DO $$
DECLARE
  user_email text := 'your-email@example.com';
  user_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM admin.users WHERE email = user_email
  ) INTO user_exists;

  IF user_exists THEN
    RAISE NOTICE 'Admin user created successfully!';
    RAISE NOTICE 'Email: %', user_email;
    RAISE NOTICE 'Role: super_admin';
  ELSE
    RAISE NOTICE 'User not found in auth.users with email: %', user_email;
    RAISE NOTICE 'Please sign up first at /admin/signup';
  END IF;
END $$;
