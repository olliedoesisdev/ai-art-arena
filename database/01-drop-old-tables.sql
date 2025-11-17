-- =============================================
-- Drop Old Tables Script
-- This removes existing tables to start fresh
-- =============================================

-- WARNING: This will delete all data!
-- Make sure you have a backup if needed

BEGIN;

-- Drop public tables (keeping only what we need)
DROP TABLE IF EXISTS public.public_users CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Drop blog tables if they exist in public schema
DROP TABLE IF EXISTS public.blog_post_revisions CASCADE;
DROP TABLE IF EXISTS public.blog_media CASCADE;
DROP TABLE IF EXISTS public.blog_post_tags CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.blog_tags CASCADE;
DROP TABLE IF EXISTS public.blog_categories CASCADE;

COMMIT;

-- Note: We're keeping these public tables:
-- - artworks
-- - contests
-- - votes
-- - audit_logs
