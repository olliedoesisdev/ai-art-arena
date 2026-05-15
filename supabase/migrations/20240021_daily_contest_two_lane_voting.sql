-- Migration 20240021: daily contests + two-lane vote limits
--
-- Changes:
--   1. system_config: contest_duration_days 7 → 1
--   2. system_config: add max_votes_per_ip_per_contest = 5
--   3. Drop idx_votes_unique_ip_contest (IPs can now cast up to 5 votes)
--   4. Rewrite submit_vote with two-lane logic:
--      - Authenticated users: 1 vote per contest (user_id unique index enforces this)
--      - Anonymous users:     up to 5 votes per IP per contest (count check)

-- ── 1. system_config ─────────────────────────────────────────────────────────

UPDATE system_config SET value = '1' WHERE key = 'contest_duration_days';

INSERT INTO system_config (key, value, description)
VALUES ('max_votes_per_ip_per_contest', '5', 'Maximum anonymous votes allowed from a single IP address per contest')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ── 2. Drop IP uniqueness constraint ─────────────────────────────────────────

DROP INDEX IF EXISTS idx_votes_unique_ip_contest;

-- Replace with a non-unique index so the column is still fast to query
CREATE INDEX IF NOT EXISTS idx_votes_ip_contest
  ON votes (ip_hash, contest_id);

-- ── 3. Rewrite submit_vote ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION submit_vote(
  p_artwork_id  UUID,
  p_user_id     UUID    DEFAULT NULL,
  p_ip_hash     TEXT    DEFAULT NULL,
  p_email_hash  TEXT    DEFAULT NULL
)
RETURNS TABLE (
  success     BOOLEAN,
  error_code  TEXT,
  vote_count  INTEGER,
  contest_id  UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contest_id   UUID;
  v_contest_status TEXT;
  v_vote_count   INTEGER;
  v_ip_vote_count INTEGER;
  v_max_ip_votes  INTEGER;
BEGIN
  -- ── Resolve contest from artwork ──────────────────────────────────────────
  SELECT a.contest_id, c.status
  INTO v_contest_id, v_contest_status
  FROM artworks a
  LEFT JOIN contests c ON c.id = a.contest_id
  WHERE a.id = p_artwork_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'ARTWORK_NOT_FOUND'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  IF v_contest_id IS NULL OR v_contest_status IS NULL THEN
    RETURN QUERY SELECT false, 'CONTEST_NOT_FOUND'::TEXT, 0, v_contest_id;
    RETURN;
  END IF;

  IF v_contest_status <> 'active' THEN
    RETURN QUERY SELECT false, 'CONTEST_NOT_ACTIVE'::TEXT, 0, v_contest_id;
    RETURN;
  END IF;

  -- ── Two-lane duplicate check ──────────────────────────────────────────────
  --
  -- Lane A — authenticated: 1 vote per user per contest (enforced by unique
  --   index idx_votes_unique_user_contest). Check here for a clean error code.
  --
  -- Lane B — anonymous: up to max_votes_per_ip_per_contest per IP per contest.
  --   Count existing anonymous votes from this IP and compare against config.

  IF p_user_id IS NOT NULL THEN
    -- Lane A: authenticated user
    IF EXISTS (
      SELECT 1 FROM votes
      WHERE user_id = p_user_id
        AND contest_id = v_contest_id
    ) THEN
      RETURN QUERY SELECT false, 'ALREADY_VOTED'::TEXT, 0, v_contest_id;
      RETURN;
    END IF;

    -- Also block if same email has voted (covers sign-in after anon vote)
    IF p_email_hash IS NOT NULL AND EXISTS (
      SELECT 1 FROM votes
      WHERE email_hash = p_email_hash
        AND contest_id = v_contest_id
    ) THEN
      RETURN QUERY SELECT false, 'ALREADY_VOTED'::TEXT, 0, v_contest_id;
      RETURN;
    END IF;

  ELSE
    -- Lane B: anonymous — check IP vote count against config
    SELECT COALESCE(value::INTEGER, 5)
    INTO v_max_ip_votes
    FROM system_config
    WHERE key = 'max_votes_per_ip_per_contest';

    SELECT COUNT(*)
    INTO v_ip_vote_count
    FROM votes
    WHERE ip_hash = p_ip_hash
      AND contest_id = v_contest_id
      AND user_id IS NULL;

    IF v_ip_vote_count >= v_max_ip_votes THEN
      RETURN QUERY SELECT false, 'ALREADY_VOTED'::TEXT, 0, v_contest_id;
      RETURN;
    END IF;
  END IF;

  -- ── Insert vote ───────────────────────────────────────────────────────────
  BEGIN
    INSERT INTO votes (artwork_id, contest_id, user_id, ip_hash, email_hash)
    VALUES (p_artwork_id, v_contest_id, p_user_id, p_ip_hash, p_email_hash);
  EXCEPTION WHEN unique_violation THEN
    RETURN QUERY SELECT false, 'ALREADY_VOTED'::TEXT, 0, v_contest_id;
    RETURN;
  END;

  -- ── Bump denormalised counter ─────────────────────────────────────────────
  UPDATE artworks
  SET vote_count = vote_count + 1
  WHERE id = p_artwork_id
  RETURNING vote_count INTO v_vote_count;

  RETURN QUERY SELECT true, NULL::TEXT, v_vote_count, v_contest_id;
END;
$$;
