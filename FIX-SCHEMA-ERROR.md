# 🔧 Fix "sort_order does not exist" Error

## What Happened?

Your database schema uses the `admin` schema:
- ✅ `admin.blog_posts`
- ✅ `admin.blog_categories`
- ✅ `admin.blog_tags`

But the application code tries to query the `public` schema:
- ❌ `public.blog_posts` (doesn't exist)
- ❌ `public.blog_categories` (doesn't exist)

This causes the error: **"column sort_order does not exist"** because it's looking in the wrong schema.

---

## ✅ Solution (2 Steps)

### Step 1: Apply Database Migrations

Run these 4 SQL files **in order** in your Supabase SQL Editor:

```bash
1. database/01-drop-old-tables.sql      ← Cleanup (if needed)
2. database/02-create-admin-schema.sql  ← Create admin.blog_* tables
3. database/03-seed-admin-data.sql      ← Add categories & tags
4. database/05-create-public-views.sql  ← Create public views (NEW!)
```

**What Step 4 does:**
- Creates `public.blog_posts` as a **view** that points to `admin.blog_posts`
- Creates views for all blog tables
- Adds INSTEAD OF triggers so INSERT/UPDATE/DELETE work
- **Result**: Application can query `public.blog_posts` and it automatically uses `admin.blog_posts`

### Step 2: Verify Setup

Run the diagnostic SQL:

```bash
Open: check-admin-blog-schema.sql
Run in Supabase SQL Editor
Look for all ✅ checkmarks
```

---

## 🎯 Quick Start (Copy-Paste Order)

### In Supabase SQL Editor:

**1. Drop old tables (if any)**
```sql
-- Run: database/01-drop-old-tables.sql
```

**2. Create admin schema**
```sql
-- Run: database/02-create-admin-schema.sql
```

**3. Seed data**
```sql
-- Run: database/03-seed-admin-data.sql
```

**4. Create public views** ⭐ **NEW - THIS FIXES THE ERROR**
```sql
-- Run: database/05-create-public-views.sql
```

**5. Verify**
```sql
-- Run: check-admin-blog-schema.sql
```

---

## 🔍 What This Achieves

### Before (Broken)
```typescript
// ❌ Tries to query public.blog_posts (doesn't exist)
await supabase.from('blog_posts').select('*')
// Error: relation "blog_posts" does not exist
```

### After (Fixed)
```typescript
// ✅ Queries public.blog_posts view → automatically uses admin.blog_posts
await supabase.from('blog_posts').select('*')
// Works! Returns data from admin.blog_posts
```

---

## 📊 Architecture

```
┌──────────────────────────────────────────┐
│  Application Code                        │
│  ↓                                       │
│  supabase.from('blog_posts')             │ ← Queries public schema
└────────────────┬─────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────┐
│  PUBLIC SCHEMA (Views)                   │
│  • blog_posts (view)                     │ ← Transparent proxy
│  • blog_categories (view)                │
│  • blog_tags (view)                      │
│  • ... etc                               │
└────────────────┬─────────────────────────┘
                 │ INSTEAD OF triggers
                 ↓
┌──────────────────────────────────────────┐
│  ADMIN SCHEMA (Real Tables)              │
│  • admin.blog_posts ✅                   │ ← Actual data storage
│  • admin.blog_categories ✅              │
│  • admin.blog_tags ✅                    │
│  • ... etc                               │
│  • RLS Policies ✅                       │
└──────────────────────────────────────────┘
```

---

## ✅ Benefits of This Approach

1. **No code changes needed** - Application works as-is
2. **Maintains security** - RLS policies on admin tables still apply
3. **Proper separation** - Admin data isolated in admin schema
4. **Type-safe** - Supabase type generation works normally
5. **INSERT/UPDATE/DELETE work** - Thanks to INSTEAD OF triggers

---

## 🧪 Test After Fixing

1. **Run diagnostic page**:
   ```
   http://localhost:3000/admin/blog/diagnostic
   ```
   Should show all ✅ green checkmarks

2. **Test creating a post**:
   ```
   http://localhost:3000/admin/blog/new
   ```
   Should load without errors

3. **Check Supabase Dashboard**:
   - Go to Table Editor
   - You should see both:
     - `admin.blog_posts` (table)
     - `public.blog_posts` (view)

---

## 🗑️ Optional Cleanup

After applying the fix, you can delete these outdated files:

```bash
❌ supabase-blog-schema.sql  ← Old public schema version
❌ check-blog-phase1.sql     ← Old diagnostic (use check-admin-blog-schema.sql instead)
```

Keep these:
```bash
✅ database/02-create-admin-schema.sql
✅ database/03-seed-admin-data.sql
✅ database/05-create-public-views.sql
✅ check-admin-blog-schema.sql
```

---

## 🚀 Ready to Fix?

**Run these NOW in Supabase SQL Editor:**
1. `database/02-create-admin-schema.sql`
2. `database/03-seed-admin-data.sql`
3. `database/05-create-public-views.sql` ⭐
4. `check-admin-blog-schema.sql` (verify)

**Then reload**:
- `/admin/blog/diagnostic`
- `/admin/blog/new`

Error should be gone! ✅
