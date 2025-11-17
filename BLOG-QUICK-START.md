# Blog System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run Database Migration (2 min)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Copy/paste contents of `supabase-blog-schema.sql`
4. Click **Run**
5. Wait for "Success" message

### Step 2: Create Storage Bucket (1 min)

1. Go to **Storage** in Supabase
2. Click **New Bucket**
3. Name: `blog-media`
4. Make it **Public**
5. Click **Create**

### Step 3: Set Storage Policies (1 min)

Run this in SQL Editor:

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-media' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-media'
  AND auth.role() = 'authenticated'
);
```

### Step 4: Create Your First Post (1 min)

1. Navigate to `/admin/blog`
2. Click **New Post**
3. Fill in:
   - Title: "Welcome to Our Blog"
   - Category: News
   - Write some content
4. Click **Publish Now**
5. Visit `/blog` to see it live!

---

## 📍 Key URLs

**Admin**:
- Blog List: `/admin/blog`
- New Post: `/admin/blog/new`
- Categories: `/admin/blog/categories`

**Public**:
- Blog Home: `/blog`
- Blog Post: `/blog/[slug]`
- Category: `/blog/category/[slug]`

**API**:
- Posts: `/api/admin/blog/posts`
- Categories: `/api/admin/blog/categories`
- Tags: `/api/admin/blog/tags`
- Media: `/api/admin/blog/media`

---

## 🎨 Editor Shortcuts

| Action | Shortcut |
|--------|----------|
| **Bold** | Ctrl/Cmd + B |
| **Italic** | Ctrl/Cmd + I |
| **Heading 1** | Click H1 button |
| **Heading 2** | Click H2 button |
| **Bullet List** | Click list button |
| **Add Link** | Highlight text → Link button |
| **Add Image** | Image button → Paste URL |
| **Undo** | Ctrl/Cmd + Z |
| **Redo** | Ctrl/Cmd + Shift + Z |

---

## ✅ Pre-configured Categories

The system includes 5 ready-to-use categories:

1. **🎨 AI Art Tips** (Purple) - Guides and tutorials
2. **🏆 Contest Updates** (Teal) - Weekly announcements
3. **⭐ Community Spotlights** (Pink) - Featured artists
4. **❓ FAQ** (Amber) - Frequently asked questions
5. **📰 News** (Blue) - Latest updates

---

## 🎯 Writing Your First Post

### Good Post Structure

```markdown
# Introduction (H2)
Brief intro paragraph

## Main Topic (H2)
Content with images and lists

### Subtopic (H3)
More detailed content

## FAQ (if applicable)
Add FAQ section for SEO

## Conclusion (H2)
Wrap up and call-to-action
```

### SEO Checklist

- [ ] Compelling title (50-60 chars)
- [ ] Meta description (120-160 chars)
- [ ] Featured image (1200x630px recommended)
- [ ] Alt text for images
- [ ] 1 category selected
- [ ] 2-5 tags added
- [ ] FAQ section (if applicable)
- [ ] Preview before publishing

---

## 🔧 Common Tasks

### Add a New Tag

Tags are created automatically when you use them in a post, or manually via SQL:

```sql
INSERT INTO blog_tags (name, slug)
VALUES ('Midjourney', 'midjourney');
```

### Add a New Category

```sql
INSERT INTO blog_categories (name, slug, description, color, icon, sort_order)
VALUES (
  'Tutorials',
  'tutorials',
  'Step-by-step guides',
  '#10b981',
  'BookOpen',
  6
);
```

### Link Post to Contest

When creating/editing a post:
1. Scroll to "Link to Contest" dropdown
2. Select the contest
3. Save

---

## 📊 What Gets Tracked Automatically

- ✅ View count (increments on page view)
- ✅ Read time (calculated from word count)
- ✅ Post count per category
- ✅ Post count per tag
- ✅ Revision history (on every edit)
- ✅ Author attribution
- ✅ Publish date
- ✅ Last updated date

---

## 🎭 Post Statuses

| Status | Description | Visible on `/blog` |
|--------|-------------|-------------------|
| **Draft** | Work in progress | ❌ No |
| **Published** | Live and public | ✅ Yes |
| **Scheduled** | Set for future | ❌ Not yet |
| **Archived** | Hidden/deprecated | ❌ No |

---

## 💡 Pro Tips

### For Best SEO

1. **Use FAQ sections** - Google loves structured Q&A
2. **Add alt text to images** - Helps accessibility and image SEO
3. **Write compelling meta descriptions** - Increases click-through rate
4. **Use H2/H3 headings** - Helps structure content
5. **Link to related content** - Keeps users engaged

### For Better Content

1. **Start with an outline** - Plan before writing
2. **Use visual hierarchy** - Headings, lists, images
3. **Break up text** - Short paragraphs are easier to read
4. **Add examples** - Make concepts concrete
5. **Include CTAs** - Guide readers to next steps

### For Workflow Efficiency

1. **Save as draft first** - Review before publishing
2. **Use categories consistently** - Easier to find content
3. **Tag thoughtfully** - 2-5 tags is ideal
4. **Preview on mobile** - Most readers are on phones
5. **Check links** - Make sure external links work

---

## 🆘 Quick Troubleshooting

**Post won't publish?**
→ Check that title, slug, and content are filled in

**Images won't load?**
→ Make sure storage bucket `blog-media` exists and is public

**Can't see blog in sidebar?**
→ Refresh the page or check admin permissions

**FAQ not showing on post?**
→ Make sure you clicked "Add FAQ Section" and saved

**Category not appearing?**
→ Check that category has `post_count > 0`

---

## 📚 Full Documentation

For detailed info, see:
- **BLOG-SETUP.md** - Complete setup guide
- **BLOG-SUMMARY.md** - Technical overview
- **supabase-blog-schema.sql** - Database schema

---

## 🎉 You're Ready!

Start creating content and engaging your AI Art Arena community!

**Next Steps**:
1. Write your first "Welcome" post
2. Create an FAQ post for common questions
3. Announce your latest contest
4. Share AI art tips and tutorials

Happy blogging! 🚀
