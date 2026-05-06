-- users table — mirrors auth.users, stores role and profile info.
-- Created separately from initial schema because auth.ts and admin routes
-- both depend on it for role lookups and GitHub OAuth upserts.

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL UNIQUE,
  name         TEXT,
  avatar_url   TEXT,
  password_hash TEXT,
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row; admins can read all
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (not their role)
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- Service role (used by auth callbacks) can insert new users
CREATE POLICY "users_insert_service"
  ON users FOR INSERT
  WITH CHECK (true);

-- Index for email lookups (auth signIn callback)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Seed the first admin account (your GitHub login email)
-- Run this after your first GitHub sign-in to grant admin access:
-- UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
