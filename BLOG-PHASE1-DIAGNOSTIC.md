# Blog Phase 1 - Full Diagnostic & Testing Guide

## 🔍 Pre-Flight Checklist

Before testing, ensure these prerequisites are met:

### 1. Database Setup
- [ ] Supabase blog schema has been run (`supabase-blog-schema.sql`)
- [ ] Tables exist: `blog_posts`, `blog_categories`, `blog_tags`, `blog_media`
- [ ] Default categories are seeded

### 2. Storage Setup
- [ ] Supabase Storage bucket `blog-media` exists
- [ ] Bucket is set to **Public**
- [ ] Storage policies are configured

### 3. Dependencies
- [ ] TipTap packages installed
- [ ] Next.js development server is running
- [ ] Admin user account exists and can log in

---

## 🧪 Diagnostic Tests

### Test 1: Auto-Save Feature

#### Test 1.1: Auto-Save Triggers
1. Navigate to `/admin/blog/new`
2. Enter a title: "Test Auto-Save"
3. Add some content in the editor
4. **Wait 30 seconds**
5. ✅ **Expected**: See "Last saved at [time]" indicator in top-right corner

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 1.2: Draft Recovery After Page Reload
1. Continue from Test 1.1 (with unsaved draft)
2. **Close the browser tab** (don't save)
3. Open a new tab and navigate to `/admin/blog/new`
4. ✅ **Expected**: See modal "Recover Unsaved Work?"
5. Click **"Recover Draft"**
6. ✅ **Expected**: All content is restored (title, content, etc.)

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 1.3: Discard Draft
1. Navigate to `/admin/blog/new` with an existing draft
2. When recovery modal appears, click **"Start Fresh"**
3. ✅ **Expected**: Modal closes, form is empty
4. Refresh page
5. ✅ **Expected**: No recovery prompt (draft was discarded)

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 1.4: Auto-Save Clears After Publish
1. Create a new post with auto-save
2. Wait for "Last saved at..." to appear
3. Click **"Publish Now"**
4. ✅ **Expected**: Redirected to `/admin/blog`
5. Navigate back to `/admin/blog/new`
6. ✅ **Expected**: No recovery prompt (auto-save was cleared)

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

### Test 2: Live Preview Mode

#### Test 2.1: Toggle Preview
1. Navigate to `/admin/blog/new`
2. Click **"Show Preview"** button (eye icon)
3. ✅ **Expected**:
   - Button changes to "Hide Preview"
   - Screen splits into 2 columns
   - Left: Editor
   - Right: Preview pane with "Live Preview" heading

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 2.2: Real-Time Preview Updates
1. With preview enabled, type in editor:
   ```
   # Heading 1
   This is **bold** and this is *italic*

   - Bullet item 1
   - Bullet item 2
   ```
2. ✅ **Expected**: Preview updates in real-time showing:
   - Large heading
   - Bold and italic text
   - Bullet list

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 2.3: Preview All Formatting Types

Test each formatting type and verify preview:

| Element | Markdown | Preview Shows Correctly |
|---------|----------|------------------------|
| Heading 1 | `# H1` | ⬜ Yes / ⬜ No |
| Heading 2 | `## H2` | ⬜ Yes / ⬜ No |
| Heading 3 | `### H3` | ⬜ Yes / ⬜ No |
| Bold | `**bold**` | ⬜ Yes / ⬜ No |
| Italic | `*italic*` | ⬜ Yes / ⬜ No |
| Code | `` `code` `` | ⬜ Yes / ⬜ No |
| Bullet List | `- item` | ⬜ Yes / ⬜ No |
| Numbered List | `1. item` | ⬜ Yes / ⬜ No |
| Blockquote | `> quote` | ⬜ Yes / ⬜ No |
| Link | (via button) | ⬜ Yes / ⬜ No |
| Image | (via button) | ⬜ Yes / ⬜ No |

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 2.4: Hide Preview
1. With preview showing, click **"Hide Preview"**
2. ✅ **Expected**:
   - Layout returns to full-width editor
   - Button changes to "Show Preview"

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

### Test 3: Image Upload

#### Test 3.1: Upload Button Visibility
1. Navigate to `/admin/blog/new`
2. Look at editor toolbar
3. ✅ **Expected**: See cloud/upload icon button
4. Hover over it
5. ✅ **Expected**: Tooltip shows "Upload Image"

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 3.2: Upload Modal Opens
1. Click **Upload Image** button
2. ✅ **Expected**: Modal appears with:
   - "Upload Image" title
   - Drag & drop zone
   - "Drag & drop your image here or click to browse"
   - File type/size info
   - Close (X) button

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 3.3: File Validation - Invalid Type
1. Open upload modal
2. Try to upload a `.txt` or `.pdf` file
3. ✅ **Expected**: Error message appears:
   - "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed."

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 3.4: File Validation - Too Large
1. Open upload modal
2. Try to upload an image > 5MB
3. ✅ **Expected**: Error message appears:
   - "File too large. Maximum size is 5MB."

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 3.5: Successful Upload - Click to Browse
1. Open upload modal
2. Click anywhere in the drop zone
3. ✅ **Expected**: File browser opens
4. Select a valid image (JPG/PNG < 5MB)
5. ✅ **Expected**:
   - Preview thumbnail appears
   - Progress bar shows 0% → 100%
   - "Uploading... X%" message
   - "Upload complete!" when done
   - Modal closes automatically
   - Image appears in editor content

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 3.6: Successful Upload - Drag & Drop
1. Open upload modal
2. Drag an image file from your computer
3. Drop it onto the upload zone
4. ✅ **Expected**: Same behavior as Test 3.5

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 3.7: Cancel Upload
1. Open upload modal
2. Click **Cancel** or **X** button
3. ✅ **Expected**: Modal closes, no upload happens

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 3.8: Multiple Uploads in Same Session
1. Upload an image successfully
2. Click upload button again
3. Upload another image
4. ✅ **Expected**: Both images appear in content

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

### Test 4: Integration Tests

#### Test 4.1: Auto-Save + Preview
1. Enable preview mode
2. Type content
3. Wait 30 seconds
4. ✅ **Expected**:
   - Auto-save indicator appears
   - Preview continues to work

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 4.2: Auto-Save + Image Upload
1. Type some content
2. Wait for auto-save
3. Upload an image
4. Refresh page and recover draft
5. ✅ **Expected**:
   - Text content is restored
   - Image URL is restored in content

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 4.3: Preview + Image Upload
1. Enable preview mode
2. Upload an image
3. ✅ **Expected**: Image appears in both editor AND preview

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

#### Test 4.4: Full Workflow Test
1. Navigate to `/admin/blog/new`
2. Enter title: "Full Test Post"
3. Enable preview
4. Add heading: `## Introduction`
5. Add text with **bold** and *italic*
6. Upload an image
7. Add a bullet list
8. Wait for auto-save
9. Check preview shows everything correctly
10. Close tab, reopen, recover draft
11. Verify all content is intact
12. Publish post
13. Navigate to `/admin/blog`
14. ✅ **Expected**: Post appears in list

**Status**: ⬜ Pass / ⬜ Fail

**Notes**: _____________________

---

## 🚨 Common Issues & Solutions

### Issue: Auto-Save Not Working

**Symptoms**: No "Last saved at..." indicator appears

**Checks**:
1. Open browser DevTools → Console
2. Look for errors
3. Check localStorage:
   ```javascript
   localStorage.getItem('blog-new')
   ```

**Solutions**:
- Clear localStorage and try again
- Check if browser blocks localStorage (private mode)
- Verify useAutoSave hook is imported correctly

---

### Issue: Preview Not Rendering

**Symptoms**: Preview pane is blank or shows "Start writing to see preview..."

**Checks**:
1. Verify content is being typed in editor
2. Check browser console for errors
3. Verify renderPreview function exists

**Solutions**:
- Try toggling preview off/on
- Refresh page
- Check that content state is updating

---

### Issue: Image Upload Fails

**Symptoms**: Upload progress stalls or shows error

**Checks**:
1. Verify Supabase Storage bucket exists:
   - Go to Supabase Dashboard → Storage
   - Check for `blog-media` bucket
2. Check bucket is Public
3. Verify API endpoint exists:
   ```
   /api/admin/blog/media
   ```
4. Check browser Network tab for API errors

**Solutions**:
- Create `blog-media` bucket if missing
- Set bucket to Public
- Verify storage policies are set
- Check file meets requirements (type, size)

---

### Issue: Upload Modal Won't Close

**Symptoms**: Modal stays open after upload

**Checks**:
1. Check if upload actually succeeded
2. Look for JavaScript errors in console

**Solutions**:
- Click X button to manually close
- Refresh page
- Check onUpload callback is called

---

## 📊 Diagnostic Report Template

Copy this template and fill it out:

```
===========================================
BLOG PHASE 1 DIAGNOSTIC REPORT
Date: _______________
Tester: _______________
===========================================

ENVIRONMENT
-----------
- Browser: _______________
- Browser Version: _______________
- Supabase Project: _______________
- Blog Schema Installed: Yes / No
- Storage Bucket Exists: Yes / No

AUTO-SAVE TESTS
---------------
1.1 Auto-Save Triggers: PASS / FAIL
1.2 Draft Recovery: PASS / FAIL
1.3 Discard Draft: PASS / FAIL
1.4 Clear After Publish: PASS / FAIL

LIVE PREVIEW TESTS
------------------
2.1 Toggle Preview: PASS / FAIL
2.2 Real-Time Updates: PASS / FAIL
2.3 All Formatting: PASS / FAIL
2.4 Hide Preview: PASS / FAIL

IMAGE UPLOAD TESTS
------------------
3.1 Button Visibility: PASS / FAIL
3.2 Modal Opens: PASS / FAIL
3.3 Invalid Type: PASS / FAIL
3.4 Too Large: PASS / FAIL
3.5 Click Upload: PASS / FAIL
3.6 Drag & Drop: PASS / FAIL
3.7 Cancel: PASS / FAIL
3.8 Multiple Uploads: PASS / FAIL

INTEGRATION TESTS
-----------------
4.1 Auto-Save + Preview: PASS / FAIL
4.2 Auto-Save + Upload: PASS / FAIL
4.3 Preview + Upload: PASS / FAIL
4.4 Full Workflow: PASS / FAIL

OVERALL STATUS: ⬜ ALL PASS / ⬜ SOME FAIL

ISSUES FOUND
------------
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

NOTES
-----
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🎯 Success Criteria

Phase 1 is considered **FULLY FUNCTIONAL** if:

- ✅ All auto-save tests pass (4/4)
- ✅ All preview tests pass (4/4)
- ✅ All image upload tests pass (8/8)
- ✅ All integration tests pass (4/4)
- ✅ Full workflow test passes

**Minimum Passing Grade**: 18/20 tests (90%)

---

## 🔧 Debug Mode

To enable verbose logging for troubleshooting:

```javascript
// Add to BlogPostForm.tsx temporarily
useEffect(() => {
  console.log('[DEBUG] Auto-save state:', {
    title,
    hasContent: !!content,
    lastSaved: autoSave.lastSaved
  });
}, [title, content, autoSave.lastSaved]);
```

---

## 📞 Support

If tests fail:

1. Check [BLOG-UX-IMPROVEMENTS.md](BLOG-UX-IMPROVEMENTS.md) for implementation details
2. Review [BLOG-PHASE1-COMPLETE.md](BLOG-PHASE1-COMPLETE.md) for feature specs
3. Check browser console for errors
4. Verify all prerequisites are met

---

## ✅ Sign-Off

Once all tests pass:

- Tester: _______________
- Date: _______________
- Signature: _______________

**Phase 1 Status**: ⬜ APPROVED / ⬜ NEEDS FIXES

---

**Ready to begin testing? Start with the Pre-Flight Checklist!** 🚀
