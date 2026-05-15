-- Migration 20240024: raise anonymous IP vote cap to 50 per contest
--
-- Changes:
--   1. system_config: max_votes_per_ip_per_contest 5 → 50
--   2. Rewrite submit_vote to match new cap and restore SET search_path
--      (the search_path clause was accidentally dropped in migration 20240023,
--      which is a Supabase security advisory violation for SECURITY DEFINER functions)

-- ── 1. Raise config cap ───────────────────────────────────────────────────────

UPDATE system_config
SET value = '50', description = 'Maximum anonymous votes allowed from a single IP address per contest'
WHERE key = 'max_votes_per_ip_per_contest';

-- ── 2. Rewrite submit_vote ────────────────────────────────────────────────────
--
-- Identical logic to migration 20240023 but with:
--   a) SET search_path = public, pg_temp restored (security fix)
--   b) Lane B cap now reads max_votes_per_ip_per_contest = 50 from config

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
  v_contest_id     UUID;
  v_contest_status TEXT;
  v_vote_count     INTEGER;
  v_ip_vote_count  INTEGER;
  v_max_ip_votes   INTEGER;
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

  -- Two-lane duplicate check
  IF p_user_id IS NOT NULL THEN
    -- Lane A: authenticated user — 1 vote per contest (enforced by user_id check)
    IF EXISTS (
      SELECT 1 FROM votes v
      WHERE v.user_id = p_user_id
        AND v.contest_id = v_contest_id
    ) THEN
      RETURN QUERY SELECT false, 'ALREADY_VOTED'::TEXT, 0, v_contest_id;
      RETURN;
    END IF;

    -- Block if same email has voted (covers sign-in after anon vote)
    IF p_email_hash IS NOT NULL AND EXISTS (
      SELECT 1 FROM votes v
      WHERE v.email_hash = p_email_hash
        AND v.contest_id = v_contest_id
    ) THEN
      RETURN QUERY SELECT false, 'ALREADY_VOTED'::TEXT, 0, v_contest_id;
      RETURN;
    END IF;

  ELSE
    -- Lane B: anonymous — up to max_votes_per_ip_per_contest (now 50) per IP
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

  -- Insert vote
  BEGIN
    INSERT INTO votes (artwork_id, contest_id, user_id, ip_hash, email_hash)
    VALUES (p_artwork_id, v_contest_id, p_user_id, p_ip_hash, p_email_hash);
  EXCEPTION WHEN unique_violation THEN
    RETURN QUERY SELECT false, 'ALREADY_VOTED'::TEXT, 0, v_contest_id;
    RETURN;
  END;

  -- Bump denormalised counter — qualify with table alias to avoid ambiguity
  -- with the RETURNS TABLE column of the same name (error 42702)
  UPDATE artworks a
  SET vote_count = a.vote_count + 1
  WHERE a.id = p_artwork_id
  RETURNING a.vote_count INTO v_vote_count;

  RETURN QUERY SELECT true, NULL::TEXT, v_vote_count, v_contest_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.submit_vote TO authenticated, anon;
