-- ============================================
-- Diagnose Voting System Issues
-- ============================================

-- Check 1: See the current can_vote function definition
SELECT 'Current can_vote function:' as info;
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'can_vote'
  AND routine_schema = 'public';

-- Check 2: See the current get_user_votes_today function definition
SELECT 'Current get_user_votes_today function:' as info;
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'get_user_votes_today'
  AND routine_schema = 'public';

-- Check 3: List all votes in the database
SELECT 'All votes in database:' as info;
SELECT
  v.id,
  v.artwork_id,
  v.user_id,
  v.vote_date,
  v.voted_at,
  a.title as artwork_title
FROM votes v
LEFT JOIN artworks a ON a.id = v.artwork_id
ORDER BY v.voted_at DESC
LIMIT 20;

-- Check 4: See the constraint on votes table
SELECT 'Unique constraint on votes:' as info;
SELECT
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'votes'
  AND tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
ORDER BY kcu.ordinal_position;

-- Check 5: List all triggers on votes table
SELECT 'Triggers on votes table:' as info;
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'votes'
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- Check 6: Sample test of can_vote function
-- Replace these UUIDs with actual values from your database
SELECT 'Testing can_vote function...' as info;
SELECT 'Note: Replace UUIDs below with actual values to test' as note;
-- SELECT can_vote(
--   '<artwork_id>'::UUID,
--   '<user_id>'::UUID,
--   '<contest_id>'::UUID
-- ) as can_user_vote;
