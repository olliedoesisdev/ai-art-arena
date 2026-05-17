-- Migration 20240027: multi-vote per authenticated user
--
-- New voting model for authenticated users (Lane A):
--   - Up to 10 votes per contest (max_votes_per_user_per_contest)
--   - Up to 5 votes on any single artwork (max_votes_per_user_per_artwork)
--   - Anonymous users (Lane B) unchanged: IP-based cap from system_config
--
-- Changes:
--   1. Drop the unique constraint on (user_id, contest_id) in votes — no longer 1 vote per user per contest
--   2. Add system_config rows for the new caps
--   3. Rewrite submit_vote to enforce per-user per-contest and per-artwork limits

-- ── 1. Drop unique constraint if it exists ────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'idx_votes_unique_user_contest'
      AND conrelid = 'votes'::regclass
  ) THEN
    ALTER TABLE votes DROP CONSTRAINT idx_votes_unique_user_contest;
  END IF;
END $$;

-- Also drop the unique index form (may exist as index rather than constraint)
DROP INDEX IF EXISTS idx_votes_unique_user_contest;

-- ── 2. Add system_config rows ─────────────────────────────────────────────────

INSERT INTO system_config (key, value, description)
VALUES
  ('max_votes_per_user_per_contest', '10', 'Maximum votes an authenticated user may cast per contest'),
  ('max_votes_per_user_per_artwork', '5',  'Maximum votes an authenticated user may cast on a single artwork')
ON CONFLICT (key) DO UPDATE
  SET value       = EXCLUDED.value,
      description = EXCLUDED.description;

-- ── 3. Rewrite submit_vote ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.submit_vote(
  p_artwork_id  UUID,
  p_user_id     UUID    DEFAULT NULL,
  p_ip_hash     TEXT    DEFAULT NULL,
  p_email_hash  TEXT    DEFAULT NULL
)
RETURNS TABLE(success boolean, error_code text, vote_count integer, contest_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_contest_id          UUID;
  v_contest_status      TEXT;
  v_vote_count          INTEGER;
  v_user_contest_votes  INTEGER;
  v_user_artwork_votes  INTEGER;
  v_max_per_contest     INTEGER;
  v_max_per_artwork     INTEGER;
  v_ip_vote_count       INTEGER;
  v_max_ip_votes        INTEGER;
BEGIN
  -- Resolve contest from artwork
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

  IF p_user_id IS NOT NULL THEN
    -- Lane A: authenticated user

    -- Read caps from system_config
    SELECT COALESCE(MAX(CASE WHEN sc.key = 'max_votes_per_user_per_contest' THEN sc.value::INTEGER END), 10),
           COALESCE(MAX(CASE WHEN sc.key = 'max_votes_per_user_per_artwork'  THEN sc.value::INTEGER END), 5)
    INTO v_max_per_contest, v_max_per_artwork
    FROM system_config sc
    WHERE sc.key IN ('max_votes_per_user_per_contest', 'max_votes_per_user_per_artwork');

    -- Count votes this user has already cast in this contest
    SELECT COUNT(*)
    INTO v_user_contest_votes
    FROM votes v
    WHERE v.user_id = p_user_id
      AND v.contest_id = v_contest_id;

    IF v_user_contest_votes >= v_max_per_contest THEN
      RETURN QUERY SELECT false, 'VOTE_LIMIT_REACHED'::TEXT, 0, v_contest_id;
      RETURN;
    END IF;

    -- Count votes this user has already cast on this specific artwork
    SELECT COUNT(*)
    INTO v_user_artwork_votes
    FROM votes v
    WHERE v.user_id = p_user_id
      AND v.artwork_id = p_artwork_id;

    IF v_user_artwork_votes >= v_max_per_artwork THEN
      RETURN QUERY SELECT false, 'ARTWORK_VOTE_LIMIT_REACHED'::TEXT, 0, v_contest_id;
      RETURN;
    END IF;

  ELSE
    -- Lane B: anonymous — IP cap per contest (unchanged)
    SELECT COALESCE(sc.value::INTEGER, 50)
    INTO v_max_ip_votes
    FROM system_config sc
    WHERE sc.key = 'max_votes_per_ip_per_contest';

    SELECT COUNT(*)
    INTO v_ip_vote_count
    FROM votes v
    WHERE v.ip_hash = p_ip_hash
      AND v.contest_id = v_contest_id
      AND v.user_id IS NULL;

    IF v_ip_vote_count >= v_max_ip_votes THEN
      RETURN QUERY SELECT false, 'ALREADY_VOTED'::TEXT, 0, v_contest_id;
      RETURN;
    END IF;
  END IF;

  -- Insert vote (no unique constraint on user+contest any more — multiple votes allowed)
  INSERT INTO votes (artwork_id, contest_id, user_id, ip_hash, email_hash)
  VALUES (p_artwork_id, v_contest_id, p_user_id, p_ip_hash, p_email_hash);

  -- Bump denormalised counter
  UPDATE artworks a
  SET vote_count = a.vote_count + 1
  WHERE a.id = p_artwork_id
  RETURNING a.vote_count INTO v_vote_count;

  RETURN QUERY SELECT true, NULL::TEXT, v_vote_count, v_contest_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.submit_vote TO authenticated, anon;
