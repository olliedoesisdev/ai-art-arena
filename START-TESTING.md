# 🧪 Phase 1 Testing - Start Here

## ✅ Pre-Testing Checklist

Before you begin testing, ensure:

1. **Database schema is applied**
   - Open Supabase SQL Editor
   - Run: `supabase-blog-schema.sql`
   - Expected: All tables created successfully

2. **Development server is running**
   ```bash
   npm run dev
   ```

3. **You're logged in as admin**
   - Navigate to `/admin`
   - Ensure you have admin access

---

## 🚀 Quick Test (5 minutes)

**Follow this guide**: [TESTING-QUICK-START.md](./TESTING-QUICK-START.md)

This will test all 3 Phase 1 features in ~5 minutes:
1. ✅ Auto-Save
2. ✅ Live Preview
3. ✅ Image Upload

---

## 🔍 Full Diagnostic (15 minutes)

### Option 1: Web Dashboard (Recommended)

1. Navigate to: **`/admin/blog/diagnostic`**
2. Review all green checkmarks ✅
3. Check data counts
4. Run manual tests listed on page

### Option 2: SQL Diagnostic

1. Open Supabase SQL Editor
2. Open file: **`check-blog-phase1.sql`**
3. Run the entire script
4. Expected: All checks show ✅

### Option 3: Manual Checklist

1. Open: **`BLOG-PHASE1-DIAGNOSTIC.md`**
2. Follow 20+ test cases step-by-step
3. Check off each passing test
4. Document any failures

---

## 📊 What You're Testing

### Feature 1: Auto-Save
- Draft recovery prevents data loss
- Saves every 30 seconds automatically
- Shows "Last saved at..." timestamp
- Recovery prompt on page reload

### Feature 2: Live Preview
- Side-by-side editor/preview
- Real-time rendering as you type
- Toggle on/off with button
- Supports all formatting

### Feature 3: Image Upload
- Drag-and-drop interface
- Progress bar (0% → 100%)
- File validation (type, size)
- Automatic insertion into content

---

## 🐛 If You Find Issues

### Auto-Save Not Working?
- Check browser console for errors
- Verify localStorage is enabled
- Disable private/incognito mode

### Preview Not Rendering?
- Check if content has TipTap JSON structure
- Refresh page and try again
- Check browser console

### Upload Fails?
1. **Verify bucket exists**:
   - Supabase → Storage → Should see `blog-media`
   - If not: Create bucket named `blog-media`

2. **Verify bucket is public**:
   - Storage → blog-media → Settings
   - Toggle "Public bucket" to ON

3. **Check API route**:
   - File exists: `src/app/api/admin/blog/media/route.ts`
   - Browser console shows upload request

---

## 📝 Report Results

After testing, document:

1. **What worked** ✅
2. **What failed** ❌
3. **Error messages** (if any)
4. **Browser used** (Chrome, Firefox, Safari, etc.)
5. **Any unexpected behavior**

---

## 🎯 Success Criteria

Phase 1 passes if:

- ✅ Auto-save creates draft in localStorage
- ✅ Recovery prompt appears on reload
- ✅ Preview renders all content types correctly
- ✅ Image upload shows progress and completes
- ✅ Uploaded image appears in content
- ✅ No console errors during normal usage

---

## 📚 Reference Documentation

- **Implementation Details**: [BLOG-PHASE1-COMPLETE.md](./BLOG-PHASE1-COMPLETE.md)
- **Quick Start**: [TESTING-QUICK-START.md](./TESTING-QUICK-START.md)
- **Full Test Suite**: [BLOG-PHASE1-DIAGNOSTIC.md](./BLOG-PHASE1-DIAGNOSTIC.md)
- **Setup Guide**: [BLOG-SETUP.md](./BLOG-SETUP.md)

---

## ⏱️ Estimated Time

- **Quick Test**: 5 minutes
- **Web Diagnostic**: 10 minutes
- **Full Manual Test**: 20-30 minutes

**Recommendation**: Start with Quick Test → If issues found, run Full Diagnostic

---

## 🚀 Ready to Begin?

1. **Start development server**: `npm run dev`
2. **Choose testing method** (Quick Test recommended)
3. **Follow the guide step-by-step**
4. **Report any issues you find**

Good luck! 🎉
