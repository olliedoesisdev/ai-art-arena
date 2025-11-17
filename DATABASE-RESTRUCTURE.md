# Database Restructure Guide

## Overview

This guide will help you restructure your database with proper schema separation:
- ✅ **Public Schema**: User-facing data (artworks, contests, votes)
- ✅ **Admin Schema**: Admin-only data (blog, admin users)
- ✅ **Auth Schema**: Managed by Supabase (user authentication)

## Current Issues

❌ `admin_users` in public schema (should be private)
❌ `public_users` table (not needed with passwordless auth)
❌ Blog tables location unclear
❌ Mixed admin and public data

## New Structure

### Public Schema (Keep These)
```
public.artworks          ✅ User-facing
public.contests          ✅ User-facing
public.votes             ✅ User-facing
public.audit_logs        ✅ Audit trail
```

### Admin Schema (New - Private)
```
admin.users              🔒 Admin accounts
admin.blog_posts         🔒 Blog content
admin.blog_categories    🔒 Blog categories
admin.blog_tags          🔒 Blog tags
admin.blog_post_tags     🔒 Junction table
admin.blog_media         🔒 Blog media
admin.blog_post_revisions 🔒 Version history
```

### Auth Schema (Supabase Managed)
```
auth.users               🔐 Managed by Supabase
```

## Step-by-Step Migration

### Step 1: Backup Your Data (IMPORTANT!)

Before running any scripts, backup your database:

1. Go to Supabase Dashboard → Database → Backups
2. Create a manual backup
3. Or download your data:
   ```sql
   -- Export admin users
   SELECT * FROM public.admin_users;

   -- Export blog data if you have any
   SELECT * FROM public.blog_posts;
   ```

### Step 2: Run the Migration Scripts

Run these scripts **in order** in the Supabase SQL Editor:

#### Script 1: Drop Old Tables
**File**: `database/01-drop-old-tables.sql`

```sql
-- This removes:
-- - public.public_users
-- - public.admin_users
-- - All blog tables from public schema
```

**⚠️ WARNING**: This deletes data! Make sure you have a backup.

**How to run**:
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `01-drop-old-tables.sql`
3. Click "Run"

#### Script 2: Create Admin Schema
**File**: `database/02-create-admin-schema.sql`

```sql
-- This creates:
-- - admin schema
-- - All admin tables with proper structure
-- - Indexes for performance
-- - RLS policies for security
```

**How to run**:
1. Copy contents of `02-create-admin-schema.sql`
2. Paste in SQL Editor
3. Click "Run"

#### Script 3: Seed Admin Data
**File**: `database/03-seed-admin-data.sql`

```sql
-- This adds:
-- - 7 blog categories
-- - 25 blog tags
```

**How to run**:
1. Copy contents of `03-seed-admin-data.sql`
2. Paste in SQL Editor
3. Click "Run"

#### Script 4: Create Your Admin User
**File**: `database/04-create-admin-user.sql`

```sql
-- This adds you as a super_admin
```

**How to run**:
1. First, sign up via your admin signup page at `/admin/signup`
2. Then, edit `04-create-admin-user.sql`
3. Replace `'your-email@example.com'` with your actual email
4. Run the script in SQL Editor

### Step 3: Verify the Migration

Run this query to check everything is set up:

```sql
-- Check admin schema exists
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'admin';

-- Check admin tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'admin'
ORDER BY table_name;

-- Check your admin user
SELECT id, email, role, is_active
FROM admin.users;

-- Check blog categories
SELECT COUNT(*) as category_count
FROM admin.blog_categories;

-- Check blog tags
SELECT COUNT(*) as tag_count
FROM admin.blog_tags;
```

Expected output:
- ✅ admin schema exists
- ✅ 7 tables in admin schema
- ✅ 1 admin user (you)
- ✅ 7 blog categories
- ✅ 25 blog tags

### Step 4: Update TypeScript Types

After creating the tables, generate new TypeScript types:

```bash
# Generate types from your new schema
npx supabase gen types typescript --project-id qolctvveygnhxbjxzzkb > src/types/database.ts
```

Or manually update `src/types/database.ts` to reflect the new admin schema.

## Updated Code References

After migration, update these table references in your code:

### Before (Old)
```typescript
// ❌ Old way
supabase.from('admin_users').select('*')
supabase.from('blog_posts').select('*')
```

### After (New)
```typescript
// ✅ New way
supabase.from('admin.users').select('*')
supabase.from('admin.blog_posts').select('*')
```

## Security Benefits

### Row Level Security (RLS)

All admin tables have RLS enabled with these policies:

1. **Admin Users Table**:
   - Admins can read their own data
   - Super admins can manage all users

2. **Blog Tables**:
   - Only authenticated admins can read
   - Admins, super admins, and editors can write

3. **Public Tables**:
   - Anyone can read (artworks, contests)
   - Voting requires authentication

### Schema Separation

- **Public schema**: Accessible to everyone (with RLS)
- **Admin schema**: Only accessible to authenticated admins
- **Auth schema**: Managed by Supabase, secure by default

## Rollback Plan

If something goes wrong:

1. **Restore from backup**:
   - Go to Supabase Dashboard → Database → Backups
   - Select your backup
   - Click "Restore"

2. **Or recreate old structure**:
   ```sql
   -- Recreate old public.admin_users table
   CREATE TABLE public.admin_users (
     id uuid PRIMARY KEY,
     email text UNIQUE NOT NULL,
     -- ... other fields
   );
   ```

## Testing Checklist

After migration, test these features:

- [ ] Admin login works
- [ ] Can access admin dashboard
- [ ] Can create blog posts
- [ ] Can edit blog posts
- [ ] Can add categories
- [ ] Can add tags
- [ ] Blog post saves correctly
- [ ] Media uploads work
- [ ] Public users can still vote
- [ ] Artworks display correctly
- [ ] Contests work properly

## Common Issues

### Issue: "relation does not exist"
**Cause**: Table references still using old schema
**Fix**: Update code to use `admin.table_name` format

### Issue: "permission denied"
**Cause**: RLS policies not set up correctly
**Fix**: Check admin user exists and has proper role

### Issue: "admin user not found"
**Cause**: Didn't run script 4 or used wrong email
**Fix**: Run script 4 with correct email after signing up

## Next Steps

After successful migration:

1. ✅ Delete old SQL files that reference public.admin_users
2. ✅ Update all code references to use admin schema
3. ✅ Test all admin functionality
4. ✅ Update API routes to query admin tables
5. ✅ Deploy changes to production

## Quick Command Summary

```bash
# In Supabase SQL Editor, run in order:
1. 01-drop-old-tables.sql
2. 02-create-admin-schema.sql
3. 03-seed-admin-data.sql
4. 04-create-admin-user.sql (after editing your email)

# Then generate types:
npx supabase gen types typescript --project-id qolctvveygnhxbjxzzkb > src/types/database.ts

# Test locally:
npm run dev

# Deploy:
git add .
git commit -m "Restructure database with proper schema separation"
git push
```

## Support

If you run into issues:
1. Check the Supabase logs
2. Verify RLS policies
3. Check admin user exists
4. Restore from backup if needed

## Summary

This restructure provides:
- ✅ Better security (admin data is private)
- ✅ Cleaner organization (logical schema separation)
- ✅ Proper naming conventions (admin.table_name)
- ✅ RLS policies (automatic access control)
- ✅ Scalability (easy to add more admin features)

Your database will be much more secure and maintainable! 🎉
