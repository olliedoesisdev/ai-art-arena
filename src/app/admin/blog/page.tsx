import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ProtectedLayout from '@/components/admin/ProtectedLayout';
import BlogPostList from '@/components/admin/BlogPostList';
import type { BlogPostWithRelations } from '@/types/database';

async function getBlogPosts(): Promise<BlogPostWithRelations[]> {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:admin_users(id, name, email)
    `)
    .order('created_at', { ascending: false });

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

    // Attach tags to posts
    return posts.map(post => ({
      ...post,
      tags: postTags?.filter(pt => pt.post_id === post.id).map(pt => pt.tag) || []
    })) as BlogPostWithRelations[];
  }

  return (posts || []) as BlogPostWithRelations[];
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
            <p className="text-slate-400 mt-2">Manage your blog content</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/blog/categories"
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              New Post
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <div className="text-sm text-slate-400">Total Posts</div>
            <div className="text-3xl font-bold text-white mt-2">{posts.length}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <div className="text-sm text-slate-400">Published</div>
            <div className="text-3xl font-bold text-green-400 mt-2">
              {posts.filter(p => p.status === 'published').length}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <div className="text-sm text-slate-400">Drafts</div>
            <div className="text-3xl font-bold text-yellow-400 mt-2">
              {posts.filter(p => p.status === 'draft').length}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <div className="text-sm text-slate-400">Scheduled</div>
            <div className="text-3xl font-bold text-blue-400 mt-2">
              {posts.filter(p => p.status === 'scheduled').length}
            </div>
          </div>
        </div>

        {/* Post List */}
        <BlogPostList posts={posts} />
      </div>
    </ProtectedLayout>
  );
}
