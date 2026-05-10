-- Catch-up migration: all views and functions applied via MCP/direct SQL
-- that were never written to migration files. All use CREATE OR REPLACE
-- so this is idempotent and safe to run on any environment.

-- ─────────────────────────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────────────────────────

-- Per-user vote history (authenticated voters only)
CREATE OR REPLACE VIEW user_vote_history AS
SELECT
  v.id          AS vote_id,
  v.user_id,
  v.created_at  AS voted_at,
  a.id          AS artwork_id,
  a.title       AS artwork_title,
  a.image_url   AS artwork_image_url,
  a.vote_count  AS artwork_vote_count,
  c.id          AS contest_id,
  c.week_number AS contest_week,
  c.status      AS contest_status
FROM votes v
JOIN artworks a ON a.id = v.artwork_id
JOIN contests c ON c.id = v.contest_id
WHERE v.user_id IS NOT NULL;

-- Per-user comment history (approved, authenticated only)
CREATE OR REPLACE VIEW user_comment_history AS
SELECT
  cm.id          AS comment_id,
  cm.user_id,
  cm.author_name,
  cm.body        AS comment_body,
  cm.created_at  AS commented_at,
  cm.contest_id,
  c.week_number  AS contest_week,
  c.status       AS contest_status
FROM comments cm
JOIN contests c ON c.id = cm.contest_id
WHERE cm.is_approved = true
  AND cm.user_id IS NOT NULL;

-- Unified activity feed combining votes + approved comments, newest first
CREATE OR REPLACE VIEW user_activity_feed AS
SELECT
  v.id            AS activity_id,
  v.user_id,
  v.created_at    AS activity_at,
  'vote'::text    AS activity_type,
  a.id            AS artwork_id,
  a.title         AS artwork_title,
  a.image_url     AS artwork_image_url,
  a.vote_count    AS artwork_vote_count,
  c.id            AS contest_id,
  c.week_number   AS contest_week,
  c.status        AS contest_status,
  NULL::text      AS comment_body
FROM votes v
JOIN artworks a ON a.id = v.artwork_id
JOIN contests c ON c.id = v.contest_id
WHERE v.user_id IS NOT NULL

UNION ALL

SELECT
  cm.id           AS activity_id,
  cm.user_id,
  cm.created_at   AS activity_at,
  'comment'::text AS activity_type,
  NULL::uuid      AS artwork_id,
  NULL::text      AS artwork_title,
  NULL::text      AS artwork_image_url,
  NULL::integer   AS artwork_vote_count,
  cm.contest_id,
  c.week_number   AS contest_week,
  c.status        AS contest_status,
  cm.body         AS comment_body
FROM comments cm
JOIN contests c ON c.id = cm.contest_id
WHERE cm.user_id IS NOT NULL
  AND cm.is_approved = true

ORDER BY activity_at DESC;

-- Daily vote counts for the last 90 days (used by admin analytics)
CREATE OR REPLACE VIEW daily_vote_stats AS
SELECT
  date_trunc('day', created_at)::date AS day,
  COUNT(*)::int                        AS vote_count
FROM votes
WHERE created_at >= now() - interval '90 days'
GROUP BY 1
ORDER BY 1;

-- Per-contest vote totals with artwork count and avg (used by admin analytics)
CREATE OR REPLACE VIEW contest_vote_stats AS
SELECT
  c.id,
  c.week_number,
  c.status,
  c.start_date,
  c.end_date,
  COUNT(v.id)::int                                                      AS total_votes,
  COUNT(DISTINCT a.id)::int                                             AS artwork_count,
  CASE WHEN COUNT(DISTINCT a.id) > 0
    THEN COUNT(v.id)::numeric / COUNT(DISTINCT a.id)::numeric
    ELSE 0
  END                                                                   AS avg_votes_per_artwork
FROM contests c
LEFT JOIN artworks a ON a.contest_id = c.id
LEFT JOIN votes    v ON v.contest_id = c.id
GROUP BY c.id, c.week_number, c.status, c.start_date, c.end_date
ORDER BY c.week_number;

