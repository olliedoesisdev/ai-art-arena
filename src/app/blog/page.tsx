import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { BlogPostWithRelations, BlogCategoryRow } from '@/types/database';

async function getBlogPosts(): Promise<BlogPostWithRelations[]> {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:admin_users(id, name)
    `)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  // Get tags for each post
  if (posts && posts.length > 0) {
    const postIds = posts.map(p => p.id);
    const { data: postTags } = await supabase
      .from('blog_post_tags')
      .select('post_id, tag:blog_tags(*)')
      .in('post_id', postIds);

    return posts.map(post => ({
      ...post,
      tags: postTags?.filter(pt => pt.post_id === post.id).map(pt => pt.tag) || []
    })) as BlogPostWithRelations[];
  }

  return (posts || []) as BlogPostWithRelations[];
}

async function getCategories(): Promise<BlogCategoryRow[]> {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('blog_categories')
    .select('*')
    .gt('post_count', 0)
    .order('sort_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories || [];
}

export const metadata = {
  title: 'Blog - AI Art Arena',
  description: 'Explore AI art tips, contest updates, and community spotlights from the AI Art Arena.',
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI Art Arena Blog
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl">
            Discover tips, tutorials, and insights about creating amazing AI-generated art
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <Link
                        key={category.id}
                        href={`/blog/category/${category.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
                      >
                        <span className="text-slate-300 group-hover:text-white transition-colors">
                          {category.name}
                        </span>
                        <Badge
                          variant="default"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.post_count}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {posts.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-12 text-center">
                <p className="text-slate-400 text-lg">No blog posts yet. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map(post => (
                  <article
                    key={post.id}
                    className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors group"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Featured Image */}
                      {post.featured_image_url && (
                        <div className="md:col-span-1">
                          <Link href={`/blog/${post.slug}`}>
                            <img
                              src={post.featured_image_url}
                              alt={post.featured_image_alt || post.title}
                              className="w-full h-full object-cover min-h-[200px]"
                            />
                          </Link>
                        </div>
                      )}

                      {/* Content */}
                      <div className={`p-6 ${post.featured_image_url ? 'md:col-span-2' : 'md:col-span-3'}`}>
                        {/* Category Badge */}
                        {post.category && (
                          <Link href={`/blog/category/${post.category.slug}`}>
                            <Badge
                              variant="default"
                              style={{ backgroundColor: post.category.color }}
                              className="mb-3"
                            >
                              {post.category.name}
                            </Badge>
                          </Link>
                        )}

                        {/* Title */}
                        <Link href={`/blog/${post.slug}`}>
                          <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                            {post.title}
                          </h2>
                        </Link>

                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-slate-400 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                          {post.published_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(post.published_at), 'MMM d, yyyy')}
                            </div>
                          )}
                          {post.read_time_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.read_time_minutes} min read
                            </div>
                          )}
                          {post.author && (
                            <div>
                              By {post.author.name}
                            </div>
                          )}
                        </div>

                        {/* Read More Link */}
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          Read more
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
