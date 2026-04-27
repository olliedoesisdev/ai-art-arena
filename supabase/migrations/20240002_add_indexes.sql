-- Required indexes per CLAUDE.md §7

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_contest_id
  ON artworks(contest_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_contest_votes
  ON artworks(contest_id, vote_count DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_artwork_id
  ON votes(artwork_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_ip_contest
  ON votes(ip_hash, contest_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_user_contest
  ON votes(user_id, contest_id) WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contests_status
  ON contests(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contests_week_status
  ON contests(week_number DESC, status);

-- Prevents duplicate votes from same IP on same contest
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_ip_contest
  ON votes(ip_hash, contest_id);
