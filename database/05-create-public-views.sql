-- =============================================
-- Create Public Views for Admin Blog Tables
-- =============================================
-- This allows Supabase JS client to access admin.blog_*
-- tables as if they were in the public schema

BEGIN;

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.blog_posts CASCADE;
DROP VIEW IF EXISTS public.blog_categories CASCADE;
DROP VIEW IF EXISTS public.blog_tags CASCADE;
DROP VIEW IF EXISTS public.blog_post_tags CASCADE;
DROP VIEW IF EXISTS public.blog_media CASCADE;
DROP VIEW IF EXISTS public.blog_post_revisions CASCADE;
DROP VIEW IF EXISTS public.admin_users CASCADE;

-- =============================================
-- Admin Users View
-- =============================================
CREATE VIEW public.admin_users AS
SELECT * FROM admin.users;

-- =============================================
-- Blog Categories View
-- =============================================
CREATE VIEW public.blog_categories AS
SELECT * FROM admin.blog_categories;

-- =============================================
-- Blog Tags View
-- =============================================
CREATE VIEW public.blog_tags AS
SELECT * FROM admin.blog_tags;

-- =============================================
-- Blog Posts View
-- =============================================
CREATE VIEW public.blog_posts AS
SELECT * FROM admin.blog_posts;

-- =============================================
-- Blog Post Tags View
-- =============================================
CREATE VIEW public.blog_post_tags AS
SELECT * FROM admin.blog_post_tags;

-- =============================================
-- Blog Media View
-- =============================================
CREATE VIEW public.blog_media AS
SELECT * FROM admin.blog_media;

-- =============================================
-- Blog Post Revisions View
-- =============================================
CREATE VIEW public.blog_post_revisions AS
SELECT * FROM admin.blog_post_revisions;

-- =============================================
-- Enable RLS on Views (inherit from admin tables)
-- =============================================
ALTER VIEW public.admin_users SET (security_invoker = on);
ALTER VIEW public.blog_categories SET (security_invoker = on);
ALTER VIEW public.blog_tags SET (security_invoker = on);
ALTER VIEW public.blog_posts SET (security_invoker = on);
ALTER VIEW public.blog_post_tags SET (security_invoker = on);
ALTER VIEW public.blog_media SET (security_invoker = on);
ALTER VIEW public.blog_post_revisions SET (security_invoker = on);

-- =============================================
-- Grant Permissions
-- =============================================
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT ON public.blog_categories TO authenticated;
GRANT SELECT ON public.blog_tags TO authenticated;
GRANT SELECT ON public.blog_posts TO authenticated;
GRANT SELECT ON public.blog_post_tags TO authenticated;
GRANT SELECT ON public.blog_media TO authenticated;
GRANT SELECT ON public.blog_post_revisions TO authenticated;

-- =============================================
-- Create INSTEAD OF Triggers for INSERT/UPDATE/DELETE
-- =============================================

-- Function to handle blog_categories operations
CREATE OR REPLACE FUNCTION public.blog_categories_instead_of()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin.blog_categories VALUES (NEW.*);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE admin.blog_categories SET
      name = NEW.name,
      slug = NEW.slug,
      description = NEW.description,
      color = NEW.color,
      icon = NEW.icon,
      sort_order = NEW.sort_order,
      is_active = NEW.is_active,
      updated_at = NEW.updated_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM admin.blog_categories WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_categories_instead_of_trigger
INSTEAD OF INSERT OR UPDATE OR DELETE ON public.blog_categories
FOR EACH ROW EXECUTE FUNCTION public.blog_categories_instead_of();

-- Function to handle blog_tags operations
CREATE OR REPLACE FUNCTION public.blog_tags_instead_of()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin.blog_tags VALUES (NEW.*);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE admin.blog_tags SET
      name = NEW.name,
      slug = NEW.slug,
      description = NEW.description,
      usage_count = NEW.usage_count,
      updated_at = NEW.updated_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM admin.blog_tags WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_tags_instead_of_trigger
INSTEAD OF INSERT OR UPDATE OR DELETE ON public.blog_tags
FOR EACH ROW EXECUTE FUNCTION public.blog_tags_instead_of();

