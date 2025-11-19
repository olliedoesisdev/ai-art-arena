-- ============================================
-- Verification Script for Email Voting System
-- ============================================
-- Run this after migrating to verify everything is set up correctly

-- 1. Check if public_users table exists
SELECT 'public_users table' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'public_users'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status;

-- 2. Check votes table constraint
SELECT 'votes unique constraint' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'votes' AND constraint_name = 'votes_user_artwork_contest_unique'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status;

-- 3. Check can_vote function exists with correct parameters
SELECT 'can_vote function' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'can_vote'
    AND routine_schema = 'public'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status;

-- 4. Check vote count trigger
SELECT 'vote count trigger' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trigger_update_artwork_vote_count'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status;

-- 5. Show current votes table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'votes'
ORDER BY ordinal_position;
