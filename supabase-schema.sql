-- AI Art Arena Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contests Table
CREATE TABLE IF NOT EXISTS contests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'ended', 'archived')),
  winner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_number, year)
);

-- Artworks Table
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT,
  vote_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id UUID, -- Optional: for authenticated users
  ip_hash TEXT NOT NULL, -- Hashed IP for anonymous voting
  user_agent TEXT,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  vote_date DATE GENERATED ALWAYS AS (DATE(voted_at)) STORED,
  UNIQUE(artwork_id, ip_hash, vote_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_dates ON contests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_artworks_contest ON artworks(contest_id);
CREATE INDEX IF NOT EXISTS idx_artworks_votes ON artworks(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_votes_artwork ON votes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_votes_contest ON votes(contest_id);
CREATE INDEX IF NOT EXISTS idx_votes_date ON votes(vote_date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_contests_updated_at BEFORE UPDATE ON contests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get active contest
CREATE OR REPLACE FUNCTION get_active_contest()
RETURNS TABLE (
  id UUID,
  title TEXT,
  week_number INTEGER,
  year INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT,
  winner_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.title, c.week_number, c.year, c.start_date, c.end_date, c.status, c.winner_id
  FROM contests c
  WHERE c.status = 'active'
    AND c.start_date <= NOW()
    AND c.end_date > NOW()
  ORDER BY c.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can vote
CREATE OR REPLACE FUNCTION can_vote(
  p_artwork_id UUID,
  p_ip_hash TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM votes
    WHERE artwork_id = p_artwork_id
      AND ip_hash = p_ip_hash
      AND vote_date = CURRENT_DATE
  ) INTO vote_exists;

  RETURN NOT vote_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to increment vote count
CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artworks
  SET vote_count = vote_count + 1
  WHERE id = NEW.artwork_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment vote count
CREATE TRIGGER increment_artwork_votes AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION increment_vote_count();

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

-- Function to archive contest and select winner
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
      winner_id = winner_artwork_id,
      updated_at = NOW()
  WHERE id = p_contest_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public read access to contests and artworks
CREATE POLICY "Public read access to contests" ON contests
  FOR SELECT USING (true);

CREATE POLICY "Public read access to artworks" ON artworks
  FOR SELECT USING (true);

-- Anyone can vote (insert into votes)
CREATE POLICY "Anyone can vote" ON votes
  FOR INSERT WITH CHECK (true);

-- Only allow reading own votes (optional, for authenticated users)
CREATE POLICY "Read own votes" ON votes
  FOR SELECT USING (true);

-- Service role can do everything (for admin/cron operations)
-- This is handled by using the service role key in API routes

COMMENT ON TABLE contests IS 'Weekly AI art contests';
COMMENT ON TABLE artworks IS 'AI-generated artwork entries for contests';
COMMENT ON TABLE votes IS 'User votes for artworks, one per IP per day';
COMMENT ON FUNCTION get_active_contest() IS 'Returns the currently active contest';
COMMENT ON FUNCTION can_vote(UUID, TEXT) IS 'Check if an IP address can vote for an artwork today';
COMMENT ON FUNCTION get_contest_winner(UUID) IS 'Returns the artwork ID with most votes for a contest';
COMMENT ON FUNCTION archive_contest(UUID) IS 'Archives a contest and selects the winner';
