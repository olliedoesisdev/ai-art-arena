-- Add CHECK (vote_count >= 0) to artworks.
-- This constraint already exists on the live DB but was applied ad-hoc outside the
-- migration system. This file makes it reproducible on db reset / new environments.
-- IF NOT EXISTS is not valid syntax for ADD CONSTRAINT, so we drop-if-exists first.

ALTER TABLE artworks
  DROP CONSTRAINT IF EXISTS artworks_vote_count_check;

ALTER TABLE artworks
  ADD CONSTRAINT artworks_vote_count_check CHECK (vote_count >= 0);
