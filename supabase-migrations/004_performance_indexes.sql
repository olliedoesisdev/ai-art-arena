-- =====================================================
-- Performance Optimization: Database Indexes
-- =====================================================
-- This migration adds critical indexes for query performance
-- Expected impact: 10-100x faster queries on large datasets
-- =====================================================

-- Index for finding active contests
-- Used in: Contest listing, voting pages
CREATE INDEX IF NOT EXISTS idx_contests_status_dates
ON contests(status, start_date, end_date)
WHERE deleted_at IS NULL;

-- Index for contest lookups by week
CREATE INDEX IF NOT EXISTS idx_contests_week_year
ON contests(year, week_number)
WHERE deleted_at IS NULL;

-- Index for finding artworks by contest
-- Used in: Contest detail pages, voting interface
CREATE INDEX IF NOT EXISTS idx_artworks_contest
ON artworks(contest_id)
WHERE deleted_at IS NULL;

-- Index for artwork vote count ordering (leaderboards)
CREATE INDEX IF NOT EXISTS idx_artworks_vote_count
ON artworks(vote_count DESC, created_at DESC)
WHERE deleted_at IS NULL;

-- Index for finding votes by artwork (vote counting)
-- Used in: Real-time vote updates, vote verification
CREATE INDEX IF NOT EXISTS idx_votes_artwork_created
ON votes(artwork_id, created_at DESC);

-- Index for finding votes by user (duplicate vote checking)
-- Used in: Vote validation
CREATE INDEX IF NOT EXISTS idx_votes_user_contest
ON votes(user_id, contest_id)
WHERE user_id IS NOT NULL;

-- Index for finding votes by user identifier (anonymous users)
CREATE INDEX IF NOT EXISTS idx_votes_identifier_contest
ON votes(user_identifier, contest_id)
WHERE user_identifier IS NOT NULL;

-- Index for vote analytics (IP-based tracking)
CREATE INDEX IF NOT EXISTS idx_votes_ip_hash
ON votes(ip_hash, created_at DESC);

-- Index for finding the winning artwork
CREATE INDEX IF NOT EXISTS idx_contests_winner
ON contests(winner_artwork_id)
WHERE winner_artwork_id IS NOT NULL;

-- =====================================================
-- Analyze tables to update statistics
-- =====================================================
ANALYZE contests;
ANALYZE artworks;
ANALYZE votes;

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON INDEX idx_contests_status_dates IS 'Optimizes active contest queries';
COMMENT ON INDEX idx_artworks_contest IS 'Optimizes artwork lookup by contest';
COMMENT ON INDEX idx_votes_artwork_created IS 'Optimizes vote counting and real-time updates';
COMMENT ON INDEX idx_votes_user_contest IS 'Optimizes duplicate vote checking for authenticated users';
