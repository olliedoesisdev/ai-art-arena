-- Migration: Fix can_vote() function signature
-- Date: 2025-11-25
-- Description: Update can_vote function to match API usage with p_user_id and p_contest_id parameters

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS can_vote(UUID, TEXT);
DROP FUNCTION IF EXISTS can_vote(UUID, UUID, UUID);

-- Create the updated can_vote function
CREATE OR REPLACE FUNCTION can_vote(
  p_artwork_id UUID,
  p_user_id UUID,
  p_contest_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  -- Check if user has already voted for this artwork today
  SELECT EXISTS (
    SELECT 1
    FROM votes
    WHERE artwork_id = p_artwork_id
      AND user_id = p_user_id
      AND contest_id = p_contest_id
      AND vote_date = CURRENT_DATE
  ) INTO vote_exists;

  -- Return true if user can vote (no vote exists today), false otherwise
  RETURN NOT vote_exists;
END;
$$;

-- Add function comment
COMMENT ON FUNCTION can_vote(UUID, UUID, UUID) IS
'Check if a user can vote for an artwork. Returns true if no vote exists for today, false otherwise.';
