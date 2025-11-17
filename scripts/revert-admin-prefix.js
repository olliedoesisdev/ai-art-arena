#!/usr/bin/env node

/**
 * Revert admin.table_name back to table_name
 * Supabase TypeScript client doesn't support schema prefixes in from()
 * RLS policies will handle access control instead
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  // Revert blog tables
  { from: /\.from\(['"`]admin\.blog_posts['"`]\)/g, to: ".from('blog_posts')" },
  { from: /\.from\(['"`]admin\.blog_categories['"`]\)/g, to: ".from('blog_categories')" },
  { from: /\.from\(['"`]admin\.blog_tags['"`]\)/g, to: ".from('blog_tags')" },
  { from: /\.from\(['"`]admin\.blog_post_tags['"`]\)/g, to: ".from('blog_post_tags')" },
  { from: /\.from\(['"`]admin\.blog_media['"`]\)/g, to: ".from('blog_media')" },
  { from: /\.from\(['"`]admin\.blog_post_revisions['"`]\)/g, to: ".from('blog_post_revisions')" },

  // Revert admin users table
  { from: /\.from\(['"`]admin\.users['"`]\)/g, to: ".from('admin_users')" },

  // Revert foreign key references
  { from: /author:admin\.users/g, to: "author:admin_users" },
  { from: /category:admin\.blog_categories/g, to: "category:blog_categories" },
  { from: /tag:admin\.blog_tags/g, to: "tag:blog_tags" },
];

const filesToUpdate = [
  // API routes
  'src/app/api/admin/blog/posts/route.ts',
  'src/app/api/admin/blog/posts/[id]/route.ts',
  'src/app/api/admin/blog/media/route.ts',
  'src/app/api/admin/blog/tags/route.ts',
  'src/app/api/admin/blog/categories/route.ts',

  // Admin pages
  'src/app/admin/blog/diagnostic/page.tsx',
  'src/app/admin/blog/new/page.tsx',
  'src/app/admin/blog/[id]/page.tsx',
  'src/app/admin/blog/categories/page.tsx',
  'src/app/admin/blog/page.tsx',

  // Public blog pages
  'src/app/blog/page.tsx',
  'src/app/blog/[slug]/page.tsx',
  'src/app/blog/category/[slug]/page.tsx',
];

let totalChanges = 0;
let filesModified = 0;

console.log('🔄 Reverting schema prefixes...\n');
console.log('ℹ️  Note: RLS policies will handle security instead of schema separation\n');

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileChanges = 0;

  replacements.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      fileChanges += matches.length;
    }
  });

  if (fileChanges > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath} (${fileChanges} changes)`);
    filesModified++;
    totalChanges += fileChanges;
  } else {
    console.log(`   ${filePath} (no changes needed)`);
  }
});

console.log(`\n✨ Revert complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n📋 Important:`);
console.log(`   - Tables are in public schema but with RLS policies`);
console.log(`   - RLS ensures only admins can access admin/blog tables`);
console.log(`   - This approach works with Supabase TypeScript client`);
