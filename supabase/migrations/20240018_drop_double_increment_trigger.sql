-- Drop the maintain_artwork_vote_count trigger which fired AFTER INSERT/DELETE
-- ON votes and called update_artwork_vote_count(). The submit_vote RPC already
-- does UPDATE artworks SET vote_count + 1 atomically, so the trigger was
-- incrementing every vote twice. Confirmed on live DB: artworks with 1 vote
-- row had vote_count = 2.
--
-- Authority for vote_count is the RPC. The trigger is removed; the function
-- is kept because it is harmless and may be referenced in migrations.

DROP TRIGGER IF EXISTS maintain_artwork_vote_count ON votes;

-- Also drop the duplicate updated_at trigger on artworks and contests.
-- Both set_updated_at() and update_updated_at_column() do the same thing.
-- Keep the *_updated_at variants (they fire first alphabetically and are
-- from the canonical migration); drop the update_*_updated_at duplicates.
DROP TRIGGER IF EXISTS update_artworks_updated_at ON artworks;
DROP TRIGGER IF EXISTS update_contests_updated_at ON contests;

-- Recalculate vote_count from the actual votes rows to correct the
-- doubled counts introduced by the trigger.
UPDATE artworks a
SET vote_count = (
  SELECT COUNT(*) FROM votes v WHERE v.artwork_id = a.id
);
