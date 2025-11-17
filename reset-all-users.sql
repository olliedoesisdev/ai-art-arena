-- ============================================
-- RESET ALL USERS - FRESH START
-- ============================================
-- WARNING: This will delete ALL users from your database!
-- Only run this in development, never in production!

-- ============================================
-- Step 1: Delete all votes first (no foreign key dependencies)
-- ============================================
DELETE FROM votes;

-- ============================================
-- Step 2: Delete all audit logs
-- ============================================
DELETE FROM audit_logs;

-- ============================================
-- Step 3: Delete all auth users
-- ============================================
-- This will CASCADE DELETE admin_users automatically
-- because admin_users.id references auth.users(id) ON DELETE CASCADE
DELETE FROM auth.users;

-- ============================================
-- Verification: Check all tables are empty
-- ============================================

-- Check admin_users
SELECT COUNT(*) as admin_users_count FROM admin_users;

-- Check auth.users
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Check votes
SELECT COUNT(*) as votes_count FROM votes;

-- All counts should be 0

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ All users deleted successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create a new admin user via Supabase Dashboard';
  RAISE NOTICE '2. Or sign up at /admin/signup';
  RAISE NOTICE '';
END $$;
