-- Migration: Add position column to artworks and additional indexes
-- Date: 2025-11-25
-- Description: Add artwork position for ordering, and indexes for performance

-- Add position column to artworks table
ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Create unique index on contest_id and position
CREATE UNIQUE INDEX IF NOT EXISTS idx_artworks_contest_position
  ON artworks(contest_id, position)
  WHERE position IS NOT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_votes_user_id
  ON votes(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_votes_user_identifier
  ON votes(user_identifier);

CREATE INDEX IF NOT EXISTS idx_votes_vote_date
  ON votes(vote_date);

CREATE INDEX IF NOT EXISTS idx_artworks_vote_count
  ON artworks(vote_count DESC);

-- Add comments
COMMENT ON COLUMN artworks.position IS 'Display order position of artwork within contest (1-12)';
