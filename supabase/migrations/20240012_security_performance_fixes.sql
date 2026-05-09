-- Fix all security and performance advisories:
-- 1. Seed system_config (was empty)
-- 2. Add missing FK index on artist_applications.approved_for_contest_id
-- 3. Lock search_path on all public functions
-- 4. Switch read-only SECURITY DEFINER functions to SECURITY INVOKER
-- 5. Revoke anon EXECUTE on is_admin()
-- 6. Wrap auth.* calls in (select ...) on all RLS policies to prevent per-row re-eval
-- 7. Scope reactions_delete_own to ip_hash instead of USING (true)

-- ============================================================
-- 1. SEED system_config
-- ============================================================
INSERT INTO system_config (key, value, description) VALUES
  ('voting_cooldown_hours',    '24', 'Hours between votes per IP per contest'),
  ('contest_duration_days',    '7',  'Default contest length in days'),
  ('max_votes_per_ip_per_day', '1',  'Max votes per IP per day'),
  ('artworks_per_contest',     '6',  'Default artworks shown per contest')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 2. MISSING FK INDEX
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applications_approved_contest
  ON artist_applications(approved_for_contest_id)
  WHERE approved_for_contest_id IS NOT NULL;

-- ============================================================
-- 3 & 4. FUNCTIONS — search_path + SECURITY INVOKER where appropriate
-- ============================================================

CREATE OR REPLACE FUNCTION public.submit_vote(
  p_artwork_id UUID,
  p_contest_id UUID,
  p_user_id    UUID,
  p_ip_hash    TEXT
) RETURNS TABLE (
  success     BOOLEAN,
  error_code  TEXT,
  vote_count  INTEGER
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
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

CREATE OR REPLACE FUNCTION public.get_homepage_stats()
RETURNS TABLE (
  total_votes    BIGINT,
  total_artworks BIGINT,
  total_contests BIGINT,
  active_id      UUID,
  active_week    INTEGER
) LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role' = 'admin');
END;
$$;
REVOKE EXECUTE ON FUNCTION is_admin FROM anon;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_artwork_vote_count()
RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artworks SET vote_count = vote_count + 1, updated_at = NOW()
    WHERE id = NEW.artwork_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artworks SET vote_count = GREATEST(vote_count - 1, 0), updated_at = NOW()
    WHERE id = OLD.artwork_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_active_contest()
RETURNS TABLE(
  contest_id uuid, contest_week_number integer, contest_title text,
  contest_description text, contest_start_date timestamptz,
  contest_end_date timestamptz, contest_status text,
  artwork_id uuid, artwork_image_url text, artwork_title text,
  artwork_prompt text, artwork_vote_count integer, artwork_display_order integer
) LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
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
GRANT EXECUTE ON FUNCTION get_active_contest TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_archived_contests()
RETURNS TABLE(
  contest_id uuid, contest_week_number integer, contest_title text,
  contest_description text, contest_start_date timestamptz,
  contest_end_date timestamptz, total_votes integer, artwork_count integer,
  winner_artwork_id uuid, winner_artwork_title text,
  winner_artwork_image_url text, winner_vote_count integer
) LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
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
GRANT EXECUTE ON FUNCTION get_archived_contests TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_contest_by_week(p_week_number integer)
RETURNS TABLE(
  contest_id uuid, contest_week_number integer, contest_title text,
  contest_description text, contest_start_date timestamptz,
  contest_end_date timestamptz, contest_status text,
  artwork_id uuid, artwork_image_url text, artwork_title text,
  artwork_prompt text, artwork_vote_count integer, artwork_display_order integer
) LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
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
GRANT EXECUTE ON FUNCTION get_contest_by_week TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.validate_vote_request(
  p_artwork_id uuid, p_contest_id uuid, p_user_id uuid, p_ip_hash text
) RETURNS TABLE(valid boolean, error_code text, current_vote_count integer)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
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

-- ============================================================
-- 5. RLS POLICIES — (select auth.*) to prevent per-row re-eval
-- ============================================================

DROP POLICY IF EXISTS "Admins can insert contests" ON contests;
CREATE POLICY "Admins can insert contests" ON contests FOR INSERT
  WITH CHECK ((select auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can update contests" ON contests;
CREATE POLICY "Admins can update contests" ON contests FOR UPDATE
  USING ((select auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((select auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can delete contests" ON contests;
CREATE POLICY "Admins can delete contests" ON contests FOR DELETE
  USING ((select auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can insert artworks" ON artworks;
CREATE POLICY "Admins can insert artworks" ON artworks FOR INSERT
  WITH CHECK ((select auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can update artworks" ON artworks;
CREATE POLICY "Admins can update artworks" ON artworks FOR UPDATE
  USING ((select auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((select auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can delete artworks" ON artworks;
CREATE POLICY "Admins can delete artworks" ON artworks FOR DELETE
  USING ((select auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Users can view their own votes" ON votes;
CREATE POLICY "Users can view their own votes" ON votes FOR SELECT
  USING (
    ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id)
    OR (select auth.jwt() ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK (
    (select auth.uid()) = id
    AND role = (SELECT role FROM users WHERE id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "comments_update_admin" ON comments;
CREATE POLICY "comments_update_admin" ON comments FOR UPDATE
  USING ((select auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((select auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "comments_delete_admin" ON comments;
CREATE POLICY "comments_delete_admin" ON comments FOR DELETE
  USING ((select auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Only admins can read subscribers" ON subscribers;
CREATE POLICY "Only admins can read subscribers" ON subscribers FOR SELECT
  USING ((select auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Only admins can read applications" ON artist_applications;
CREATE POLICY "Only admins can read applications" ON artist_applications FOR SELECT
  USING ((select auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Only admins can update application status" ON artist_applications;
CREATE POLICY "Only admins can update application status" ON artist_applications FOR UPDATE
  USING ((select auth.jwt() ->> 'role') = 'admin');

-- ============================================================
-- 6. FIX reactions_delete_own — was USING (true), scope to ip_hash
-- ============================================================
DROP POLICY IF EXISTS "reactions_delete_own" ON comment_reactions;
CREATE POLICY "reactions_delete_own" ON comment_reactions FOR DELETE
  USING (
    ip_hash = (
      SELECT current_setting('request.headers', true)::json ->> 'x-forwarded-for'
    )
    OR (select auth.jwt() ->> 'role') = 'admin'
  );
