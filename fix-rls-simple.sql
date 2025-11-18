-- ============================================
-- FIX RLS POLICIES - REMOVE INFINITE RECURSION
-- ============================================

-- Drop ALL existing policies on admin_users
DROP POLICY IF EXISTS "Users can view their own admin profile" ON admin_users;
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can create admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON admin_users;
DROP POLICY IF EXISTS "Only admins can delete admin users" ON admin_users;

-- SIMPLE POLICY: Allow authenticated users to read their own record
-- This is all we need for login to work!
CREATE POLICY "Allow users to read own admin record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SIMPLE POLICY: Allow authenticated users to update their own last_login
CREATE POLICY "Allow users to update own last_login"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- For admin dashboard features, we'll use the service role key from API routes
-- This avoids any recursion issues

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;
