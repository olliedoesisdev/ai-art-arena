-- ============================================
-- FIX RLS POLICIES FOR LOGIN
-- ============================================

-- The issue: Users can't see admin_users table during login
-- because RLS policies are too restrictive

-- Solution: Allow authenticated users to check if THEY are an admin
-- (but not see OTHER admin users)

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can view their own profile" ON admin_users;

-- New policy: Authenticated users can see their own admin record
-- This allows the login page to check if the logged-in user is an admin
CREATE POLICY "Users can view their own admin profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admin-only policy: Admins can see all other admin users
-- This allows the admin dashboard to show the admin users list
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.role = 'admin'
      AND au.is_active = true
    )
  );

-- Verify policies are working
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;
