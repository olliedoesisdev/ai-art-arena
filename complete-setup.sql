-- ============================================
-- COMPLETE DATABASE SETUP
-- ============================================
-- This script sets up everything you need in one go
-- Run this in Supabase SQL Editor

-- ============================================
-- PART 1: FIX CONTEST SCHEMA
-- ============================================

-- Drop conflicting triggers and constraints
DROP TRIGGER IF EXISTS update_contests_updated_at ON contests;
DROP TRIGGER IF EXISTS update_artworks_updated_at ON artworks;
DROP TRIGGER IF EXISTS increment_artwork_votes ON votes;

-- Update contests table structure
ALTER TABLE contests ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS year INTEGER;

UPDATE contests SET title = 'Week ' || week_number WHERE title IS NULL;
ALTER TABLE contests ALTER COLUMN title SET NOT NULL;

UPDATE contests SET year = EXTRACT(YEAR FROM start_date) WHERE year IS NULL;
ALTER TABLE contests ALTER COLUMN year SET NOT NULL;

ALTER TABLE contests DROP CONSTRAINT IF EXISTS contests_status_check;
ALTER TABLE contests ADD CONSTRAINT contests_status_check
  CHECK (status IN ('draft', 'active', 'ended', 'archived'));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contests' AND column_name = 'winner_id'
  ) THEN
    ALTER TABLE contests RENAME COLUMN winner_id TO winner_artwork_id;
  END IF;
END $$;

ALTER TABLE contests ADD COLUMN IF NOT EXISTS winner_artwork_id UUID;

-- Update artworks table structure
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS artist_name TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE artworks ALTER COLUMN prompt DROP NOT NULL;
ALTER TABLE artworks DROP COLUMN IF EXISTS style;
ALTER TABLE artworks DROP COLUMN IF EXISTS view_count;
ALTER TABLE artworks DROP COLUMN IF EXISTS updated_at;

-- Update votes table structure
ALTER TABLE votes ADD COLUMN IF NOT EXISTS user_identifier TEXT;
UPDATE votes SET user_identifier = COALESCE(user_identifier, ip_hash, 'unknown') WHERE user_identifier IS NULL;
ALTER TABLE votes ALTER COLUMN user_identifier SET NOT NULL;
ALTER TABLE votes ALTER COLUMN ip_hash DROP NOT NULL;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_artwork_id_ip_hash_vote_date_key;
ALTER TABLE votes DROP COLUMN IF EXISTS vote_date;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'votes_user_id_fkey'
  ) THEN
    ALTER TABLE votes ADD CONSTRAINT votes_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

-- Recreate indexes
DROP INDEX IF EXISTS idx_votes_date;
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_dates ON contests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_artworks_contest ON artworks(contest_id);
CREATE INDEX IF NOT EXISTS idx_artworks_votes ON artworks(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_votes_artwork ON votes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_votes_contest ON votes(contest_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_identifier ON votes(user_identifier);
CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON votes(voted_at DESC);

-- Recreate triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contests_updated_at
  BEFORE UPDATE ON contests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artworks
  SET vote_count = vote_count + 1
  WHERE id = NEW.artwork_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_artwork_votes
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_vote_count();

-- Update database functions
CREATE OR REPLACE FUNCTION get_active_contest()
RETURNS TABLE (
  contest_id UUID,
  week_number INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  time_remaining INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as contest_id,
    c.week_number,
    c.start_date,
    c.end_date,
    (c.end_date - NOW()) as time_remaining
  FROM contests c
  WHERE c.status = 'active'
    AND c.start_date <= NOW()
    AND c.end_date > NOW()
  ORDER BY c.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_vote(
  p_contest_id UUID,
  p_user_identifier TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM votes
    WHERE contest_id = p_contest_id
      AND user_identifier = p_user_identifier
  ) INTO vote_exists;

  RETURN NOT vote_exists;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_contest_winner(p_contest_id UUID)
RETURNS UUID AS $$
DECLARE
  winner_artwork_id UUID;
BEGIN
  SELECT id INTO winner_artwork_id
  FROM artworks
  WHERE contest_id = p_contest_id
  ORDER BY vote_count DESC, created_at ASC
  LIMIT 1;

  RETURN winner_artwork_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION archive_contest(p_contest_id UUID)
RETURNS VOID AS $$
DECLARE
  winner_artwork_id UUID;
BEGIN
  SELECT get_contest_winner(p_contest_id) INTO winner_artwork_id;

  UPDATE contests
  SET status = 'archived',
      winner_artwork_id = winner_artwork_id,
      updated_at = NOW()
  WHERE id = p_contest_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 2: SETUP ADMIN TABLES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can view their own profile" ON admin_users;
DROP POLICY IF EXISTS "Only admins can create admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON admin_users;
DROP POLICY IF EXISTS "Only admins can delete admin users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;

-- Create tables
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'editor')) DEFAULT 'editor',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'admin' AND au.is_active = true));

CREATE POLICY "Users can view their own profile"
  ON admin_users FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Only admins can create admin users"
  ON admin_users FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'admin' AND au.is_active = true));

CREATE POLICY "Only admins can update admin users"
  ON admin_users FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'admin' AND au.is_active = true));

CREATE POLICY "Users can update their own profile"
  ON admin_users FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Only admins can delete admin users"
  ON admin_users FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'admin' AND au.is_active = true));

CREATE POLICY "Admin users can view audit logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.is_active = true));

CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Create triggers
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create helper functions
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_users WHERE id = user_id AND role = 'admin' AND is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_admin_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_users WHERE id = user_id AND is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create your admin user (see instructions below)';
  RAISE NOTICE '2. Create a test contest to see it working';
  RAISE NOTICE '';
END $$;
