# Phase 1 Testing - Quick Start Guide

## 🚀 5-Minute Test

### Step 1: Run Database Diagnostic (1 min)
```sql
-- Open Supabase SQL Editor and run:
-- File: check-blog-phase1.sql
```

**Expected**: All checks show ✅

---

### Step 2: Check Web Diagnostic (1 min)
1. Navigate to: `/admin/blog/diagnostic`
2. **Expected**: All database tables show green ✅
3. **Expected**: See 5+ categories listed

---

### Step 3: Test Auto-Save (1 min)
1. Go to `/admin/blog/new`
2. Type title: "Test Post"
3. Add content: "Testing auto-save"
4. **Wait 30 seconds**
5. **Expected**: See "Last saved at..." in top-right

---

### Step 4: Test Live Preview (1 min)
1. Click **"Show Preview"** button (eye icon)
2. Type: `# Hello World`
3. **Expected**: See large heading in right pane instantly

---

### Step 5: Test Image Upload (1 min)
1. Click **Upload** button (cloud icon)
2. Select a small image (< 1MB)
3. **Expected**: Progress bar → 100% → image appears in content

---

## ✅ Success Criteria

If all 5 steps pass → **Phase 1 is working!** 🎉

---

## 🐛 If Tests Fail

### Auto-Save Not Working?
- **Check**: Browser localStorage enabled?
- **Fix**: Disable private/incognito mode

### Preview Not Showing?
- **Check**: Content has been typed?
- **Fix**: Refresh page, try again

### Upload Fails?
- **Check 1**: Does `blog-media` bucket exist?
  - Go to Supabase → Storage → Create bucket
- **Check 2**: Is bucket Public?
  - Supabase → Storage → blog-media → Settings → Public

---

## 📋 Full Test Suite

For comprehensive testing, see: **[BLOG-PHASE1-DIAGNOSTIC.md](BLOG-PHASE1-DIAGNOSTIC.md)**

---

## 🔗 Quick Links

- **Diagnostic Dashboard**: `/admin/blog/diagnostic`
- **Create New Post**: `/admin/blog/new`
- **Blog Posts List**: `/admin/blog`
- **Public Blog**: `/blog`

---

## ⚡ One-Command Check

Run in Supabase SQL Editor:
```sql
SELECT
  (SELECT COUNT(*) FROM blog_posts) as posts,
  (SELECT COUNT(*) FROM blog_categories) as categories,
  (SELECT COUNT(*) FROM blog_tags) as tags,
  (SELECT COUNT(*) FROM blog_media) as media;
```

**Expected**: All counts ≥ 0 (categories ≥ 5)

---

**Total Time**: ~5 minutes
**Difficulty**: Easy
**Result**: Know if Phase 1 is working ✅
