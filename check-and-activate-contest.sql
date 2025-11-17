-- ============================================
-- CHECK AND ACTIVATE EXISTING CONTEST
-- ============================================
-- This will show your contests and activate one

-- Step 1: See all contests
SELECT
  id,
  title,
  week_number,
  year,
  status,
  start_date,
  end_date,
  (end_date > NOW()) as is_future,
  (start_date <= NOW() AND end_date > NOW()) as should_be_active
FROM contests
ORDER BY created_at DESC;

-- Step 2: Activate the first contest (if it exists)
-- This will make it show on your website
UPDATE contests
SET
  status = 'active',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '7 days'
WHERE week_number = 1 AND year = 2025
RETURNING id, title, status, start_date, end_date;

-- Step 3: Verify the get_active_contest function works
SELECT * FROM get_active_contest();

-- Step 4: Check if there are any artworks for this contest
SELECT
  a.id,
  a.title,
  a.contest_id,
  a.vote_count,
  c.week_number
FROM artworks a
JOIN contests c ON c.id = a.contest_id
WHERE c.week_number = 1 AND c.year = 2025;
