-- ============================================
-- Check and Fix Contest Status
-- ============================================
-- Run this in Supabase SQL Editor to diagnose and fix voting issues

-- 1. Check current contests and their status
SELECT id, week_number, year, status, start_date, end_date,
  CASE
    WHEN status = 'active' AND end_date > NOW() THEN '✓ Active and valid'
    WHEN status = 'active' AND end_date <= NOW() THEN '✗ Status is active but contest ended'
    WHEN status != 'active' AND end_date > NOW() THEN '✗ Contest should be active but status is: ' || status
    ELSE 'Contest ended normally'
  END as diagnosis
FROM contests
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check what get_active_contest returns
SELECT * FROM get_active_contest();

-- 3. If you need to manually set a contest to active, uncomment and run:
-- UPDATE contests
-- SET status = 'active'
-- WHERE id = 'YOUR-CONTEST-ID-HERE';

-- 4. If you need to create a new active contest, uncomment and modify:
-- INSERT INTO contests (week_number, year, start_date, end_date, status)
-- VALUES (
--   1,                                           -- week number
--   2025,                                        -- year
--   NOW(),                                       -- start date
--   NOW() + INTERVAL '7 days',                   -- end date (7 days from now)
--   'active'                                     -- status
-- );

-- 5. Check if there are any artworks for the active contest
SELECT c.id as contest_id, c.status, c.week_number, COUNT(a.id) as artwork_count
FROM contests c
LEFT JOIN artworks a ON a.contest_id = c.id
WHERE c.status = 'active'
GROUP BY c.id, c.status, c.week_number;
