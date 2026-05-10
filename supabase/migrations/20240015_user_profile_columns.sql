-- Catch-up migration: profile columns added to users table via MCP/direct SQL.
-- These columns exist in production but were never written to a migration file.
-- Using ADD COLUMN IF NOT EXISTS so this is safe to run on any environment.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS bio          TEXT,
  ADD COLUMN IF NOT EXISTS website_url  TEXT,
  ADD COLUMN IF NOT EXISTS is_public    BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS joined_at    TIMESTAMPTZ DEFAULT NOW();

-- RLS policy allowing anyone to read public profiles (needed for /profile/[id] pages)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'users'
      AND policyname = 'users_select_public'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "users_select_public"
        ON users FOR SELECT
        USING (is_public = true)
    $policy$;
  END IF;
END;
$$;
