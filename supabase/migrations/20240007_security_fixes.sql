-- Security fix: exclude password reset tokens from public read policy.
-- system_config rows with key LIKE 'reset:%' are transient auth tokens
-- and must not be readable by anonymous clients.

DROP POLICY IF EXISTS "system_config_select_public" ON system_config;

CREATE POLICY "system_config_select_public"
  ON system_config FOR SELECT
  USING (key NOT LIKE 'reset:%');

-- Unique index on (user_id, contest_id) to enforce one vote per
-- authenticated user at the DB level, independent of the RPC guard.
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_user_contest
  ON votes(user_id, contest_id)
  WHERE user_id IS NOT NULL;
