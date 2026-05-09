-- submit_vote: atomic RPC replacing 5 sequential queries (~200ms → ~40ms)
-- Called exclusively from /api/v1/vote — never run sequential queries there.

CREATE OR REPLACE FUNCTION submit_vote(
  p_artwork_id UUID,
  p_contest_id UUID,
  p_user_id    UUID,
  p_ip_hash    TEXT
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
    EXISTS(SELECT 1 FROM artworks WHERE id = p_artwork_id AND contest_id = p_contest_id),
    EXISTS(
      SELECT 1 FROM votes v WHERE v.contest_id = p_contest_id
      AND (v.ip_hash = p_ip_hash
        OR (p_user_id IS NOT NULL AND v.user_id = p_user_id))
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

  INSERT INTO votes (artwork_id, contest_id, user_id, ip_hash)
  VALUES (p_artwork_id, p_contest_id, p_user_id, p_ip_hash);

  UPDATE artworks SET vote_count = vote_count + 1
  WHERE id = p_artwork_id RETURNING artworks.vote_count INTO v_new_count;

  RETURN QUERY SELECT TRUE, NULL::TEXT, v_new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_vote TO authenticated, anon;

-- get_homepage_stats: replaces 3 separate COUNT queries
CREATE OR REPLACE FUNCTION get_homepage_stats()
RETURNS TABLE (
  total_votes    BIGINT,
  total_artworks BIGINT,
  total_contests BIGINT,
  active_id      UUID,
  active_week    INTEGER
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM votes)::BIGINT,
    (SELECT COUNT(*) FROM artworks)::BIGINT,
    (SELECT COUNT(*) FROM contests)::BIGINT,
    (SELECT id          FROM contests WHERE status = 'active' LIMIT 1),
    (SELECT week_number FROM contests WHERE status = 'active' LIMIT 1);
END;
$$;

GRANT EXECUTE ON FUNCTION get_homepage_stats TO authenticated, anon;
