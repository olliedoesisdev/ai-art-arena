-- 20240020_submit_vote_derive_contest_id.sql
--
-- Push contest_id derivation from the API route into the RPC itself.
--
-- Why:
--   Previously /api/v1/vote did a SELECT contest_id FROM artworks WHERE id = ?
--   immediately before calling submit_vote(), adding one extra round-trip per
--   vote (~5–10ms on a warm connection). This migration moves that lookup
--   inside the function, restoring the "1 atomic RPC" property end-to-end
--   AND eliminating a TOCTOU window where an artwork could theoretically be
--   moved between contests in the gap between lookup and RPC.
--
-- Behaviour:
--   - Signature changes from (artwork_id, contest_id, user_id, ip_hash, email_hash)
--     to (artwork_id, user_id, ip_hash, email_hash).
--   - RETURNS TABLE now includes contest_id so the API route can revalidate
--     the contest page without a separate lookup. contest_id is populated as
--     soon as it's known and is NULL for ARTWORK_NOT_FOUND (artwork row never
--     resolved) and for unique_violation races (where v_contest_id IS set,
--     so the route handler still gets the value back).
--   - All four existing error_codes are preserved:
--       ARTWORK_NOT_FOUND    — id doesn't exist in artworks
--       CONTEST_NOT_FOUND    — artwork.contest_id orphaned (no matching contest row)
--       CONTEST_NOT_ACTIVE   — contest status != 'active'
--       ALREADY_VOTED        — IP / user_id / email_hash already voted this contest
--   - A unique_violation exception handler also maps to ALREADY_VOTED, so
--     a race past the EXISTS check still degrades gracefully.
--
-- Deployment order (important):
--   1. Deploy the updated route handler (4-arg call) FIRST, OR ship them together.
--   2. Run this migration.
--   The DROP at the end removes the old 5-arg signature — any code still
--   calling it will start returning "function ... does not exist" until the
--   new handler ships. If you need a zero-downtime window, comment out the
--   DROP and run it in a follow-up migration once the rollout is complete.
--
-- Rollback:
--   Re-run supabase/migrations/20240017_fix_submit_vote_ambiguous_column.sql,
--   then: DROP FUNCTION IF EXISTS public.submit_vote(UUID, UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.submit_vote(
  p_artwork_id  UUID,
  p_user_id     UUID,
  p_ip_hash     TEXT,
  p_email_hash  TEXT DEFAULT NULL
) RETURNS TABLE (
  success     BOOLEAN,
  error_code  TEXT,
  vote_count  INTEGER,
  contest_id  UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contest_id     UUID;
  v_contest_status TEXT;
  v_already_voted  BOOLEAN;
  v_new_count      INTEGER;
BEGIN
  -- 1. Resolve artwork → contest → status in a single round trip.
  --    LEFT JOIN against contests so an orphaned artwork (contest deleted but
  --    artwork row left behind) returns CONTEST_NOT_FOUND rather than masking
  --    the issue as ARTWORK_NOT_FOUND.
  SELECT a.contest_id, c.status
    INTO v_contest_id, v_contest_status
  FROM artworks a
  LEFT JOIN contests c ON c.id = a.contest_id
  WHERE a.id = p_artwork_id;

  IF NOT FOUND THEN
    -- Artwork row doesn't exist at all — contest_id is genuinely unknown.
    RETURN QUERY SELECT FALSE, 'ARTWORK_NOT_FOUND'::TEXT, 0, NULL::UUID; RETURN;
  END IF;

  IF v_contest_status IS NULL THEN
    -- Orphaned artwork — we know the (broken) contest_id pointer; pass it back
    -- so the route handler can log it for cleanup.
    RETURN QUERY SELECT FALSE, 'CONTEST_NOT_FOUND'::TEXT, 0, v_contest_id; RETURN;
  END IF;

  IF v_contest_status != 'active' THEN
    RETURN QUERY SELECT FALSE, 'CONTEST_NOT_ACTIVE'::TEXT, 0, v_contest_id; RETURN;
  END IF;

  -- 2. Three-layer duplicate check — same logic as before, just keyed on the
  --    derived contest_id instead of a client-supplied one.
  SELECT EXISTS(
    SELECT 1 FROM votes v
    WHERE v.contest_id = v_contest_id
      AND (
        v.ip_hash = p_ip_hash
        OR (p_user_id    IS NOT NULL AND v.user_id    = p_user_id)
        OR (p_email_hash IS NOT NULL AND v.email_hash = p_email_hash)
      )
  ) INTO v_already_voted;

  IF v_already_voted THEN
    RETURN QUERY SELECT FALSE, 'ALREADY_VOTED'::TEXT, 0, v_contest_id; RETURN;
  END IF;

  -- 3. Insert the vote + bump the denormalised counter.
  --    PL/pgSQL function bodies run inside an implicit transaction, so the
  --    EXISTS check, INSERT, and UPDATE are atomic relative to other backends.
  --    The unique indexes on (ip_hash, contest_id) and (email_hash, contest_id)
  --    catch the race where two concurrent calls slip past the EXISTS check.
  INSERT INTO votes (artwork_id, contest_id, user_id, ip_hash, email_hash)
  VALUES (p_artwork_id, v_contest_id, p_user_id, p_ip_hash, p_email_hash);

  -- Alias the table to disambiguate from the RETURNS TABLE column "vote_count"
  -- (this was the bug fixed in 20240017 — keep the pattern).
  UPDATE artworks AS aw
  SET vote_count = aw.vote_count + 1
  WHERE aw.id = p_artwork_id
  RETURNING aw.vote_count INTO v_new_count;

  RETURN QUERY SELECT TRUE, NULL::TEXT, v_new_count, v_contest_id;

EXCEPTION
  -- If a race past the EXISTS check trips one of the unique indexes,
  -- surface the same ALREADY_VOTED code the route handler already knows.
  -- v_contest_id was set before the violation, so we still hand it back.
  WHEN unique_violation THEN
    RETURN QUERY SELECT FALSE, 'ALREADY_VOTED'::TEXT, 0, v_contest_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_vote(UUID, UUID, TEXT, TEXT) TO authenticated, anon;

-- Remove the old 5-argument signature.
-- If you need a transition window, comment this out and run it later.
DROP FUNCTION IF EXISTS public.submit_vote(UUID, UUID, UUID, TEXT, TEXT);
