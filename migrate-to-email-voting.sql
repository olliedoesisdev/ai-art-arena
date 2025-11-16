-- ============================================
-- Migrate to Email-Based Voting System
-- ============================================
-- This migration changes the voting system from IP-based to email-based
-- Users must register with their email to vote (1 vote per person per artwork per contest)

-- ============================================
-- STEP 1: Create public_users table
-- ============================================
-- This table stores registered voters (separate from admin_users)
CREATE TABLE IF NOT EXISTS public_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_public_users_email ON public_users(email);

-- Enable RLS
ALTER TABLE public_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public_users
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public_users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Anyone can insert (for registration)
CREATE POLICY "Anyone can register"
  ON public_users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================
-- STEP 2: Update votes table schema
-- ============================================
-- Make user_id required and remove ip_hash requirement
-- We'll keep ip_hash for analytics but it's no longer the primary identifier

-- First, backup existing votes (optional but recommended)
-- CREATE TABLE votes_backup AS SELECT * FROM votes;

-- Drop the old unique constraint (artwork_id, ip_hash, vote_date)
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_artwork_id_ip_hash_vote_date_key;

-- Make user_id NOT NULL (but first we need to handle existing data)
-- For existing votes, we can either:
-- Option A: Delete them (clean slate)
-- DELETE FROM votes;

-- Option B: Keep them but they won't be enforced by new constraint
-- (They'll exist but new votes will require user_id)

-- Update the schema
ALTER TABLE votes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE votes ALTER COLUMN ip_hash DROP NOT NULL;

-- Add new unique constraint: one vote per user per artwork per contest
ALTER TABLE votes ADD CONSTRAINT votes_user_artwork_contest_unique
  UNIQUE(user_id, artwork_id, contest_id);

-- ============================================
-- STEP 3: Update the can_vote function
-- ============================================
DROP FUNCTION IF EXISTS can_vote(UUID, TEXT);

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

-- ============================================
-- STEP 4: Create helper function to check user registration
-- ============================================
CREATE OR REPLACE FUNCTION is_registered_voter(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public_users
    WHERE id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: Update vote count trigger
-- ============================================
-- Create trigger to update artwork vote_count when votes are added/removed
CREATE OR REPLACE FUNCTION update_artwork_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE artworks
    SET vote_count = vote_count + 1
    WHERE id = NEW.artwork_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE artworks
    SET vote_count = vote_count - 1
    WHERE id = OLD.artwork_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_artwork_vote_count ON votes;

-- Create the trigger
CREATE TRIGGER trigger_update_artwork_vote_count
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_vote_count();

-- ============================================
-- STEP 6: Add updated_at trigger for public_users
-- ============================================
DROP TRIGGER IF EXISTS update_public_users_updated_at ON public_users;

CREATE TRIGGER update_public_users_updated_at
  BEFORE UPDATE ON public_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the migration:

-- Check public_users table exists
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name = 'public_users';

-- Check new constraint on votes table
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'votes' AND constraint_name = 'votes_user_artwork_contest_unique';

-- Check can_vote function signature
-- SELECT routine_name, routine_definition
-- FROM information_schema.routines
-- WHERE routine_name = 'can_vote';

-- ============================================
-- CLEANUP (Optional)
-- ============================================
-- If you want to remove old IP-based votes:
-- TRUNCATE votes;

-- If you want to reset artwork vote counts to 0:
-- UPDATE artworks SET vote_count = 0;

-- ============================================
-- NOTES
-- ============================================
-- After running this migration:
-- 1. Users must sign up with their email to vote
-- 2. Each user can vote once per artwork per contest (not per day)
-- 3. IP hashing is still tracked but not used for vote validation
-- 4. Old votes with null user_id will need to be handled
-- 5. Update your frontend to require authentication before voting
