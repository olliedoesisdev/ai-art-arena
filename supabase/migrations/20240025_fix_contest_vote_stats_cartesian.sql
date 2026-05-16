-- Fix contest_vote_stats: COUNT(v.id) was overcounting because artworks and votes
-- were both LEFT JOINed to contests, causing a Cartesian product.
-- e.g. 6 artworks × 2 votes = 12 reported votes. Fix: subquery votes separately.

CREATE OR REPLACE VIEW contest_vote_stats AS
SELECT
  c.id,
  c.week_number,
  c.status,
  c.start_date,
  c.end_date,
  COALESCE(v.total_votes, 0)::int                                        AS total_votes,
  COUNT(DISTINCT a.id)::int                                              AS artwork_count,
  CASE WHEN COUNT(DISTINCT a.id) > 0
    THEN COALESCE(v.total_votes, 0)::numeric / COUNT(DISTINCT a.id)::numeric
    ELSE 0
  END                                                                    AS avg_votes_per_artwork
FROM contests c
LEFT JOIN artworks a ON a.contest_id = c.id
LEFT JOIN (
  SELECT contest_id, COUNT(*)::int AS total_votes
  FROM votes
  GROUP BY contest_id
) v ON v.contest_id = c.id
GROUP BY c.id, c.week_number, c.status, c.start_date, c.end_date, v.total_votes
ORDER BY c.week_number;