-- Function to handle blog_posts operations
CREATE OR REPLACE FUNCTION public.blog_posts_instead_of()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin.blog_posts VALUES (NEW.*);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE admin.blog_posts SET
      title = NEW.title,
      slug = NEW.slug,
      excerpt = NEW.excerpt,
      content = NEW.content,
      featured_image = NEW.featured_image,
      author_id = NEW.author_id,
      category_id = NEW.category_id,
      contest_id = NEW.contest_id,
      status = NEW.status,
      published_at = NEW.published_at,
      scheduled_for = NEW.scheduled_for,
      seo_title = NEW.seo_title,
      seo_description = NEW.seo_description,
      og_image = NEW.og_image,
      view_count = NEW.view_count,
      like_count = NEW.like_count,
      comment_count = NEW.comment_count,
      allow_comments = NEW.allow_comments,
      is_featured = NEW.is_featured,
      updated_at = NEW.updated_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM admin.blog_posts WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_instead_of_trigger
INSTEAD OF INSERT OR UPDATE OR DELETE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.blog_posts_instead_of();

-- Function to handle blog_post_tags operations
CREATE OR REPLACE FUNCTION public.blog_post_tags_instead_of()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin.blog_post_tags VALUES (NEW.*);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Junction table doesn't typically update
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM admin.blog_post_tags
    WHERE blog_post_id = OLD.blog_post_id
      AND blog_tag_id = OLD.blog_tag_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_post_tags_instead_of_trigger
INSTEAD OF INSERT OR UPDATE OR DELETE ON public.blog_post_tags
FOR EACH ROW EXECUTE FUNCTION public.blog_post_tags_instead_of();

-- Function to handle blog_media operations
CREATE OR REPLACE FUNCTION public.blog_media_instead_of()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin.blog_media VALUES (NEW.*);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE admin.blog_media SET
      blog_post_id = NEW.blog_post_id,
      url = NEW.url,
      type = NEW.type,
      filename = NEW.filename,
      size_bytes = NEW.size_bytes,
      mime_type = NEW.mime_type,
      width = NEW.width,
      height = NEW.height,
      alt_text = NEW.alt_text,
      caption = NEW.caption,
      sort_order = NEW.sort_order
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM admin.blog_media WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_media_instead_of_trigger
INSTEAD OF INSERT OR UPDATE OR DELETE ON public.blog_media
FOR EACH ROW EXECUTE FUNCTION public.blog_media_instead_of();

-- Function to handle blog_post_revisions operations
CREATE OR REPLACE FUNCTION public.blog_post_revisions_instead_of()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin.blog_post_revisions VALUES (NEW.*);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE admin.blog_post_revisions SET
      blog_post_id = NEW.blog_post_id,
      title = NEW.title,
      content = NEW.content,
      excerpt = NEW.excerpt,
      revision_number = NEW.revision_number,
      created_by = NEW.created_by,
      change_summary = NEW.change_summary
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM admin.blog_post_revisions WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_post_revisions_instead_of_trigger
INSTEAD OF INSERT OR UPDATE OR DELETE ON public.blog_post_revisions
FOR EACH ROW EXECUTE FUNCTION public.blog_post_revisions_instead_of();

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Public views created successfully!';
  RAISE NOTICE 'Views created:';
  RAISE NOTICE '  - public.blog_posts → admin.blog_posts';
  RAISE NOTICE '  - public.blog_categories → admin.blog_categories';
  RAISE NOTICE '  - public.blog_tags → admin.blog_tags';
  RAISE NOTICE '  - public.blog_post_tags → admin.blog_post_tags';
  RAISE NOTICE '  - public.blog_media → admin.blog_media';
  RAISE NOTICE '  - public.blog_post_revisions → admin.blog_post_revisions';
  RAISE NOTICE '  - public.admin_users → admin.users';
  RAISE NOTICE '';
  RAISE NOTICE 'INSTEAD OF triggers created for INSERT/UPDATE/DELETE operations';
  RAISE NOTICE 'Application can now use public.blog_* as normal tables!';
END $$;
