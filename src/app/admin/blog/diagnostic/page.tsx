import { createClient } from '@/lib/supabase/server';
import ProtectedLayout from '@/components/admin/ProtectedLayout';
import { Check, X, AlertCircle } from 'lucide-react';

async function runDiagnostics() {
  const supabase = await createClient();
  const results: any = {
    database: {},
    api: {},
    features: {}
  };

  // Check 1: Database tables
  try {
    const tables = ['blog_posts', 'blog_categories', 'blog_tags', 'blog_post_tags', 'blog_media', 'blog_post_revisions'] as const;
    for (const table of tables) {
      const { error } = await supabase.from(table as any).select('id').limit(1);
      results.database[table] = !error;
    }
  } catch (error) {
    results.database.error = 'Failed to check tables';
  }

  // Check 2: Categories seeded
  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('sort_order');

    results.database.categories_seeded = !error && data && data.length >= 5;
    results.database.category_count = data?.length || 0;
    results.database.categories = data || [];
  } catch (error) {
    results.database.categories_seeded = false;
  }

  // Check 3: Admin users exist
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    results.database.admin_users = !error && data && data.length > 0;
  } catch (error) {
    results.database.admin_users = false;
  }

  // Check 4: Sample data counts
  try {
    const [posts, tags, media] = await Promise.all([
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('blog_tags').select('id', { count: 'exact', head: true }),
      supabase.from('blog_media').select('id', { count: 'exact', head: true })
    ]);

    results.database.post_count = posts.count || 0;
    results.database.tag_count = tags.count || 0;
    results.database.media_count = media.count || 0;
  } catch (error) {
    results.database.counts_error = true;
  }

  return results;
}

export default async function DiagnosticPage() {
  const diagnostics = await runDiagnostics();

  const StatusIcon = ({ status }: { status: boolean }) =>
    status ? (
      <Check className="w-5 h-5 text-green-400" />
    ) : (
      <X className="w-5 h-5 text-red-400" />
    );

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog System Diagnostics</h1>
          <p className="text-slate-400 mt-2">Phase 1 Feature Status Check</p>
        </div>

        {/* Database Checks */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Database Schema</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">blog_posts table</span>
              <StatusIcon status={diagnostics.database.blog_posts} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">blog_categories table</span>
              <StatusIcon status={diagnostics.database.blog_categories} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">blog_tags table</span>
              <StatusIcon status={diagnostics.database.blog_tags} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">blog_post_tags table</span>
              <StatusIcon status={diagnostics.database.blog_post_tags} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">blog_media table</span>
              <StatusIcon status={diagnostics.database.blog_media} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-300">blog_post_revisions table</span>
              <StatusIcon status={diagnostics.database.blog_post_revisions} />
            </div>
          </div>
        </div>

        {/* Seed Data */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Seed Data</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">Default categories seeded (5+)</span>
              <StatusIcon status={diagnostics.database.categories_seeded} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">Admin users exist</span>
              <StatusIcon status={diagnostics.database.admin_users} />
            </div>
          </div>

          {diagnostics.database.categories && diagnostics.database.categories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <h3 className="text-sm font-semibold text-white mb-3">Available Categories:</h3>
              <div className="flex flex-wrap gap-2">
                {diagnostics.database.categories.map((cat: any) => (
                  <div
                    key={cat.id}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Counts */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Data</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
              <div className="text-sm text-slate-400">Blog Posts</div>
              <div className="text-3xl font-bold text-white mt-2">
                {diagnostics.database.post_count || 0}
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
              <div className="text-sm text-slate-400">Tags</div>
              <div className="text-3xl font-bold text-white mt-2">
                {diagnostics.database.tag_count || 0}
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
              <div className="text-sm text-slate-400">Media Files</div>
              <div className="text-3xl font-bold text-white mt-2">
                {diagnostics.database.media_count || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Status */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Phase 1 Features</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3 py-3 border-b border-slate-700">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white font-medium">Auto-Save</div>
                <div className="text-sm text-slate-400">
                  Saves drafts every 30 seconds • Recovery on page reload
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Location: /admin/blog/new
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-3 border-b border-slate-700">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white font-medium">Live Preview</div>
                <div className="text-sm text-slate-400">
                  Side-by-side editor and preview • Real-time updates
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Click "Show Preview" button in editor
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white font-medium">Image Upload</div>
                <div className="text-sm text-slate-400">
                  Drag & drop image upload • Progress indicator
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Click Upload button (cloud icon) in editor toolbar
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Checks Required */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-2">Manual Checks Required</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    <strong>Storage Bucket:</strong> Verify <code className="bg-slate-800 px-1.5 py-0.5 rounded">blog-media</code> bucket exists in Supabase Storage and is set to Public
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    <strong>Storage Policies:</strong> Check that upload/read policies are configured
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    <strong>Browser Testing:</strong> Test auto-save in browser localStorage (DevTools → Application → Local Storage)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Next Steps</h2>

          <ol className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="font-semibold text-white">1.</span>
              <span>
                If any tables show ❌, run the migration:
                <code className="block bg-slate-950 px-3 py-2 rounded mt-2 text-sm">
                  supabase-blog-schema.sql
                </code>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-white">2.</span>
              <span>Create Storage bucket if needed (Supabase Dashboard → Storage → New Bucket → "blog-media")</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-white">3.</span>
              <span>
                Run full test suite:
                <code className="block bg-slate-950 px-3 py-2 rounded mt-2 text-sm">
                  See BLOG-PHASE1-DIAGNOSTIC.md
                </code>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-white">4.</span>
              <span>Test each feature at <a href="/admin/blog/new" className="text-primary hover:underline">/admin/blog/new</a></span>
            </li>
          </ol>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <a
            href="/admin/blog/new"
            className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium text-center transition-colors"
          >
            Test New Post Creation
          </a>
          <a
            href="/admin/blog"
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium text-center transition-colors"
          >
            View Blog Posts
          </a>
        </div>
      </div>
    </ProtectedLayout>
  );
}
