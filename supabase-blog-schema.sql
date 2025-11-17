-- ============================================
-- Blog System Schema for AI Art Arena
-- ============================================
-- This adds a full-featured blog system with:
-- - Rich content editor (TipTap compatible JSON storage)
-- - Categories and tags for organization
-- - SEO optimization with meta tags
-- - FAQ accordion support with Schema.org markup
-- - Media management
-- - Draft/Published workflow
-- - Author attribution via admin_users

-- ============================================
-- STEP 1: Blog Categories
-- ============================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8b5cf6', -- Purple theme
  icon TEXT, -- Lucide icon name
  post_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_sort ON blog_categories(sort_order);

-- ============================================
-- STEP 2: Blog Tags
-- ============================================
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_name ON blog_tags(name);

-- ============================================
-- STEP 3: Blog Posts
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,

  -- Content (TipTap JSON format for rich editing)
  content JSONB NOT NULL,

  -- Featured Image
  featured_image_url TEXT,
  featured_image_alt TEXT,

  -- Organization
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  contest_id UUID REFERENCES contests(id) ON DELETE SET NULL, -- Optional link to contest

  -- Status & Workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,

  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  og_title TEXT,
  og_description TEXT,

  -- FAQ Schema.org Support
  has_faq BOOLEAN DEFAULT false,
  faq_schema JSONB, -- Auto-generated Schema.org FAQ markup

  -- Analytics
  view_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER, -- Auto-calculated

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_contest ON blog_posts(contest_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

-- ============================================
-- STEP 4: Post-Tag Junction Table
-- ============================================
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag_id);

-- ============================================
-- STEP 5: Media Library (for blog images)
-- ============================================
CREATE TABLE IF NOT EXISTS blog_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- File Info
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  storage_path TEXT UNIQUE NOT NULL, -- Path in Supabase Storage
  public_url TEXT NOT NULL,

  -- Media Type
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes

  -- Image-specific (null for non-images)
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,

  -- Organization
  uploaded_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  folder TEXT DEFAULT 'blog', -- For organizing: 'blog', 'faq', 'featured', etc.

  -- Metadata
  metadata JSONB, -- For additional properties
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_media_folder ON blog_media(folder);
CREATE INDEX IF NOT EXISTS idx_blog_media_uploaded_by ON blog_media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_blog_media_created ON blog_media(created_at DESC);

-- ============================================
-- STEP 6: Blog Post Revisions (for history)
-- ============================================
CREATE TABLE IF NOT EXISTS blog_post_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,

  -- Snapshot of content
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  excerpt TEXT,

  -- Who made the change
  revised_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  revision_note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_post_revisions_post ON blog_post_revisions(post_id, created_at DESC);

-- ============================================
-- TRIGGERS: Updated_at
-- ============================================
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS: Auto-update post counts
-- ============================================

-- Update category post count
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF (TG_OP = 'INSERT' AND NEW.category_id IS NOT NULL AND NEW.status = 'published') THEN
    UPDATE blog_categories
    SET post_count = post_count + 1
    WHERE id = NEW.category_id;
  END IF;

  -- Handle UPDATE (status change or category change)
  IF (TG_OP = 'UPDATE') THEN
    -- Old category (if changed or unpublished)
    IF (OLD.category_id IS NOT NULL AND (OLD.status = 'published' AND NEW.status != 'published' OR OLD.category_id != NEW.category_id)) THEN
      UPDATE blog_categories
      SET post_count = post_count - 1
      WHERE id = OLD.category_id;
    END IF;

    -- New category (if changed or published)
    IF (NEW.category_id IS NOT NULL AND (NEW.status = 'published' AND OLD.status != 'published' OR OLD.category_id != NEW.category_id)) THEN
      UPDATE blog_categories
      SET post_count = post_count + 1
      WHERE id = NEW.category_id;
    END IF;
  END IF;

  -- Handle DELETE
  IF (TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL AND OLD.status = 'published') THEN
    UPDATE blog_categories
    SET post_count = post_count - 1
    WHERE id = OLD.category_id;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_post_count
  AFTER INSERT OR UPDATE OR DELETE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_category_post_count();

-- Update tag post count
CREATE OR REPLACE FUNCTION update_tag_post_count()
RETURNS TRIGGER AS $$
DECLARE
  post_published BOOLEAN;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Check if post is published
    SELECT (status = 'published') INTO post_published
    FROM blog_posts WHERE id = NEW.post_id;

    IF post_published THEN
      UPDATE blog_tags
      SET post_count = post_count + 1
      WHERE id = NEW.tag_id;
    END IF;
    RETURN NEW;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    SELECT (status = 'published') INTO post_published
    FROM blog_posts WHERE id = OLD.post_id;

    IF post_published THEN
      UPDATE blog_tags
      SET post_count = post_count - 1
      WHERE id = OLD.tag_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_post_count
  AFTER INSERT OR DELETE ON blog_post_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_post_count();

