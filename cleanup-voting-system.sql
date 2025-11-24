-- ============================================
-- Cleanup Voting System (Remove Duplicate Triggers)
-- ============================================
-- Your votes table already has vote_date and the daily constraint
-- But you have multiple conflicting triggers that need to be cleaned up

-- STEP 1: Check current state
SELECT 'Current triggers on votes table:' as info;
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'votes'
ORDER BY trigger_name;

SELECT 'Current constraint on votes table:' as info;
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'votes' AND constraint_type = 'UNIQUE';

-- STEP 2: Drop ALL existing triggers (we'll recreate the correct one)
DROP TRIGGER IF EXISTS increment_artwork_votes ON votes;
DROP TRIGGER IF EXISTS set_vote_date_trigger ON votes;
DROP TRIGGER IF EXISTS set_votes_vote_date ON votes;
DROP TRIGGER IF EXISTS trigger_update_artwork_vote_count ON votes;
DROP TRIGGER IF EXISTS update_vote_date ON votes;

SELECT '✓ Dropped all existing vote triggers' as status;

-- STEP 3: Drop all old trigger functions
DROP FUNCTION IF EXISTS increment_vote_count() CASCADE;
DROP FUNCTION IF EXISTS set_vote_date_from_voted_at() CASCADE;
DROP FUNCTION IF EXISTS votes_set_vote_date() CASCADE;
DROP FUNCTION IF EXISTS update_artwork_vote_count() CASCADE;
DROP FUNCTION IF EXISTS set_vote_date() CASCADE;
DROP FUNCTION IF EXISTS update_vote_date() CASCADE;

SELECT '✓ Dropped all old trigger functions' as status;

-- STEP 4: Create the ONLY trigger function we need
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

-- STEP 5: Create the ONLY trigger we need
CREATE TRIGGER trigger_update_artwork_vote_count
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_vote_count();

SELECT '✓ Created trigger_update_artwork_vote_count trigger' as status;

-- STEP 6: Ensure daily voting functions exist
CREATE OR REPLACE FUNCTION can_vote(
  p_artwork_id UUID,
  p_user_id UUID,
  p_contest_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  -- Check if user has already voted for this artwork TODAY
  SELECT EXISTS (
    SELECT 1
    FROM votes
    WHERE artwork_id = p_artwork_id
      AND user_id = p_user_id
      AND vote_date = CURRENT_DATE
  ) INTO vote_exists;

  RETURN NOT vote_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION can_vote(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_vote(UUID, UUID, UUID) TO anon;

SELECT '✓ Created/updated can_vote function' as status;

-- STEP 7: Create function to get user's votes for today
CREATE OR REPLACE FUNCTION get_user_votes_today(p_user_id UUID, p_contest_id UUID)
RETURNS TABLE(artwork_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT v.artwork_id
  FROM votes v
  WHERE v.user_id = p_user_id
    AND v.contest_id = p_contest_id
    AND v.vote_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_votes_today(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_votes_today(UUID, UUID) TO anon;

SELECT '✓ Created/updated get_user_votes_today function' as status;

-- STEP 8: Verify the final state
SELECT 'Verification - Final triggers:' as info;
SELECT
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'votes';

SELECT 'Verification - Should only have ONE trigger: trigger_update_artwork_vote_count' as note;

SELECT 'Verification - Final constraint:' as info;
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'votes'
  AND constraint_type = 'UNIQUE'
  AND constraint_name = 'votes_user_artwork_date_unique';

SELECT '✓ Voting system cleaned up successfully!' as status;
SELECT 'You can now test voting - it should work correctly' as next_step;
