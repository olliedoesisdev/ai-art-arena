import ProtectedLayout from '@/components/admin/ProtectedLayout';
import BlogPostForm from '@/components/admin/BlogPostForm';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { BlogPostRow } from '@/types/database';

async function getPost(id: string): Promise<BlogPostRow | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    return null;
  }

  return post as BlogPostRow;
}

async function getFormData() {
  const supabase = await createClient();

  const [categoriesResult, tagsResult, contestsResult] = await Promise.all([
    supabase.from('blog_categories').select('*').order('sort_order'),
    supabase.from('blog_tags').select('*').order('name'),
    supabase.from('contests').select('*').order('year', { ascending: false }).order('week_number', { ascending: false })
  ]);

  return {
    categories: categoriesResult.data || [],
    tags: tagsResult.data || [],
    contests: contestsResult.data || []
  };
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, formData] = await Promise.all([
    getPost(id),
    getFormData()
  ]);

  if (!post) {
    notFound();
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Post</h1>
          <p className="text-slate-400 mt-2">Update your blog content</p>
        </div>

        <BlogPostForm
          post={post}
          categories={formData.categories}
          tags={formData.tags}
          contests={formData.contests}
        />
      </div>
    </ProtectedLayout>
  );
}
