-- =============================================
-- Create Admin Schema and Tables
-- Private schema for admin-only data
-- =============================================

BEGIN;

-- Create admin schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS admin;

-- =============================================
-- Admin Users Table
-- =============================================
CREATE TABLE IF NOT EXISTS admin.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'editor')),
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Blog Categories Table
-- =============================================
CREATE TABLE IF NOT EXISTS admin.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  icon text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Blog Tags Table
-- =============================================
CREATE TABLE IF NOT EXISTS admin.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  usage_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Blog Posts Table
-- =============================================
CREATE TABLE IF NOT EXISTS admin.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  author_id uuid REFERENCES admin.users(id) ON DELETE SET NULL,
  category_id uuid REFERENCES admin.blog_categories(id) ON DELETE SET NULL,
  contest_id uuid REFERENCES public.contests(id) ON DELETE SET NULL,

  -- Status and publishing
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at timestamptz,
  scheduled_for timestamptz,

  -- SEO fields
  seo_title text,
  seo_description text,
  og_image text,

  -- Engagement metrics
  view_count int DEFAULT 0,
  like_count int DEFAULT 0,
  comment_count int DEFAULT 0,

  -- Settings
  allow_comments boolean DEFAULT true,
  is_featured boolean DEFAULT false,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Blog Post Tags (Junction Table)
-- =============================================
CREATE TABLE IF NOT EXISTS admin.blog_post_tags (
  blog_post_id uuid REFERENCES admin.blog_posts(id) ON DELETE CASCADE,
  blog_tag_id uuid REFERENCES admin.blog_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blog_post_id, blog_tag_id)
);

-- =============================================
-- Blog Media Table
-- =============================================
CREATE TABLE IF NOT EXISTS admin.blog_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES admin.blog_posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
  filename text NOT NULL,
  size_bytes bigint,
  mime_type text,
  width int,
  height int,
  alt_text text,
  caption text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- Blog Post Revisions Table
-- =============================================
CREATE TABLE IF NOT EXISTS admin.blog_post_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES admin.blog_posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  revision_number int NOT NULL,
  created_by uuid REFERENCES admin.users(id) ON DELETE SET NULL,
  change_summary text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin.users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin.users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin.users(is_active);

-- Blog categories indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON admin.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_is_active ON admin.blog_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_categories_sort_order ON admin.blog_categories(sort_order);

-- Blog tags indexes
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON admin.blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_usage_count ON admin.blog_tags(usage_count DESC);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON admin.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON admin.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON admin.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON admin.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_contest_id ON admin.blog_posts(contest_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON admin.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_featured ON admin.blog_posts(is_featured);

-- Blog post tags indexes
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_blog_post_id ON admin.blog_post_tags(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_blog_tag_id ON admin.blog_post_tags(blog_tag_id);

-- Blog media indexes
CREATE INDEX IF NOT EXISTS idx_blog_media_blog_post_id ON admin.blog_media(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_media_type ON admin.blog_media(type);

-- Blog revisions indexes
CREATE INDEX IF NOT EXISTS idx_blog_post_revisions_blog_post_id ON admin.blog_post_revisions(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_revisions_created_at ON admin.blog_post_revisions(created_at DESC);

-- =============================================
-- Update Triggers
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION admin.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin.users
  FOR EACH ROW
  EXECUTE FUNCTION admin.update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON admin.blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION admin.update_updated_at_column();

CREATE TRIGGER update_blog_tags_updated_at
  BEFORE UPDATE ON admin.blog_tags
  FOR EACH ROW
  EXECUTE FUNCTION admin.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON admin.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION admin.update_updated_at_column();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS on all admin tables
ALTER TABLE admin.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.blog_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.blog_post_revisions ENABLE ROW LEVEL SECURITY;

-- Create policies (only authenticated admin users can access)
-- You'll need to customize these based on your admin auth logic

-- Admin users can read their own data
CREATE POLICY admin_users_select_policy ON admin.users
  FOR SELECT
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM admin.users WHERE id = auth.uid() AND is_active = true
  ));

-- Super admins can manage users
CREATE POLICY admin_users_manage_policy ON admin.users
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin.users
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  ));

-- Admin users can read all blog data
CREATE POLICY blog_categories_select_policy ON admin.blog_categories
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin.users WHERE id = auth.uid() AND is_active = true
  ));

CREATE POLICY blog_tags_select_policy ON admin.blog_tags
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin.users WHERE id = auth.uid() AND is_active = true
  ));

CREATE POLICY blog_posts_select_policy ON admin.blog_posts
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin.users WHERE id = auth.uid() AND is_active = true
  ));

-- Admins and editors can manage blog content
CREATE POLICY blog_content_manage_policy ON admin.blog_posts
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'editor')
    AND is_active = true
  ));

-- Similar policies for other blog tables
CREATE POLICY blog_categories_manage_policy ON admin.blog_categories
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'editor')
    AND is_active = true
  ));

CREATE POLICY blog_tags_manage_policy ON admin.blog_tags
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'editor')
    AND is_active = true
  ));

CREATE POLICY blog_post_tags_manage_policy ON admin.blog_post_tags
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'editor')
    AND is_active = true
  ));

CREATE POLICY blog_media_manage_policy ON admin.blog_media
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'editor')
    AND is_active = true
  ));

CREATE POLICY blog_revisions_manage_policy ON admin.blog_post_revisions
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'editor')
    AND is_active = true
  ));

-- =============================================
-- Grant Permissions
-- =============================================

-- Grant schema usage to authenticated users
GRANT USAGE ON SCHEMA admin TO authenticated;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA admin TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA admin TO authenticated;

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Admin schema and tables created successfully!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - admin.users';
  RAISE NOTICE '  - admin.blog_categories';
  RAISE NOTICE '  - admin.blog_tags';
  RAISE NOTICE '  - admin.blog_posts';
  RAISE NOTICE '  - admin.blog_post_tags';
  RAISE NOTICE '  - admin.blog_media';
  RAISE NOTICE '  - admin.blog_post_revisions';
END $$;
