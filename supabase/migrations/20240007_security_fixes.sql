-- Applied directly to production via Supabase MCP (not via supabase db push).
-- The live DB was created manually and has no migration history.
-- This file documents what was applied.

-- 1. system_config table (was missing from live DB)
CREATE TABLE IF NOT EXISTS system_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Public can read config constants but NOT reset tokens
CREATE POLICY "system_config_select_public"
  ON system_config FOR SELECT
  USING (key NOT LIKE 'reset:%');

INSERT INTO system_config (key, value, description) VALUES
  ('voting_cooldown_hours',    '24', 'Hours between votes per IP per contest'),
  ('contest_duration_days',    '7',  'Default contest duration in days'),
  ('max_votes_per_ip_per_day', '1',  'Max votes per IP address per day')
ON CONFLICT (key) DO NOTHING;

-- 2. Remove open artworks UPDATE policy (vote_count only modified by RPC)
DROP POLICY IF EXISTS "artworks_update_vote_count" ON artworks;

-- 3. submit_vote and get_homepage_stats RPCs
-- (see 20240003_submit_vote_function.sql for full definitions — reapplied here)

-- 4. Unique index on (user_id, contest_id) — already existed in live DB
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_user_contest
--   ON votes(user_id, contest_id)
--   WHERE user_id IS NOT NULL;
