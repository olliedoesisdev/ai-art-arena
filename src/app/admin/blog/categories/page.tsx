import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProtectedLayout from '@/components/admin/ProtectedLayout';
import { Badge } from '@/components/ui/Badge';
import type { BlogCategoryRow } from '@/types/database';

async function getCategories(): Promise<BlogCategoryRow[]> {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories || [];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <h1 className="text-3xl font-bold text-white">Blog Categories</h1>
          <p className="text-slate-400 mt-2">Manage post categories and organization</p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-12 text-center">
            <p className="text-slate-400">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge
                    variant="default"
                    style={{ backgroundColor: category.color }}
                    className="text-lg px-4 py-2"
                  >
                    {category.name}
                  </Badge>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {category.post_count}
                    </div>
                    <div className="text-xs text-slate-500">posts</div>
                  </div>
                </div>

                {category.description && (
                  <p className="text-slate-400 text-sm mb-4">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Slug: {category.slug}</span>
                  <span>Order: {category.sort_order}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Managing Categories</h3>
          <p className="text-slate-300 mb-4">
            Categories are currently managed via the database. To add or edit categories,
            use the Supabase SQL Editor or API.
          </p>

          <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">Example: Add new category</p>
            <pre className="text-xs text-slate-300 overflow-x-auto">
{`INSERT INTO blog_categories (name, slug, description, color, icon, sort_order)
VALUES (
  'Tutorials',
  'tutorials',
  'Step-by-step guides for AI art',
  '#10b981',
  'BookOpen',
  6
);`}
            </pre>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