-- ============================================
-- TRIGGERS: Auto-create revision on update
-- ============================================
CREATE OR REPLACE FUNCTION create_post_revision()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create revision if content actually changed
  IF (OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title) THEN
    INSERT INTO blog_post_revisions (post_id, title, content, excerpt, revised_by)
    VALUES (OLD.id, OLD.title, OLD.content, OLD.excerpt, NEW.author_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_post_revision
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION create_post_revision();

-- ============================================
-- FUNCTIONS: Calculate read time
-- ============================================
CREATE OR REPLACE FUNCTION calculate_read_time(content_json JSONB)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  words_per_minute INTEGER := 200; -- Average reading speed
BEGIN
  -- Extract text from TipTap JSON and count words
  -- This is a simplified version - adjust based on your content structure
  word_count := (
    SELECT COUNT(*)
    FROM (
      SELECT unnest(string_to_array(
        regexp_replace(
          content_json::text,
          '[^a-zA-Z0-9\s]',
          ' ',
          'g'
        ),
        ' '
      )) AS word
    ) words
    WHERE word != ''
  );

  -- Return read time in minutes (minimum 1 minute)
  RETURN GREATEST(1, ROUND(word_count::DECIMAL / words_per_minute));
END;
$$ LANGUAGE plpgsql;

-- Auto-update read time on content change
CREATE OR REPLACE FUNCTION update_post_read_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.read_time_minutes := calculate_read_time(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_read_time
  BEFORE INSERT OR UPDATE OF content ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_read_time();

-- ============================================
-- FUNCTIONS: Generate slug from title
-- ============================================
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTIONS: Get published posts
-- ============================================
CREATE OR REPLACE FUNCTION get_published_posts(
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0,
  p_category_slug TEXT DEFAULT NULL,
  p_tag_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  category_name TEXT,
  category_slug TEXT,
  author_name TEXT,
  published_at TIMESTAMPTZ,
  read_time_minutes INTEGER,
  view_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id,
    bp.title,
    bp.slug,
    bp.excerpt,
    bp.featured_image_url,
    bc.name as category_name,
    bc.slug as category_slug,
    au.name as author_name,
    bp.published_at,
    bp.read_time_minutes,
    bp.view_count
  FROM blog_posts bp
  LEFT JOIN blog_categories bc ON bp.category_id = bc.id
  LEFT JOIN admin_users au ON bp.author_id = au.id
  LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
  LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
  WHERE bp.status = 'published'
    AND bp.published_at <= NOW()
    AND (p_category_slug IS NULL OR bc.slug = p_category_slug)
    AND (p_tag_slug IS NULL OR bt.slug = p_tag_slug)
  GROUP BY bp.id, bc.name, bc.slug, au.name
  ORDER BY bp.published_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_revisions ENABLE ROW LEVEL SECURITY;

-- Public read access to published content
CREATE POLICY "Public read blog categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Public read blog tags"
  ON blog_tags FOR SELECT
  USING (true);

CREATE POLICY "Public read published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published' AND published_at <= NOW());

CREATE POLICY "Public read post tags"
  ON blog_post_tags FOR SELECT
  USING (true);

CREATE POLICY "Public read published media"
  ON blog_media FOR SELECT
  USING (true);

-- Admin access (handled via service role in API routes)
-- Admins can perform all operations using the service role key

-- ============================================
-- SEED DATA: Default Categories
-- ============================================
INSERT INTO blog_categories (name, slug, description, color, icon, sort_order) VALUES
  ('AI Art Tips', 'ai-art-tips', 'Guides and tutorials for creating better AI art', '#8b5cf6', 'Palette', 1),
  ('Contest Updates', 'contest-updates', 'Weekly contest announcements and winner highlights', '#14b8a6', 'Trophy', 2),
  ('Community Spotlights', 'community-spotlights', 'Featuring outstanding artists and artworks', '#ec4899', 'Users', 3),
  ('FAQ', 'faq', 'Frequently asked questions about AI art and contests', '#f59e0b', 'HelpCircle', 4),
  ('News', 'news', 'Latest updates and announcements', '#3b82f6', 'Newspaper', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE blog_categories IS 'Blog post categories for organization';
COMMENT ON TABLE blog_tags IS 'Blog post tags for cross-referencing';
COMMENT ON TABLE blog_posts IS 'Blog posts with rich TipTap JSON content';
COMMENT ON TABLE blog_post_tags IS 'Many-to-many relationship between posts and tags';
COMMENT ON TABLE blog_media IS 'Media library for blog images and files';
COMMENT ON TABLE blog_post_revisions IS 'Revision history for blog posts';
COMMENT ON FUNCTION calculate_read_time(JSONB) IS 'Calculate estimated read time from TipTap content';
COMMENT ON FUNCTION generate_slug(TEXT) IS 'Generate URL-friendly slug from title';
COMMENT ON FUNCTION get_published_posts(INTEGER, INTEGER, TEXT, TEXT) IS 'Get published blog posts with filters';
