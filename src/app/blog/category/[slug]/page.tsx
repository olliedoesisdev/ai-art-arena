import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { BlogPostWithRelations, BlogCategoryRow } from '@/types/database';
import type { Metadata } from 'next';

async function getCategory(slug: string): Promise<BlogCategoryRow | null> {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !category) {
    return null;
  }

  return category as BlogCategoryRow;
}

async function getCategoryPosts(categoryId: string): Promise<BlogPostWithRelations[]> {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:admin_users(id, name)
    `)
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return (posts || []) as BlogPostWithRelations[];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - AI Art Arena Blog`,
    description: category.description || `Browse all posts in the ${category.name} category`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const posts = await getCategoryPosts(category.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="flex items-start gap-4 mb-4">
            <Badge
              variant="default"
              style={{ backgroundColor: category.color }}
              className="text-lg px-4 py-2"
            >
              {category.name}
            </Badge>
          </div>

          {category.description && (
            <p className="text-xl text-slate-400 max-w-3xl">
              {category.description}
            </p>
          )}

          <p className="text-slate-500 mt-4">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-12 text-center">
            <p className="text-slate-400 text-lg">No posts in this category yet.</p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse all posts
            </Link>
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
      </div>
    </div>
  );
}
