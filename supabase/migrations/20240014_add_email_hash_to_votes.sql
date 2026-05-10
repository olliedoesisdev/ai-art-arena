-- Add email_hash to votes for per-email duplicate detection.
-- Signed-in voters are identified by email hash (stronger than IP).
-- Anonymous voters continue using ip_hash only.

ALTER TABLE votes
  ADD COLUMN IF NOT EXISTS email_hash TEXT;

-- Fast lookup for email-based duplicate detection
CREATE INDEX IF NOT EXISTS idx_votes_email_contest
  ON votes(email_hash, contest_id)
  WHERE email_hash IS NOT NULL;

-- One vote per email per contest (database-level enforcement, layer 2 after Redis)
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_email_contest
  ON votes(email_hash, contest_id)
  WHERE email_hash IS NOT NULL;

-- Confirm the IP unique index still exists (created in migration 20240002)
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_ip_contest
  ON votes(ip_hash, contest_id);

-- Update submit_vote to accept and store email_hash.
-- Also checks existing email votes so the DB is the final source of truth.
CREATE OR REPLACE FUNCTION submit_vote(
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
    EXISTS(SELECT 1 FROM artworks WHERE id = p_artwork_id AND contest_id = p_contest_id),
    EXISTS(
      SELECT 1 FROM votes v WHERE v.contest_id = p_contest_id
      AND (
        v.ip_hash = p_ip_hash
        OR (p_user_id IS NOT NULL AND v.user_id = p_user_id)
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

  UPDATE artworks SET vote_count = vote_count + 1
  WHERE id = p_artwork_id RETURNING artworks.vote_count INTO v_new_count;

  RETURN QUERY SELECT TRUE, NULL::TEXT, v_new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_vote TO authenticated, anon;
