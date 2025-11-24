-- ============================================
-- Enable Daily Voting (One Vote Per Day Per Artwork)
-- ============================================
-- Changes voting from "once per contest" to "once per day per artwork"

-- STEP 1: Check current constraint
SELECT 'Current constraint on votes table:' as info;
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'votes' AND constraint_type = 'UNIQUE';

-- STEP 2: Add vote_date column if it doesn't exist
ALTER TABLE votes ADD COLUMN IF NOT EXISTS vote_date DATE DEFAULT CURRENT_DATE;

-- Update existing votes to have vote_date set to today
-- (Since we don't have a created_at column, we'll set all existing votes to today)
UPDATE votes
SET vote_date = CURRENT_DATE
WHERE vote_date IS NULL;

-- Make vote_date NOT NULL
ALTER TABLE votes ALTER COLUMN vote_date SET NOT NULL;

SELECT '✓ Added vote_date column' as status;

-- STEP 3: Drop old unique constraint (one per contest)
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_artwork_contest_unique;

SELECT '✓ Dropped old constraint' as status;

-- STEP 4: Add new unique constraint (one per day)
-- Drop it first in case it already exists
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_artwork_date_unique;

-- Create the new constraint
ALTER TABLE votes ADD CONSTRAINT votes_user_artwork_date_unique
  UNIQUE(user_id, artwork_id, vote_date);

SELECT '✓ Created new daily voting constraint' as status;

-- STEP 5: Update can_vote function to check daily votes
DROP FUNCTION IF EXISTS can_vote(UUID, UUID, UUID);

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

SELECT '✓ Updated can_vote function for daily voting' as status;

-- STEP 6: Create function to get user's votes for today
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

SELECT '✓ Created get_user_votes_today function' as status;

-- STEP 7: Verify the setup
SELECT 'Verification - Updated constraint:' as info;
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'votes' AND constraint_type = 'UNIQUE';

SELECT 'Verification - votes table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'votes' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '✓ Daily voting enabled successfully!' as status;
SELECT 'Users can now vote once per day for each artwork' as info;
