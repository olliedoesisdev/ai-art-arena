-- Fix ambiguous "vote_count" column reference in submit_vote.
-- The RETURNING clause used "artworks.vote_count" but PL/pgSQL resolved
-- it to the function's own RETURNS TABLE column instead of the table column,
-- causing ERROR 42702. Fix: alias the table as "aw" so the reference is unambiguous.

CREATE OR REPLACE FUNCTION public.submit_vote(
  p_artwork_id  UUID,
  p_contest_id  UUID,
  p_user_id     UUID,
  p_ip_hash     TEXT,
  p_email_hash  TEXT DEFAULT NULL
) RETURNS TABLE (
  success     BOOLEAN,
  error_code  TEXT,
  vote_count  INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contest_status TEXT;
  v_artwork_exists BOOLEAN;
  v_already_voted  BOOLEAN;
  v_new_count      INTEGER;
BEGIN
  SELECT
    c.status,
    EXISTS(SELECT 1 FROM artworks a WHERE a.id = p_artwork_id AND a.contest_id = p_contest_id),
    EXISTS(
      SELECT 1 FROM votes v WHERE v.contest_id = p_contest_id
      AND (
        v.ip_hash = p_ip_hash
        OR (p_user_id    IS NOT NULL AND v.user_id    = p_user_id)
        OR (p_email_hash IS NOT NULL AND v.email_hash = p_email_hash)
      )
    )
  INTO v_contest_status, v_artwork_exists, v_already_voted
  FROM contests c WHERE c.id = p_contest_id;

  IF v_contest_status IS NULL THEN
    RETURN QUERY SELECT FALSE, 'CONTEST_NOT_FOUND'::TEXT, 0; RETURN;
  END IF;
  IF v_contest_status != 'active' THEN
    RETURN QUERY SELECT FALSE, 'CONTEST_NOT_ACTIVE'::TEXT, 0; RETURN;
  END IF;
  IF NOT v_artwork_exists THEN
    RETURN QUERY SELECT FALSE, 'ARTWORK_NOT_FOUND'::TEXT, 0; RETURN;
  END IF;
  IF v_already_voted THEN
    RETURN QUERY SELECT FALSE, 'ALREADY_VOTED'::TEXT, 0; RETURN;
  END IF;

  INSERT INTO votes (artwork_id, contest_id, user_id, ip_hash, email_hash)
  VALUES (p_artwork_id, p_contest_id, p_user_id, p_ip_hash, p_email_hash);

  -- Alias the table to avoid ambiguity with the RETURNS TABLE column "vote_count"
  UPDATE artworks AS aw
  SET vote_count = aw.vote_count + 1
  WHERE aw.id = p_artwork_id
  RETURNING aw.vote_count INTO v_new_count;

  RETURN QUERY SELECT TRUE, NULL::TEXT, v_new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_vote(UUID, UUID, UUID, TEXT, TEXT) TO authenticated, anon;
