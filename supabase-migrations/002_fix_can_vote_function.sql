-- Migration 002: Fix can_vote() function signature
-- This fixes the parameter mismatch between the database function and API usage

-- Drop the old function
DROP FUNCTION IF EXISTS can_vote(UUID, TEXT);

-- Create updated function with correct signature
CREATE OR REPLACE FUNCTION can_vote(
  p_artwork_id UUID,
  p_user_id UUID,
  p_contest_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  -- Check if a vote exists for this user, artwork, and contest on the current date
  SELECT EXISTS (
    SELECT 1
    FROM votes
    WHERE artwork_id = p_artwork_id
      AND user_id = p_user_id
      AND contest_id = p_contest_id
      AND vote_date = CURRENT_DATE
  ) INTO vote_exists;

  -- Return true if user CAN vote (vote doesn't exist)
  RETURN NOT vote_exists;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION can_vote(UUID, UUID, UUID) IS
  'Check if a user can vote for an artwork today. Returns true if no vote exists for this user/artwork/contest combination on the current date.';
