-- ============================================
-- DATABASE DIAGNOSTIC SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor to diagnose issues
-- Copy the results and share them to help debug

-- ============================================
-- 1. Check which tables exist
-- ============================================
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 2. Check contests table structure (if exists)
-- ============================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'contests'
ORDER BY ordinal_position;

-- ============================================
-- 3. Check artworks table structure (if exists)
-- ============================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'artworks'
ORDER BY ordinal_position;

-- ============================================
-- 4. Check votes table structure (if exists)
-- ============================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'votes'
ORDER BY ordinal_position;

-- ============================================
-- 5. Check admin_users table structure (if exists)
-- ============================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'admin_users'
ORDER BY ordinal_position;

-- ============================================
-- 6. Check for any constraints on votes table
-- ============================================
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE con.contype
    WHEN 'c' THEN 'CHECK'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 't' THEN 'TRIGGER'
    WHEN 'x' THEN 'EXCLUSION'
  END AS constraint_type_desc,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_namespace nsp ON nsp.oid = con.connamespace
JOIN pg_class cls ON cls.oid = con.conrelid
WHERE nsp.nspname = 'public'
  AND cls.relname = 'votes'
ORDER BY con.contype, con.conname;

-- ============================================
-- 7. Check for any database functions
-- ============================================
SELECT
  routine_name,
  routine_type,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_active_contest',
    'can_vote',
    'increment_vote_count',
    'get_contest_winner',
    'archive_contest',
    'update_updated_at_column'
  )
ORDER BY routine_name;

-- ============================================
-- 8. Check for any existing contests
-- ============================================
-- This will error if contests table doesn't exist - that's okay
SELECT
  id,
  title,
  week_number,
  year,
  status,
  start_date,
  end_date
FROM contests
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- 9. Check for any existing admin users
-- ============================================
-- This will error if admin_users table doesn't exist - that's okay
SELECT
  id,
  email,
  name,
  role,
  is_active,
  created_at
FROM admin_users
ORDER BY created_at DESC;

-- ============================================
-- 10. Check auth.users (to see if your account exists)
-- ============================================
SELECT
  id,
  email,
  created_at,
  confirmed_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
