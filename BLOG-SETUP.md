# Blog System Setup Instructions

This guide will help you set up the complete blog system for AI Art Arena, including the TipTap editor, FAQ accordions, and SEO optimization.

## Table of Contents

1. [Database Setup](#database-setup)
2. [Supabase Storage Setup](#supabase-storage-setup)
3. [Testing the System](#testing-the-system)
4. [Features Overview](#features-overview)
5. [Usage Guide](#usage-guide)

---

## Database Setup

### Step 1: Run the Blog Schema Migration

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `supabase-blog-schema.sql`
4. Copy and paste the entire contents into the SQL Editor
5. Click "Run" to execute the migration

This will create:
- `blog_categories` - Blog post categories with color coding
- `blog_tags` - Tags for cross-referencing posts
- `blog_posts` - Main blog posts table with rich content
- `blog_post_tags` - Many-to-many junction table
- `blog_media` - Media library for images
- `blog_post_revisions` - Automatic revision history

### Step 2: Verify the Migration

Run this query to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'blog_%';
```

You should see 6 tables: `blog_categories`, `blog_tags`, `blog_posts`, `blog_post_tags`, `blog_media`, `blog_post_revisions`.

### Step 3: Check Default Categories

The migration automatically seeds 5 default categories:

```sql
SELECT id, name, slug, color, icon FROM blog_categories ORDER BY sort_order;
```

You should see:
- AI Art Tips (Purple)
- Contest Updates (Teal)
- Community Spotlights (Pink)
- FAQ (Amber)
- News (Blue)

---

## Supabase Storage Setup

### Step 1: Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New Bucket**
3. Name it `blog-media`
4. Make it **Public** (for easy image access)
5. Click **Create Bucket**

### Step 2: Set Storage Policies

Add these policies to allow admins to upload and manage media:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-media' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-media'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-media'
  AND auth.role() = 'authenticated'
);
```

---

## Testing the System

### Step 1: Access the Admin Blog Panel

1. Make sure you're logged in as an admin user
2. Navigate to `/admin/blog`
3. You should see the blog management dashboard with stats

### Step 2: Create Your First Blog Post

1. Click **"New Post"** button
2. Fill in the form:
   - **Title**: "Welcome to Our Blog"
   - **Slug**: Will auto-generate from title
   - **Excerpt**: Brief summary
   - **Category**: Select "News"
   - **Content**: Use the TipTap editor to write content

3. Try the editor features:
   - **Bold, Italic, Code**: Text formatting
   - **Headings**: H1, H2, H3
   - **Lists**: Bullet and numbered lists
   - **Images**: Click image icon, paste URL
   - **Links**: Highlight text, click link icon
   - **Code Blocks**: For sharing code snippets

4. **Save as Draft** first to test
5. Then click **"Publish Now"** when ready

### Step 3: Test FAQ Section (for SEO)

1. In the post editor, click **"Add FAQ Section"**
2. Click **"Add Question"**
3. Enter a question and answer
4. Add 2-3 FAQ items
5. This will automatically generate Schema.org markup for Google's FAQ rich results

### Step 4: View the Public Blog

1. Navigate to `/blog` to see the blog list
2. Click on your post to view it
3. Check that:
   - Featured image displays correctly
   - Category badge shows
   - Content renders properly
   - FAQ accordion works (if you added FAQs)

---

## Features Overview

### Admin Features

#### 1. Blog Post Management
- **Location**: `/admin/blog`
- Create, edit, delete blog posts
- Draft/Published/Scheduled status workflow
- Rich text editor with TipTap
- Auto-save drafts

#### 2. Rich Text Editor (TipTap)
- **WYSIWYG editing** - What you see is what you get
- **Formatting**: Bold, italic, inline code
- **Headings**: H1, H2, H3 for proper structure
- **Lists**: Bullet and numbered lists
- **Media**: Images via URL
- **Links**: External and internal linking
- **Code Blocks**: Syntax highlighting
- **Blockquotes**: For quotes and callouts
- **Undo/Redo**: Full history support
- **Character count**: Track post length

#### 3. FAQ Block System
- **Dedicated FAQ editor** for each post
- **Accordion UI** - Collapsible questions
- **Schema.org markup** auto-generated
- **SEO optimized** for Google's FAQ rich results
- **AEO (Answer Engine Optimization)** ready

#### 4. SEO Optimization
- **Meta title** (with character counter)
- **Meta description** (with character counter)
- **Open Graph tags** for social sharing
- **Twitter card** support
- **Automatic slug** generation
- **Read time calculation**
- **View tracking**

#### 5. Content Organization
- **Categories**: Organize by topic with color coding
- **Tags**: Cross-reference related content
- **Contest linking**: Connect posts to specific contests
- **Featured images**: Hero images for posts
- **Author attribution**: Track who wrote what

#### 6. Media Library
- **Location**: `/api/admin/blog/media`
- Upload images via API
- Track file metadata
- Organize by folders
- Auto-generate thumbnails (future feature)

#### 7. Revision History
- **Automatic snapshots** on every edit
- Track content changes
- See who made changes
- Restore previous versions (future feature)

### Public Features

#### 1. Blog List Page
- **Location**: `/blog`
- Grid layout with featured images
- Category filtering
- Search by category
- Responsive design

#### 2. Blog Post Page
- **Location**: `/blog/[slug]`
- Clean, readable layout
- FAQ accordion (if present)
- Related contest links
- Share buttons (future feature)
- View counter
- Reading time estimate

#### 3. Category Pages
- **Location**: `/blog/category/[slug]`
- Filter posts by category
- Category description
- Post count

#### 4. SEO & Performance
- **Server-side rendering** for instant loading
- **Dynamic metadata** per post
- **Schema.org markup** for rich results
- **Open Graph** for social sharing
- **Optimized images** (future: WebP conversion)

---

## Usage Guide

### Creating a High-Quality Blog Post

1. **Plan Your Content**
   - Define your target audience
   - Outline key points
   - Gather images and resources

2. **Use Headings Properly**
   - H1: Post title (automatic)
   - H2: Main sections
   - H3: Subsections
   - Avoid skipping levels

3. **Add Visual Elements**
   - Featured image (1200x630 recommended)
   - In-content images (max 5MB)
   - Alt text for accessibility

4. **Optimize for SEO**
   - Meta title: 50-60 characters
   - Meta description: 120-160 characters
   - Use keywords naturally
   - Add FAQ section if applicable

5. **Organize with Categories & Tags**
   - Choose ONE primary category
   - Add 2-5 relevant tags
   - Link to related contests

### Creating FAQ Content for SEO

FAQ sections are powerful for SEO because:
- Google shows them as rich results
- Answer engines (ChatGPT, Perplexity) prioritize them
- Users find quick answers

**Best Practices**:
1. Use clear, concise questions
2. Answer directly and completely
3. Include 3-8 FAQ items per post
4. Use natural language
5. Target common search queries

**Example FAQ Structure**:

```
Q: What is AI-generated art?
A: AI-generated art is artwork created using artificial intelligence algorithms like DALL-E, Midjourney, or Stable Diffusion. These tools use machine learning to transform text prompts into unique images.

Q: How do I participate in the AI Art Arena contests?
A: To participate, visit our active contest page during the submission period (typically Monday-Friday), upload your AI-generated artwork, provide the prompt you used, and submit. Voting opens each weekend.
```

### Managing Categories

**To Add a New Category**:

```javascript
// Via API or directly in Supabase
INSERT INTO blog_categories (name, slug, description, color, icon, sort_order)
VALUES (
  'Tutorials',
  'tutorials',
  'Step-by-step guides for creating AI art',
  '#10b981', -- Green color
  'BookOpen', -- Lucide icon name
  6
);
```

**Available Lucide Icons**: See https://lucide.dev/icons/

### Managing Tags

Tags are created on-demand when writing posts, or you can pre-create them:

```javascript
// Via API or directly in Supabase
INSERT INTO blog_tags (name, slug)
VALUES
  ('Beginner Tips', 'beginner-tips'),
  ('Midjourney', 'midjourney'),
  ('DALL-E', 'dall-e'),
  ('Stable Diffusion', 'stable-diffusion');
```

### Scheduling Posts

1. Write your post and set status to **"Scheduled"**
2. Set the **"Scheduled For"** date/time
3. Save the post
4. A cron job (future feature) will auto-publish at the scheduled time

**Note**: Currently, you need to manually change status from "scheduled" to "published". Auto-publishing can be added with a cron job.

---

## API Endpoints

### Blog Posts

```
GET    /api/admin/blog/posts           - List all posts
POST   /api/admin/blog/posts           - Create new post
GET    /api/admin/blog/posts/[id]      - Get single post
PUT    /api/admin/blog/posts/[id]      - Update post
DELETE /api/admin/blog/posts/[id]      - Delete post
```

### Categories

```
GET    /api/admin/blog/categories      - List all categories
POST   /api/admin/blog/categories      - Create category
```

### Tags

```
GET    /api/admin/blog/tags            - List all tags
POST   /api/admin/blog/tags            - Create tag
```

### Media

```
GET    /api/admin/blog/media           - List media files
POST   /api/admin/blog/media           - Upload media file
```

---

## Troubleshooting

### Issue: "Table doesn't exist" error

**Solution**: Run the migration script in Supabase SQL Editor

### Issue: Images won't upload

**Solution**: Check that:
1. Supabase Storage bucket `blog-media` exists
2. Bucket is set to Public
3. Storage policies are configured
4. File size is under 5MB
5. File type is allowed (JPEG, PNG, GIF, WebP, SVG)

### Issue: Blog posts don't appear on `/blog`

**Solution**: Check that:
1. Post status is "published"
2. `published_at` date is in the past
3. RLS policies allow public read access

### Issue: TipTap editor not loading

**Solution**:
1. Check browser console for errors
2. Verify all TipTap packages are installed
3. Clear Next.js cache: `rm -rf .next`
4. Restart dev server: `npm run dev`

### Issue: FAQ Schema.org markup not working

**Solution**:
1. Use Google's Rich Results Test: https://search.google.com/test/rich-results
2. Paste your blog post URL
3. Check for FAQ schema errors
4. Ensure FAQ items have both question and answer

---

## Next Steps & Future Enhancements

### Recommended Additions

1. **Auto-Publishing Cron Job**
   - Set up Vercel Cron or Supabase Edge Functions
   - Auto-publish scheduled posts

2. **Image Upload UI**
   - Drag-and-drop file uploads
   - Image preview and cropping
   - WebP conversion for performance

3. **Search Functionality**
   - Full-text search across posts
   - Filter by category, tag, date
   - PostgreSQL full-text search

4. **Related Posts**
   - Show similar posts based on tags
   - Category-based recommendations

5. **Comments System**
   - Enable discussion on posts
   - Moderation tools
   - Email notifications

6. **Newsletter Integration**
   - Email signup form
   - Auto-send new posts
   - Integrate with services like ConvertKit or Mailchimp

7. **Analytics**
   - Track popular posts
   - View sources
   - Reading time heatmaps

---

## Support

If you encounter issues:

1. Check this documentation first
2. Review Supabase logs for errors
3. Check browser console for frontend errors
4. Verify all environment variables are set
5. Ensure admin user has proper permissions

---

## Congratulations!

You now have a fully-functional blog system with:
- ✅ Rich text editing with TipTap
- ✅ FAQ accordions for maximum SEO
- ✅ Schema.org markup for rich results
- ✅ Category and tag organization
- ✅ Media library
- ✅ Draft/publish workflow
- ✅ Revision history
- ✅ Mobile-responsive design
- ✅ Server-side rendering for performance

Start creating amazing content to engage your AI Art Arena community!
