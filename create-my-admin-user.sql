-- ============================================
-- CREATE YOUR ADMIN USER
-- ============================================

-- Step 1: Check if you already have a Supabase auth user
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'olliedoesis.dev@gmail.com';

-- If you see a user above, copy the 'id' and use it in Step 3
-- If no user exists, you have two options:

-- ============================================
-- OPTION A: Create via Supabase Dashboard (Recommended)
-- ============================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create new user"
-- 3. Email: olliedoesis.dev@gmail.com
-- 4. Password: (choose a strong password)
-- 5. Check "Auto Confirm User"
-- 6. Click "Create user"
-- 7. Copy the User ID (UUID)
-- 8. Then run the INSERT below with that UUID

-- ============================================
-- OPTION B: Sign up through your app
-- ============================================
-- 1. Go to http://localhost:3000/admin/signup
-- 2. Enter email: olliedoesis.dev@gmail.com
-- 3. Enter a strong password
-- 4. Click "Sign Up"
-- 5. Check your email and confirm (or check "Auto Confirm" in Supabase settings)
-- 6. Then run Step 1 query above to get your user ID

-- ============================================
-- Step 3: Add yourself to admin_users table
-- ============================================
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from Step 1 or Option A/B

INSERT INTO admin_users (id, email, name, role, is_active)
VALUES (
  'YOUR_USER_ID_HERE',  -- ⚠️ REPLACE THIS with your actual UUID
  'olliedoesis.dev@gmail.com',
  'Oliver White',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE
SET is_active = true, role = 'admin';

-- ============================================
-- Step 4: Verify it worked
-- ============================================
SELECT
  au.id,
  au.email,
  au.name,
  au.role,
  au.is_active,
  au.created_at,
  u.email as auth_email,
  u.email_confirmed_at
FROM admin_users au
JOIN auth.users u ON u.id = au.id
WHERE au.email = 'olliedoesis.dev@gmail.com';

-- Expected: One row with role='admin' and is_active=true
