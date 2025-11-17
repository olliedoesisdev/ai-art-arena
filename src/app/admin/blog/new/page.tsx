import ProtectedLayout from '@/components/admin/ProtectedLayout';
import BlogPostForm from '@/components/admin/BlogPostForm';
import { createClient } from '@/lib/supabase/server';

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

export default async function NewBlogPostPage() {
  const { categories, tags, contests } = await getFormData();

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Post</h1>
          <p className="text-slate-400 mt-2">Write and publish your blog content</p>
        </div>

        <BlogPostForm
          categories={categories}
          tags={tags}
          contests={contests}
        />
      </div>
    </ProtectedLayout>
  );
}
