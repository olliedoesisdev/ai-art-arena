-- Quick script to activate your contest and verify it works

-- 1. Activate the contest
UPDATE contests
SET
  status = 'active',
  start_date = NOW() - INTERVAL '1 hour',  -- Started 1 hour ago
  end_date = NOW() + INTERVAL '6 days 23 hours'  -- Ends in ~7 days
WHERE week_number = 1 AND year = 2025
RETURNING id, title, week_number, status, start_date, end_date;

-- 2. Verify get_active_contest() works
SELECT
  contest_id,
  week_number,
  start_date,
  end_date,
  time_remaining
FROM get_active_contest();

-- 3. If no results above, check all contests
SELECT
  id,
  title,
  week_number,
  year,
  status,
  start_date,
  end_date,
  (start_date <= NOW()) as has_started,
  (end_date > NOW()) as not_ended
FROM contests
ORDER BY created_at DESC;
