-- Fix PostgreSQL error 42702: "column reference contest_id is ambiguous"
-- The RETURNS TABLE declares a column named contest_id, which conflicts with
-- bare contest_id references in WHERE clauses inside the function body.
-- Fix: qualify all votes/system_config column references with a table alias.

CREATE OR REPLACE FUNCTION public.submit_vote(
  p_artwork_id  uuid,
  p_user_id     uuid    DEFAULT NULL::uuid,
  p_ip_hash     text    DEFAULT NULL::text,
  p_email_hash  text    DEFAULT NULL::text
)
RETURNS TABLE(success boolean, error_code text, vote_count integer, contest_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
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
    -- Lane A: authenticated user — 1 vote per contest
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
    -- Lane B: anonymous — up to max_votes_per_ip_per_contest per IP
    SELECT COALESCE(sc.value::INTEGER, 5)
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

  -- Bump denormalised counter
  UPDATE artworks
  SET vote_count = vote_count + 1
  WHERE id = p_artwork_id
  RETURNING vote_count INTO v_vote_count;

  RETURN QUERY SELECT true, NULL::TEXT, v_vote_count, v_contest_id;
END;
$function$;
