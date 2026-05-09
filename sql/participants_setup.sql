-- ==========================================
-- SUBSCRIBERS (mailing list / general fans)
-- ==========================================

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
ON subscribers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can read subscribers"
ON subscribers FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- ==========================================
-- ARTIST APPLICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS artist_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,

  -- Creative profile
  artist_bio TEXT NOT NULL,
  art_style TEXT NOT NULL,
  primary_tools TEXT[] NOT NULL,
  years_using_ai TEXT NOT NULL,
  portfolio_url TEXT,
  social_handle TEXT,

  -- Submission
  submission_title TEXT NOT NULL,
  submission_prompt TEXT NOT NULL,
  submission_image_url TEXT NOT NULL,
  submission_image_path TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
  admin_notes TEXT,

  -- Metadata
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  approved_for_contest_id UUID REFERENCES contests(id)
);

ALTER TABLE artist_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application"
ON artist_applications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can read applications"
ON artist_applications FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update application status"
ON artist_applications FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');

CREATE INDEX IF NOT EXISTS idx_applications_status ON artist_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email ON artist_applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at
  ON artist_applications(applied_at DESC);

-- ==========================================
-- SUPABASE STORAGE BUCKET
-- ==========================================
-- Run this separately in Supabase Storage settings if the bucket
-- does not already exist:
-- Bucket name: submissions
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
