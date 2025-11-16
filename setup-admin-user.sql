-- ============================================
-- Setup Admin User: olliedoesis.dev@gmail.com
-- ============================================
-- This script will help you create your admin user account

-- STEP 1: First, check if you already have a Supabase Auth user
-- Run this query to see if your user exists:
SELECT id, email, created_at
FROM auth.users
WHERE email = 'olliedoesis.dev@gmail.com';

-- If the query returns a row, copy the 'id' (UUID) for use in STEP 3
-- If no row is returned, you need to create a user first (see STEP 2)

-- ============================================
-- STEP 2: Create Supabase Auth User (if needed)
-- ============================================
-- You have TWO options to create a user:

-- OPTION A: Use the Supabase Dashboard (Recommended)
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create new user"
-- 3. Email: olliedoesis.dev@gmail.com
-- 4. Password: Choose a strong password
-- 5. Click "Create user"
-- 6. Copy the User ID (UUID) that appears

-- OPTION B: Sign up through your app
-- 1. Go to http://localhost:3000/admin/signup
-- 2. Enter email: olliedoesis.dev@gmail.com
-- 3. Enter a strong password
-- 4. Click "Sign Up"
-- 5. Then run the SELECT query from STEP 1 to get your user ID

-- ============================================
-- STEP 3: Add User to admin_users Table
-- ============================================
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from STEP 1 or STEP 2

INSERT INTO admin_users (id, email, name, role, is_active)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your actual UUID
  'olliedoesis.dev@gmail.com',
  'Oliver White',       -- You can change this to your preferred name
  'admin',              -- Full admin access
  true
);

-- Example (DO NOT use this UUID - it's just an example):
-- INSERT INTO admin_users (id, email, name, role, is_active)
-- VALUES (
--   '123e4567-e89b-12d3-a456-426614174000',
--   'olliedoesis.dev@gmail.com',
--   'Oliver White',
--   'admin',
--   true
-- );

-- ============================================
-- STEP 4: Verify Your Admin User Was Created
-- ============================================
SELECT
  au.id,
  au.email,
  au.name,
  au.role,
  au.is_active,
  au.created_at,
  u.email as auth_email
FROM admin_users au
JOIN auth.users u ON u.id = au.id
WHERE au.email = 'olliedoesis.dev@gmail.com';

-- Expected result:
-- - One row with your user details
-- - role should be 'admin'
-- - is_active should be 'true'
-- - auth_email should match your email

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If you get "duplicate key value" error:
-- The user already exists in admin_users. Check with:
SELECT * FROM admin_users WHERE email = 'olliedoesis.dev@gmail.com';

-- If you get "foreign key violation" error:
-- The user doesn't exist in auth.users yet. Complete STEP 2 first.

-- If login fails with "You do not have admin access":
-- Check that is_active is true:
UPDATE admin_users
SET is_active = true
WHERE email = 'olliedoesis.dev@gmail.com';

-- ============================================
-- NEXT STEPS
-- ============================================
-- Once your admin user is created:
-- 1. Go to http://localhost:3000/admin/login
-- 2. Sign in with: olliedoesis.dev@gmail.com and your password
-- 3. You should be redirected to the admin dashboard
-- 4. Start managing your contests and artworks!
