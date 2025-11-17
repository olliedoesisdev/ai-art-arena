-- ============================================
-- Blog Phase 1 Diagnostic SQL Script
-- ============================================
-- Run this in Supabase SQL Editor to verify setup

-- Check 1: Verify all blog tables exist
SELECT
  'Table Check' as test_name,
  table_name,
  CASE
    WHEN table_name IN ('blog_posts', 'blog_categories', 'blog_tags', 'blog_post_tags', 'blog_media', 'blog_post_revisions')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'blog_%'
ORDER BY table_name;

-- Check 2: Verify default categories are seeded
SELECT
  '--- Category Check ---' as separator
UNION ALL
SELECT
  CONCAT('Category: ', name, ' (', slug, ')') as category_info
FROM blog_categories
ORDER BY sort_order;

-- Check 3: Count existing blog posts
SELECT
  '--- Post Count ---' as separator
UNION ALL
SELECT
  CONCAT('Total posts: ', COUNT(*)) as post_count
FROM blog_posts;

-- Check 4: Verify blog_media table is ready
SELECT
  '--- Media Table Check ---' as separator
UNION ALL
SELECT
  CASE
    WHEN COUNT(*) >= 0 THEN '✅ blog_media table is ready'
    ELSE '❌ blog_media table has issues'
  END as status
FROM blog_media;

-- Check 5: Verify RLS policies exist
SELECT
  '--- RLS Policy Check ---' as separator
UNION ALL
SELECT
  CONCAT('Table: ', tablename, ' | Policy: ', policyname) as policy_info
FROM pg_policies
WHERE tablename LIKE 'blog_%'
ORDER BY tablename, policyname;

-- Check 6: Verify indexes exist
SELECT
  '--- Index Check ---' as separator
UNION ALL
SELECT
  CONCAT('Index: ', indexname, ' on ', tablename) as index_info
FROM pg_indexes
WHERE tablename LIKE 'blog_%'
  AND indexname NOT LIKE '%pkey'
ORDER BY tablename, indexname;

-- Check 7: Verify functions exist
SELECT
  '--- Function Check ---' as separator
UNION ALL
SELECT
  CONCAT('Function: ', routine_name) as function_info
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_name LIKE '%blog%'
    OR routine_name IN ('update_updated_at_column', 'generate_slug', 'calculate_read_time')
  )
ORDER BY routine_name;

-- Check 8: Test data summary
SELECT
  '--- Summary ---' as separator
UNION ALL
SELECT CONCAT(
  'Categories: ', (SELECT COUNT(*) FROM blog_categories), ' | ',
  'Tags: ', (SELECT COUNT(*) FROM blog_tags), ' | ',
  'Posts: ', (SELECT COUNT(*) FROM blog_posts), ' | ',
  'Media: ', (SELECT COUNT(*) FROM blog_media)
) as summary;

-- Check 9: Verify admin_users table exists (needed for author attribution)
SELECT
  '--- Admin Users Check ---' as separator
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users')
    THEN CONCAT('✅ admin_users table exists | Count: ', (SELECT COUNT(*) FROM admin_users))
    ELSE '❌ admin_users table is missing'
  END as status;

-- Check 10: Storage bucket check (informational - needs manual verification)
SELECT
  '--- Storage Bucket ---' as separator
UNION ALL
SELECT
  'ℹ️  MANUAL CHECK: Verify blog-media bucket exists in Supabase Storage dashboard' as info;

-- Final status
SELECT
  '===========================================' as separator
UNION ALL
SELECT
  'DIAGNOSTIC COMPLETE' as status
UNION ALL
SELECT
  'Check output above for any ❌ indicators' as next_step;
