-- =============================================
-- Seed Admin Data
-- Initial data for blog categories and tags
-- =============================================

BEGIN;

-- =============================================
-- Blog Categories
-- =============================================
INSERT INTO admin.blog_categories (name, slug, description, color, icon, sort_order) VALUES
  ('AI Art Techniques', 'ai-art-techniques', 'Learn about different AI art generation methods and techniques', '#8b5cf6', '🎨', 1),
  ('Contest Highlights', 'contest-highlights', 'Weekly contest winners and notable submissions', '#f59e0b', '🏆', 2),
  ('Artist Spotlights', 'artist-spotlights', 'Featuring talented AI artists from our community', '#ec4899', '✨', 3),
  ('Tutorials', 'tutorials', 'Step-by-step guides for creating AI art', '#3b82f6', '📚', 4),
  ('News & Updates', 'news-updates', 'Latest news and platform updates', '#10b981', '📰', 5),
  ('Community Stories', 'community-stories', 'Stories and experiences from our community', '#6366f1', '👥', 6),
  ('Behind the Scenes', 'behind-the-scenes', 'How we build and run AI Art Arena', '#ef4444', '🎬', 7)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- Blog Tags
-- =============================================
INSERT INTO admin.blog_tags (name, slug, description) VALUES
  ('Midjourney', 'midjourney', 'Content related to Midjourney AI'),
  ('DALL-E', 'dall-e', 'Content related to DALL-E'),
  ('Stable Diffusion', 'stable-diffusion', 'Content related to Stable Diffusion'),
  ('AI Tools', 'ai-tools', 'AI art generation tools and software'),
  ('Prompting', 'prompting', 'Prompt engineering and tips'),
  ('Weekly Winners', 'weekly-winners', 'Contest winner announcements'),
  ('Beginner Guide', 'beginner-guide', 'Guides for beginners'),
  ('Advanced Techniques', 'advanced-techniques', 'Advanced AI art techniques'),
  ('Style Transfer', 'style-transfer', 'Style transfer techniques'),
  ('Image-to-Image', 'image-to-image', 'Image-to-image generation'),
  ('Text-to-Image', 'text-to-image', 'Text-to-image generation'),
  ('Digital Art', 'digital-art', 'Digital art topics'),
  ('Photography', 'photography', 'AI photography'),
  ('Illustration', 'illustration', 'AI illustration'),
  ('Abstract', 'abstract', 'Abstract AI art'),
  ('Realism', 'realism', 'Realistic AI art'),
  ('Fantasy', 'fantasy', 'Fantasy-themed AI art'),
  ('Sci-Fi', 'sci-fi', 'Science fiction AI art'),
  ('Landscape', 'landscape', 'AI landscape art'),
  ('Portrait', 'portrait', 'AI portrait art'),
  ('Animation', 'animation', 'AI animation'),
  ('Video', 'video', 'AI video generation'),
  ('Tips & Tricks', 'tips-tricks', 'Helpful tips and tricks'),
  ('Inspiration', 'inspiration', 'Creative inspiration'),
  ('Community', 'community', 'Community-related content')
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Admin data seeded successfully!';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 7 blog categories';
  RAISE NOTICE '  - 25 blog tags';
END $$;
