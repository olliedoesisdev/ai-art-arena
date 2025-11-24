-- ============================================
-- Extend Active Contest for Another Week
-- ============================================

-- STEP 1: Check current contests
SELECT 'Current contests:' as info;
SELECT
  id,
  week_number,
  year,
  status,
  start_date,
  end_date,
  CASE
    WHEN end_date < NOW() THEN 'EXPIRED'
    WHEN end_date > NOW() AND status = 'active' THEN 'ACTIVE'
    ELSE status
  END as actual_status,
  (end_date - NOW()) as time_remaining
FROM contests
ORDER BY created_at DESC
LIMIT 5;

-- STEP 2: Extend the most recent contest by 7 days
UPDATE contests
SET
  end_date = end_date + INTERVAL '7 days',
  status = 'active'
WHERE id = (
  SELECT id
  FROM contests
  ORDER BY created_at DESC
  LIMIT 1
)
RETURNING
  id,
  week_number,
  status,
  start_date,
  end_date,
  (end_date - NOW()) as time_remaining;

SELECT '✓ Contest extended by 7 days!' as status;

-- STEP 3: Verify the active contest
SELECT 'Verification - Active contest:' as info;
SELECT * FROM get_active_contest();

-- STEP 4: Show artworks for the contest
SELECT 'Artworks in this contest:' as info;
SELECT
  a.id,
  a.title,
  a.artist_name,
  a.vote_count
FROM contests c
JOIN artworks a ON a.contest_id = c.id
WHERE c.status = 'active'
ORDER BY a.created_at;
