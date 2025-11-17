# ⚡ Quick Fix: "sort_order does not exist" Error

## 🎯 The Problem

You got this error:
```
ERROR: 42703: column "sort_order" does not exist
```

**Why**: Your database uses `admin.blog_categories` but the app queries `public.blog_categories`.

---

## ✅ The Solution (1 File)

Run **ONE SQL file** in Supabase SQL Editor:

### [database/05-create-public-views.sql](database/05-create-public-views.sql)

This creates `public.blog_*` **views** that automatically map to `admin.blog_*` tables.

---

## 🚀 Steps to Fix

### 1. Open Supabase SQL Editor

Go to your Supabase project → SQL Editor

### 2. Run This File

Copy and paste the contents of **`database/05-create-public-views.sql`** and click "RUN"

### 3. Verify

Run **`check-admin-blog-schema.sql`** to verify everything is set up correctly.

### 4. Test

Reload:
- `/admin/blog/diagnostic` ← Should show all ✅
- `/admin/blog/new` ← Should load without errors

---

## 📊 What This Does

```
Application Code
     ↓
supabase.from('blog_posts')  ← Queries public.blog_posts (view)
     ↓
PUBLIC SCHEMA (Views)         ← Transparent proxy layer
     ↓
ADMIN SCHEMA (Real Tables)    ← Actual data stored here
```

**Benefits**:
- ✅ No code changes needed
- ✅ Admin data stays in admin schema (secure)
- ✅ RLS policies still work
- ✅ INSERT/UPDATE/DELETE work via triggers

---

## 📁 Files Overview

### Run These (In Order)
1. ✅ `database/02-create-admin-schema.sql` - Creates admin.blog_* tables
2. ✅ `database/03-seed-admin-data.sql` - Adds categories & tags
3. ⭐ `database/05-create-public-views.sql` - **THE FIX** - Creates views
4. ✅ `check-admin-blog-schema.sql` - Verify setup

### Documentation
- 📖 `FIX-SCHEMA-ERROR.md` - Detailed explanation
- 📖 `ADMIN-SCHEMA-SOLUTION.md` - Technical details

---

## ⚠️ Important Notes

1. **Don't delete** `admin.blog_*` tables - they contain your data
2. **Don't run** `supabase-blog-schema.sql` - it's outdated
3. **Do run** `database/05-create-public-views.sql` - this fixes everything

---

## 🧪 Quick Test

After applying the fix, run this in Supabase SQL Editor:

```sql
-- Test the view
SELECT * FROM public.blog_categories LIMIT 5;

-- Should return 7 categories from admin.blog_categories
```

If you see 7 categories → **Fixed!** ✅

---

## 🆘 Still Having Issues?

Run the diagnostic SQL:
```bash
check-admin-blog-schema.sql
```

Look for any ❌ and follow the instructions in the output.

---

**TL;DR**: Run `database/05-create-public-views.sql` in Supabase SQL Editor. Done! 🎉
