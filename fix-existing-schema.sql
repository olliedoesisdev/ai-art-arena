-- ============================================
-- FIX EXISTING SCHEMA
-- ============================================
-- This script updates your existing database schema to fix the issues
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Drop conflicting triggers and constraints
-- ============================================
DROP TRIGGER IF EXISTS update_contests_updated_at ON contests;
DROP TRIGGER IF EXISTS update_artworks_updated_at ON artworks;
DROP TRIGGER IF EXISTS increment_artwork_votes ON votes;

-- ============================================
-- STEP 2: Update contests table structure
-- ============================================
-- Add missing columns if they don't exist
ALTER TABLE contests ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS year INTEGER;

-- Update title to be NOT NULL (set default for existing rows first)
UPDATE contests SET title = 'Week ' || week_number WHERE title IS NULL;
ALTER TABLE contests ALTER COLUMN title SET NOT NULL;

-- Update year (set default for existing rows first)
UPDATE contests SET year = EXTRACT(YEAR FROM start_date) WHERE year IS NULL;
ALTER TABLE contests ALTER COLUMN year SET NOT NULL;

-- Drop and recreate the status constraint with correct values
ALTER TABLE contests DROP CONSTRAINT IF EXISTS contests_status_check;
ALTER TABLE contests ADD CONSTRAINT contests_status_check
  CHECK (status IN ('draft', 'active', 'ended', 'archived'));

-- Rename winner_id to winner_artwork_id if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contests' AND column_name = 'winner_id'
  ) THEN
    ALTER TABLE contests RENAME COLUMN winner_id TO winner_artwork_id;
  END IF;
END $$;

-- Add winner_artwork_id if it doesn't exist
ALTER TABLE contests ADD COLUMN IF NOT EXISTS winner_artwork_id UUID;

-- ============================================
-- STEP 3: Update artworks table structure
-- ============================================
-- Add missing columns if they don't exist
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS artist_name TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Make prompt optional (change from NOT NULL to NULL)
ALTER TABLE artworks ALTER COLUMN prompt DROP NOT NULL;

-- Remove columns that are no longer needed
ALTER TABLE artworks DROP COLUMN IF EXISTS style;
ALTER TABLE artworks DROP COLUMN IF EXISTS view_count;
ALTER TABLE artworks DROP COLUMN IF EXISTS updated_at;

-- ============================================
-- STEP 4: Update votes table structure
-- ============================================
-- Add new columns if they don't exist
ALTER TABLE votes ADD COLUMN IF NOT EXISTS user_identifier TEXT;

-- Update user_identifier for existing rows (use ip_hash as fallback)
UPDATE votes SET user_identifier = COALESCE(user_identifier, ip_hash, 'unknown') WHERE user_identifier IS NULL;

-- Make user_identifier NOT NULL
ALTER TABLE votes ALTER COLUMN user_identifier SET NOT NULL;

-- Make ip_hash optional
ALTER TABLE votes ALTER COLUMN ip_hash DROP NOT NULL;

-- Drop old constraints
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_artwork_id_ip_hash_vote_date_key;

-- Remove vote_date column (we're using one vote per contest, not per day)
ALTER TABLE votes DROP COLUMN IF EXISTS vote_date;

-- Add foreign key to auth.users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'votes_user_id_fkey'
  ) THEN
    ALTER TABLE votes ADD CONSTRAINT votes_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

-- ============================================
-- STEP 5: Recreate indexes
-- ============================================
DROP INDEX IF EXISTS idx_votes_date;
DROP INDEX IF EXISTS idx_votes_user_identifier;
DROP INDEX IF EXISTS idx_votes_voted_at;

CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_dates ON contests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_artworks_contest ON artworks(contest_id);
CREATE INDEX IF NOT EXISTS idx_artworks_votes ON artworks(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_votes_artwork ON votes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_votes_contest ON votes(contest_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_identifier ON votes(user_identifier);
CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON votes(voted_at DESC);

-- ============================================
-- STEP 6: Recreate triggers
-- ============================================
-- Updated_at trigger function (should already exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only contests needs updated_at trigger (artworks doesn't have updated_at anymore)
CREATE TRIGGER update_contests_updated_at
  BEFORE UPDATE ON contests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Increment vote count trigger
CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artworks
  SET vote_count = vote_count + 1
  WHERE id = NEW.artwork_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_artwork_votes
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_vote_count();

-- ============================================
-- STEP 7: Update database functions
-- ============================================
-- Function to get active contest
CREATE OR REPLACE FUNCTION get_active_contest()
RETURNS TABLE (
  contest_id UUID,
  week_number INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  time_remaining INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as contest_id,
    c.week_number,
    c.start_date,
    c.end_date,
    (c.end_date - NOW()) as time_remaining
  FROM contests c
  WHERE c.status = 'active'
    AND c.start_date <= NOW()
    AND c.end_date > NOW()
  ORDER BY c.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can vote (updated signature)
CREATE OR REPLACE FUNCTION can_vote(
  p_contest_id UUID,
  p_user_identifier TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM votes
    WHERE contest_id = p_contest_id
      AND user_identifier = p_user_identifier
  ) INTO vote_exists;

  RETURN NOT vote_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to get contest winner
CREATE OR REPLACE FUNCTION get_contest_winner(p_contest_id UUID)
RETURNS UUID AS $$
DECLARE
  winner_artwork_id UUID;
BEGIN
  SELECT id INTO winner_artwork_id
  FROM artworks
  WHERE contest_id = p_contest_id
  ORDER BY vote_count DESC, created_at ASC
  LIMIT 1;

  RETURN winner_artwork_id;
END;
$$ LANGUAGE plpgsql;

-- Function to archive contest and select winner (use winner_artwork_id)
CREATE OR REPLACE FUNCTION archive_contest(p_contest_id UUID)
RETURNS VOID AS $$
DECLARE
  winner_artwork_id UUID;
BEGIN
  -- Get the winner
  SELECT get_contest_winner(p_contest_id) INTO winner_artwork_id;

  -- Update contest status and winner
  UPDATE contests
  SET status = 'archived',
      winner_artwork_id = winner_artwork_id,
      updated_at = NOW()
  WHERE id = p_contest_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 8: Update comments
-- ============================================
COMMENT ON TABLE contests IS 'Weekly AI art contests';
COMMENT ON TABLE artworks IS 'AI-generated artwork entries for contests';
COMMENT ON TABLE votes IS 'User votes for artworks, one vote per user per contest';
COMMENT ON FUNCTION get_active_contest() IS 'Returns the currently active contest';
COMMENT ON FUNCTION can_vote(UUID, TEXT) IS 'Check if a user can vote for a contest';
COMMENT ON FUNCTION get_contest_winner(UUID) IS 'Returns the artwork ID with most votes for a contest';
COMMENT ON FUNCTION archive_contest(UUID) IS 'Archives a contest and selects the winner';

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries to verify the migration succeeded:

-- Check contests table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contests'
ORDER BY ordinal_position;

-- Check votes table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'votes'
ORDER BY ordinal_position;

-- Check functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('can_vote', 'get_active_contest', 'archive_contest')
ORDER BY routine_name;
