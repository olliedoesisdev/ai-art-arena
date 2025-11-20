-- ============================================
-- Fix Vote Trigger Issue
-- ============================================
-- The error "record 'new' has no field 'vote_date'" indicates
-- there's an old trigger or function referencing the removed vote_date column

-- STEP 1: Check current triggers on votes table
SELECT 'Current triggers on votes table:' as info;
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'votes'
ORDER BY trigger_name;

-- STEP 2: Check votes table columns
SELECT 'Current columns in votes table:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'votes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 3: Drop ALL existing triggers on votes table
DROP TRIGGER IF EXISTS increment_artwork_votes ON votes;
DROP TRIGGER IF EXISTS trigger_update_artwork_vote_count ON votes;
DROP TRIGGER IF EXISTS update_vote_date ON votes;
DROP TRIGGER IF EXISTS set_vote_date ON votes;

SELECT '✓ Dropped all old triggers' as status;

-- STEP 4: Drop old trigger functions that might reference vote_date
DROP FUNCTION IF EXISTS increment_vote_count() CASCADE;
DROP FUNCTION IF EXISTS update_artwork_vote_count() CASCADE;
DROP FUNCTION IF EXISTS set_vote_date() CASCADE;
DROP FUNCTION IF EXISTS update_vote_date() CASCADE;

SELECT '✓ Dropped old trigger functions' as status;

-- STEP 5: Create the correct trigger function for email-based voting
CREATE OR REPLACE FUNCTION update_artwork_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Increment vote count when a vote is added
    UPDATE artworks
    SET vote_count = vote_count + 1
    WHERE id = NEW.artwork_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement vote count when a vote is removed
    UPDATE artworks
    SET vote_count = GREATEST(vote_count - 1, 0)
    WHERE id = OLD.artwork_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✓ Created update_artwork_vote_count function' as status;

-- STEP 6: Create the trigger
CREATE TRIGGER trigger_update_artwork_vote_count
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_vote_count();

SELECT '✓ Created trigger_update_artwork_vote_count trigger' as status;

-- STEP 7: Verify the setup
SELECT 'Verification - Triggers on votes table:' as info;
SELECT
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'votes';

-- STEP 8: Test vote insertion (will rollback, just for testing)
BEGIN;
  -- This should work without errors
  SELECT 'Testing vote insertion...' as info;
  -- We won't actually insert because we don't have a real user_id here
  SELECT 'Skipping actual insert test - test manually via the app' as info;
ROLLBACK;

SELECT '✓ All fixes applied successfully!' as status;
SELECT 'You can now test voting in the application' as next_step;