-- Engagement breakdown: authenticated vs anonymous (used by admin analytics)
CREATE OR REPLACE VIEW vote_engagement_stats AS
SELECT
  COUNT(*)::int                                              AS total_votes,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL)::int           AS authenticated_votes,
  COUNT(*) FILTER (WHERE user_id IS NULL)::int               AS anonymous_votes,
  COUNT(DISTINCT ip_hash)::int                               AS unique_ips,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL)::int AS unique_users
FROM votes;

-- Grant read access to all views
GRANT SELECT ON user_vote_history    TO authenticated, anon;
GRANT SELECT ON user_comment_history TO authenticated, anon;
GRANT SELECT ON user_activity_feed   TO authenticated, anon;
GRANT SELECT ON daily_vote_stats     TO authenticated, anon;
GRANT SELECT ON contest_vote_stats   TO authenticated, anon;
GRANT SELECT ON vote_engagement_stats TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ─────────────────────────────────────────────────────────────

-- Updated submit_vote: adds optional p_email_hash for email-based dedup
-- (replaces the version in 20240003 which lacked this parameter)
CREATE OR REPLACE FUNCTION submit_vote(
  p_artwork_id  UUID,
  p_contest_id  UUID,
  p_user_id     UUID,
  p_ip_hash     TEXT,
  p_email_hash  TEXT DEFAULT NULL
) RETURNS TABLE (
  success    BOOLEAN,
  error_code TEXT,
  vote_count INTEGER
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

-- get_active_contest: returns active contest + artworks in display order
CREATE OR REPLACE FUNCTION get_active_contest()
RETURNS TABLE (
  contest_id           UUID,
  contest_week_number  INTEGER,
  contest_title        TEXT,
  contest_description  TEXT,
  contest_start_date   TIMESTAMPTZ,
  contest_end_date     TIMESTAMPTZ,
  contest_status       TEXT,
  artwork_id           UUID,
  artwork_image_url    TEXT,
  artwork_title        TEXT,
  artwork_prompt       TEXT,
  artwork_vote_count   INTEGER,
  artwork_display_order INTEGER
) LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.week_number, c.title, c.description,
         c.start_date, c.end_date, c.status,
         a.id, a.image_url, a.title, a.prompt, a.vote_count, a.display_order
  FROM contests c
  LEFT JOIN artworks a ON a.contest_id = c.id
  WHERE c.status = 'active'
  ORDER BY a.display_order;
END;
$$;

-- get_archived_contests: returns all archived contests with winner info
CREATE OR REPLACE FUNCTION get_archived_contests()
RETURNS TABLE (
  contest_id             UUID,
  contest_week_number    INTEGER,
  contest_title          TEXT,
  contest_description    TEXT,
  contest_start_date     TIMESTAMPTZ,
  contest_end_date       TIMESTAMPTZ,
  total_votes            INTEGER,
  artwork_count          INTEGER,
  winner_artwork_id      UUID,
  winner_artwork_title   TEXT,
  winner_artwork_image_url TEXT,
  winner_vote_count      INTEGER
) LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.week_number, c.title, c.description, c.start_date, c.end_date,
    COALESCE(SUM(a.vote_count), 0)::INTEGER,
    COUNT(a.id)::INTEGER,
    winner.id, winner.title, winner.image_url, winner.vote_count
  FROM contests c
  LEFT JOIN artworks a ON a.contest_id = c.id
  LEFT JOIN LATERAL (
    SELECT * FROM artworks WHERE contest_id = c.id
    ORDER BY vote_count DESC, created_at ASC LIMIT 1
  ) winner ON true
  WHERE c.status = 'archived'
  GROUP BY c.id, c.week_number, c.title, c.description,
           c.start_date, c.end_date,
           winner.id, winner.title, winner.image_url, winner.vote_count
  ORDER BY c.week_number DESC;
END;
$$;

-- get_contest_by_week: returns a specific contest by week number
CREATE OR REPLACE FUNCTION get_contest_by_week(p_week_number INTEGER)
RETURNS TABLE (
  contest_id            UUID,
  contest_week_number   INTEGER,
  contest_title         TEXT,
  contest_description   TEXT,
  contest_start_date    TIMESTAMPTZ,
  contest_end_date      TIMESTAMPTZ,
  contest_status        TEXT,
  artwork_id            UUID,
  artwork_image_url     TEXT,
  artwork_title         TEXT,
  artwork_prompt        TEXT,
  artwork_vote_count    INTEGER,
  artwork_display_order INTEGER
) LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.week_number, c.title, c.description,
         c.start_date, c.end_date, c.status,
         a.id, a.image_url, a.title, a.prompt, a.vote_count, a.display_order
  FROM contests c
  LEFT JOIN artworks a ON a.contest_id = c.id
  WHERE c.week_number = p_week_number
  ORDER BY a.display_order;
END;
$$;

-- validate_vote_request: read-only pre-check before Redis rate limit hit
CREATE OR REPLACE FUNCTION validate_vote_request(
  p_artwork_id UUID,
  p_contest_id UUID,
  p_user_id    UUID,
  p_ip_hash    TEXT
) RETURNS TABLE (
  valid               BOOLEAN,
  error_code          TEXT,
  current_vote_count  INTEGER
) LANGUAGE plpgsql STABLE SET search_path TO 'public', 'pg_temp' AS $$
DECLARE
  v_contest_status   TEXT;
  v_contest_end_date TIMESTAMPTZ;
  v_artwork_contest  UUID;
  v_has_voted        BOOLEAN;
  v_vote_count       INTEGER;
BEGIN
  SELECT
    c.status, c.end_date, a.contest_id, a.vote_count,
    EXISTS (
      SELECT 1 FROM votes v
      WHERE v.contest_id = p_contest_id
        AND (
          (p_user_id IS NOT NULL AND v.user_id = p_user_id)
          OR v.ip_hash = p_ip_hash
        )
    )
  INTO v_contest_status, v_contest_end_date, v_artwork_contest, v_vote_count, v_has_voted
  FROM contests c
  LEFT JOIN artworks a ON a.id = p_artwork_id
  WHERE c.id = p_contest_id;

  IF v_contest_status IS NULL THEN
    RETURN QUERY SELECT FALSE, 'CONTEST_NOT_FOUND'::TEXT, 0; RETURN;
  END IF;
  IF v_contest_status != 'active' THEN
    RETURN QUERY SELECT FALSE, 'CONTEST_NOT_ACTIVE'::TEXT, 0; RETURN;
  END IF;
  IF v_contest_end_date < NOW() THEN
    RETURN QUERY SELECT FALSE, 'CONTEST_ENDED'::TEXT, 0; RETURN;
  END IF;
  IF v_artwork_contest IS NULL THEN
    RETURN QUERY SELECT FALSE, 'ARTWORK_NOT_FOUND'::TEXT, 0; RETURN;
  END IF;
  IF v_artwork_contest != p_contest_id THEN
    RETURN QUERY SELECT FALSE, 'ARTWORK_WRONG_CONTEST'::TEXT, 0; RETURN;
  END IF;
  IF v_has_voted THEN
    RETURN QUERY SELECT FALSE, 'ALREADY_VOTED'::TEXT, v_vote_count; RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, NULL::TEXT, v_vote_count;
END;
$$;

-- is_admin: helper used in RLS policies — reads role from JWT claim
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role' = 'admin');
END;
$$;

-- purge_expired_reset_tokens: called by a cron or Inngest to clean up stale tokens
CREATE OR REPLACE FUNCTION purge_expired_reset_tokens()
RETURNS VOID LANGUAGE sql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $$
  DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '24 hours';
$$;

GRANT EXECUTE ON FUNCTION get_active_contest       TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_archived_contests    TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_contest_by_week      TO authenticated, anon;
GRANT EXECUTE ON FUNCTION validate_vote_request    TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin                 TO authenticated, anon;
GRANT EXECUTE ON FUNCTION purge_expired_reset_tokens TO authenticated;
