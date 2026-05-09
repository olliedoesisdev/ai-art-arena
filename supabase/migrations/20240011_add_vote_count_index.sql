-- Leaderboard: efficient top-N artworks by vote_count across all contests
CREATE INDEX IF NOT EXISTS idx_artworks_vote_count
  ON artworks(vote_count DESC);
