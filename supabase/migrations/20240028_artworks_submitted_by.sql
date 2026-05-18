-- Add submitted_by to artworks — nullable FK to users.
-- NULL = admin-uploaded AI art. Non-null = approved photo submission.
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for profile lookups ("artworks by this user")
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_submitted_by
  ON artworks(submitted_by)
  WHERE submitted_by IS NOT NULL;
