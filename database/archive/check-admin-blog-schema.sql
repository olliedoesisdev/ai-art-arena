-- ============================================
-- Blog Admin Schema Diagnostic
-- ============================================
-- Run this in Supabase SQL Editor to verify setup

-- Check 1: Verify admin schema exists
SELECT
  '=== SCHEMA CHECK ===' as test_section
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'admin')
    THEN '✅ admin schema EXISTS'
    ELSE '❌ admin schema MISSING - Run 02-create-admin-schema.sql'
  END;

-- Check 2: Verify all blog tables exist
SELECT
  '=== TABLE CHECK ===' as test_section
UNION ALL
SELECT
  CONCAT(
    CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'admin'
        AND table_name = t.table_name
      )
      THEN '✅ '
      ELSE '❌ '
    END,
    'admin.', t.table_name
  ) as status
FROM (
  VALUES
    ('users'),
    ('blog_categories'),
    ('blog_tags'),
    ('blog_posts'),
    ('blog_post_tags'),
    ('blog_media'),
    ('blog_post_revisions')
) AS t(table_name);

-- Check 3: Verify blog categories are seeded
SELECT
  '=== CATEGORY SEED CHECK ===' as test_section
UNION ALL
SELECT
  CONCAT(
    '✅ ', COUNT(*), ' categories seeded (',
    CASE
      WHEN COUNT(*) >= 7 THEN 'COMPLETE'
      ELSE 'INCOMPLETE - Run 03-seed-admin-data.sql'
    END, ')'
  )
FROM admin.blog_categories;

-- Check 4: List all categories
SELECT
  '=== CATEGORIES ===' as test_section
UNION ALL
SELECT
  CONCAT(sort_order, '. ', name, ' (', slug, ')') as category_list
FROM admin.blog_categories
ORDER BY sort_order;

-- Check 5: Verify blog tags are seeded
SELECT
  '=== TAG SEED CHECK ===' as test_section
UNION ALL
SELECT
  CONCAT(
    '✅ ', COUNT(*), ' tags seeded (',
    CASE
      WHEN COUNT(*) >= 25 THEN 'COMPLETE'
      ELSE 'INCOMPLETE - Run 03-seed-admin-data.sql'
    END, ')'
  )
FROM admin.blog_tags;

-- Check 6: Data counts
SELECT
  '=== DATA COUNTS ===' as test_section
UNION ALL
SELECT
  CONCAT(
    'Posts: ', (SELECT COUNT(*) FROM admin.blog_posts), ' | ',
    'Categories: ', (SELECT COUNT(*) FROM admin.blog_categories), ' | ',
    'Tags: ', (SELECT COUNT(*) FROM admin.blog_tags), ' | ',
    'Media: ', (SELECT COUNT(*) FROM admin.blog_media)
  ) as summary;

-- Check 7: Verify RLS policies exist
SELECT
  '=== RLS POLICY CHECK ===' as test_section
UNION ALL
SELECT
  CONCAT('✅ ', tablename, ': ', policyname) as policy_info
FROM pg_policies
WHERE schemaname = 'admin'
  AND tablename LIKE 'blog_%'
ORDER BY tablename, policyname
LIMIT 10;

-- Check 8: Verify indexes exist
SELECT
  '=== INDEX CHECK ===' as test_section
UNION ALL
SELECT
  CONCAT('✅ ', indexname, ' on ', tablename) as index_info
FROM pg_indexes
WHERE schemaname = 'admin'
  AND tablename LIKE 'blog_%'
  AND indexname NOT LIKE '%pkey'
ORDER BY tablename, indexname
LIMIT 10;

-- Check 9: Verify admin users table
SELECT
  '=== ADMIN USERS CHECK ===' as test_section
UNION ALL
SELECT
  CONCAT(
    CASE
      WHEN EXISTS (SELECT 1 FROM admin.users)
      THEN CONCAT('✅ ', COUNT(*), ' admin users exist')
      ELSE '⚠️  No admin users - Run 04-create-admin-user.sql'
    END
  )
FROM admin.users;

-- Check 10: Verify triggers exist
SELECT
  '=== TRIGGER CHECK ===' as test_section
UNION ALL
SELECT
  CONCAT('✅ ', trigger_name, ' on admin.', event_object_table) as trigger_info
FROM information_schema.triggers
WHERE trigger_schema = 'admin'
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- Final summary
SELECT
  '=== SUMMARY ===' as test_section
UNION ALL
SELECT
  CONCAT(
    CASE
      WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'admin' AND table_name LIKE 'blog_%') >= 6
        AND (SELECT COUNT(*) FROM admin.blog_categories) >= 7
        AND (SELECT COUNT(*) FROM admin.blog_tags) >= 25
      THEN '✅ SCHEMA SETUP COMPLETE - Ready to use!'
      ELSE '❌ INCOMPLETE - Check errors above'
    END
  ) as final_status;

