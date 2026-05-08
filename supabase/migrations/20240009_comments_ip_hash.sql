-- Add ip_hash to comments for rate-limiting (not exposed publicly)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS ip_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_comments_ip_hash_created
  ON comments(ip_hash, created_at);
