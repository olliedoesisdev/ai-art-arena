-- Migration: multi-contest types
-- Adds contest_type, theme, theme_description, max_submissions to contests.
-- Creates submissions table with RLS for photo contest moderation queue.
-- Non-destructive: all existing rows default to 'ai_art'.

-- 1. Extend contests table
ALTER TABLE contests
  ADD COLUMN IF NOT EXISTS contest_type TEXT NOT NULL DEFAULT 'ai_art'
    CHECK (contest_type IN ('ai_art', 'photo')),
  ADD COLUMN IF NOT EXISTS theme TEXT,
  ADD COLUMN IF NOT EXISTS theme_description TEXT,
  ADD COLUMN IF NOT EXISTS max_submissions INTEGER;

-- 2. Submissions table (photo contest moderation queue)
CREATE TABLE IF NOT EXISTS submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id      UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL,
  public_image_url TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES auth.users(id)
);

-- 3. Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_submissions_contest_id
  ON submissions(contest_id);

CREATE INDEX IF NOT EXISTS idx_submissions_user_contest
  ON submissions(user_id, contest_id);

CREATE INDEX IF NOT EXISTS idx_submissions_status
  ON submissions(status);

CREATE INDEX IF NOT EXISTS idx_contests_type_status
  ON contests(contest_type, status);

-- 4. RLS on submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own rows
CREATE POLICY "submissions_insert_own" ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can read their own rows
CREATE POLICY "submissions_select_own" ON submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all rows
CREATE POLICY "submissions_select_admin" ON submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Admins can update all rows (approve / reject)
CREATE POLICY "submissions_update_admin" ON submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );
