-- ============================================
-- Fix can_vote function for email-based voting
-- ============================================
-- Run this in Supabase SQL Editor

-- Drop old function signature
DROP FUNCTION IF EXISTS can_vote(UUID, TEXT);

-- Create the new function with correct signature
CREATE OR REPLACE FUNCTION can_vote(
  p_artwork_id UUID,
  p_user_id UUID,
  p_contest_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  -- Check if user has already voted for this artwork in this contest
  SELECT EXISTS (
    SELECT 1
    FROM votes
    WHERE artwork_id = p_artwork_id
      AND user_id = p_user_id
      AND contest_id = p_contest_id
  ) INTO vote_exists;

  RETURN NOT vote_exists;
END;
$$ LANGUAGE plpgsql;
