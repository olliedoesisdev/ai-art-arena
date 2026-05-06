-- Corrective migration: brings local schema in sync with live Supabase database.
-- The live DB was created with additional columns not present in migration 20240001.
-- This migration is safe to run on a fresh DB (uses IF NOT EXISTS / IF EXISTS guards).

-- ── contests ──────────────────────────────────────────────────────────────────

ALTER TABLE contests
  ADD COLUMN IF NOT EXISTS title       TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();

-- title is NOT NULL in production; backfill before constraining
UPDATE contests SET title = 'Week ' || week_number WHERE title IS NULL;
ALTER TABLE contests ALTER COLUMN title SET NOT NULL;

-- ── artworks ──────────────────────────────────────────────────────────────────

-- Rename artist_prompt → prompt to match live schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artworks' AND column_name = 'artist_prompt'
  ) THEN
    ALTER TABLE artworks RENAME COLUMN artist_prompt TO prompt;
  END IF;
END $$;

ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS display_order INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT NOW();

-- display_order is NOT NULL in production; backfill with row number per contest
UPDATE artworks a
SET display_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY contest_id ORDER BY created_at) AS rn
  FROM artworks
) sub
WHERE a.id = sub.id AND a.display_order IS NULL;

ALTER TABLE artworks ALTER COLUMN display_order SET NOT NULL;

-- ── updated_at triggers ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contests_updated_at ON contests;
CREATE TRIGGER contests_updated_at
  BEFORE UPDATE ON contests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS artworks_updated_at ON artworks;
CREATE TRIGGER artworks_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── leaderboard index (now that vote_count exists) ────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_vote_count
  ON artworks(vote_count DESC);

-- ── display_order index ───────────────────────────────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_display_order
  ON artworks(contest_id, display_order);

-- ── per-contest artwork count ─────────────────────────────────────────────────

ALTER TABLE contests
  ADD COLUMN IF NOT EXISTS artwork_count INTEGER NOT NULL DEFAULT 6;
