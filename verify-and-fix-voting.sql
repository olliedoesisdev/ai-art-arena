-- ============================================
-- Verify and Fix Email-Based Voting System
-- ============================================
-- Run this in Supabase SQL Editor to diagnose and fix all voting issues

-- STEP 1: Check if public_users table exists
SELECT 'Checking public_users table...' as step;
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'public_users'
    )
    THEN '✓ public_users table exists'
    ELSE '✗ public_users table MISSING - run migrate-to-email-voting.sql first!'
  END as status;

-- STEP 2: Check votes table schema
SELECT 'Checking votes table schema...' as step;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'votes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 3: Check constraints on votes table
SELECT 'Checking votes table constraints...' as step;
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'votes' AND table_schema = 'public';

-- STEP 4: Check if can_vote function exists with correct signature
SELECT 'Checking can_vote function...' as step;
SELECT
  routine_name,
  routine_type,
  data_type as return_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'can_vote' AND routine_schema = 'public';

-- STEP 5: Drop old can_vote function and create new one
DROP FUNCTION IF EXISTS can_vote(UUID, TEXT);
DROP FUNCTION IF EXISTS can_vote(UUID, UUID, UUID);

CREATE OR REPLACE FUNCTION can_vote(
  p_artwork_id UUID,
  p_user_id UUID,
  p_contest_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  -- Check if user has already voted for this artwork in this contest
  SELECT EXISTS (
    SELECT 1
    FROM votes
    WHERE artwork_id = p_artwork_id
      AND user_id = p_user_id
      AND contest_id = p_contest_id
  ) INTO vote_exists;

  RETURN NOT vote_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_vote(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_vote(UUID, UUID, UUID) TO anon;

SELECT '✓ can_vote function created successfully' as status;

-- STEP 6: Check active contest
SELECT 'Checking active contest...' as step;
SELECT
  id,
  week_number,
  year,
  status,
  start_date,
  end_date,
  CASE
    WHEN status = 'active' AND end_date > NOW() THEN '✓ Contest is active and valid'
    WHEN status = 'active' AND end_date <= NOW() THEN '✗ Contest expired but status still active'
    ELSE 'Contest is ' || status
  END as diagnosis
FROM contests
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 1;

-- STEP 7: Check artworks for active contest
SELECT 'Checking artworks for active contest...' as step;
SELECT
  c.id as contest_id,
  c.week_number,
  c.status as contest_status,
  COUNT(a.id) as artwork_count
FROM contests c
LEFT JOIN artworks a ON a.contest_id = c.id
WHERE c.status = 'active'
GROUP BY c.id, c.week_number, c.status;

-- STEP 8: Check if any votes exist
SELECT 'Checking existing votes...' as step;
SELECT
  COUNT(*) as total_votes,
  COUNT(DISTINCT user_id) as unique_voters,
  COUNT(DISTINCT contest_id) as contests_with_votes
FROM votes;

-- STEP 9: Verify RLS policies on public_users
SELECT 'Checking RLS policies on public_users...' as step;
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'public_users';

-- STEP 10: Summary and recommendations
SELECT 'SUMMARY' as step;
SELECT
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'public_users')
    THEN '✗ CRITICAL: Run migrate-to-email-voting.sql first!'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'can_vote')
    THEN '✗ CRITICAL: can_vote function missing (should be fixed by this script)'
    WHEN NOT EXISTS (SELECT 1 FROM contests WHERE status = 'active')
    THEN '⚠ WARNING: No active contest - users cannot vote'
    ELSE '✓ All checks passed! Voting should work.'
  END as overall_status;
