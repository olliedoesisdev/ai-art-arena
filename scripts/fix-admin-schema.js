#!/usr/bin/env node

/**
 * Script to update all blog table references from public schema to admin schema
 *
 * Changes:
 * - from('blog_posts') → from('admin.blog_posts')
 * - from('blog_categories') → from('admin.blog_categories')
 * - from('blog_tags') → from('admin.blog_tags')
 * - from('blog_post_tags') → from('admin.blog_post_tags')
 * - from('blog_media') → from('admin.blog_media')
 * - from('blog_post_revisions') → from('admin.blog_post_revisions')
 * - admin_users → admin.users
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  // Blog tables
  { from: /\.from\(['"`]blog_posts['"`]\)/g, to: ".from('admin.blog_posts')" },
  { from: /\.from\(['"`]blog_categories['"`]\)/g, to: ".from('admin.blog_categories')" },
  { from: /\.from\(['"`]blog_tags['"`]\)/g, to: ".from('admin.blog_tags')" },
  { from: /\.from\(['"`]blog_post_tags['"`]\)/g, to: ".from('admin.blog_post_tags')" },
  { from: /\.from\(['"`]blog_media['"`]\)/g, to: ".from('admin.blog_media')" },
  { from: /\.from\(['"`]blog_post_revisions['"`]\)/g, to: ".from('admin.blog_post_revisions')" },

  // Admin users table
  { from: /\.from\(['"`]admin_users['"`]\)/g, to: ".from('admin.users')" },

  // Foreign key references in select statements
  { from: /author:admin_users/g, to: "author:admin.users" },
  { from: /category:blog_categories/g, to: "category:admin.blog_categories" },
  { from: /tag:blog_tags/g, to: "tag:admin.blog_tags" },
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

console.log('🔧 Starting schema migration fix...\n');

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

console.log(`\n✨ Migration complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Review the changes with: git diff`);
console.log(`   2. Test locally: npm run dev`);
console.log(`   3. If good, commit: git add . && git commit -m "Update blog schema to use admin namespace"`);
