-- ============================================
-- AUTO FIRST ADMIN - Migration
-- ============================================
-- This migration adds functionality to automatically make
-- the first user to sign up an admin.
-- Run this AFTER supabase-admin-schema.sql

-- ============================================
-- 1. Create function to auto-create admin user on signup
-- ============================================
CREATE OR REPLACE FUNCTION auto_create_first_admin()
RETURNS TRIGGER AS $$
DECLARE
  admin_count INTEGER;
  user_name TEXT;
BEGIN
  -- Count existing admin users
  SELECT COUNT(*) INTO admin_count FROM admin_users;

  -- If this is the first user, make them an admin
  IF admin_count = 0 THEN
    -- Extract name from metadata (works for both email/password and OAuth)
    user_name := COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'user_name',
      split_part(NEW.email, '@', 1)
    );

    INSERT INTO admin_users (id, email, name, role, is_active)
    VALUES (
      NEW.id,
      NEW.email,
      user_name,
      'admin',
      true
    );

    RAISE NOTICE 'First user % has been granted admin access', NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Create trigger on auth.users table
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created_auto_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_first_admin();

-- ============================================
-- 3. Update RLS policy to allow first user creation
-- ============================================
-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Only admins can create admin users" ON admin_users;

-- Create new policy that allows:
-- 1. Admins to create new admin users
-- 2. Automatic creation via trigger (SECURITY DEFINER handles this)
CREATE POLICY "Admins can create admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.role = 'admin'
      AND au.is_active = true
    )
  );

-- Allow service role (used by triggers) to bypass RLS
ALTER TABLE admin_users FORCE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION
-- ============================================
-- To verify this is working:
-- 1. Check the trigger exists:
--    SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_auto_admin';
--
-- 2. After first signup, check admin_users:
--    SELECT * FROM admin_users;
--
-- 3. Check the function:
--    SELECT routine_name FROM information_schema.routines
--    WHERE routine_name = 'auto_create_first_admin';
