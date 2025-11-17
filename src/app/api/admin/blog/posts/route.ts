import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAdminAction, getAdminUser } from '@/lib/utils/admin-auth';
import type { BlogPostInsert } from '@/types/database';

// GET /api/admin/blog/posts - List all blog posts
export async function GET(request: NextRequest) {
  try {
    await requirePermission('canManageContests'); // Using existing permission for now

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*),
        author:admin_users(id, name, email),
        contest:contests(id, title, week_number, year)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status as 'draft' | 'published' | 'scheduled' | 'archived');
    }
    if (category) {
      query = query.eq('category_id', category);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      throw error;
    }

    // Also get tags for each post
    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const { data: postTags } = await supabase
        .from('blog_post_tags')
        .select('post_id, tag:blog_tags(*)')
        .in('post_id', postIds);

      // Attach tags to posts
      const postsWithTags = posts.map(post => ({
        ...post,
        tags: postTags?.filter(pt => pt.post_id === post.id).map(pt => pt.tag) || []
      }));

      return NextResponse.json({ posts: postsWithTags, count });
    }

    return NextResponse.json({ posts: posts || [], count: 0 });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/admin/blog/posts - Create new blog post
export async function POST(request: NextRequest) {
  try {
    await requirePermission('canManageContests'); // Using existing permission for now

    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      featured_image_alt,
      category_id,
      contest_id,
      status = 'draft',
      published_at,
      scheduled_for,
      meta_title,
      meta_description,
      og_image_url,
      og_title,
      og_description,
      has_faq,
      faq_schema,
      tags = [] // Array of tag IDs
    } = body;

    // Validation
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, content' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if slug is unique
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    // Prepare post data
    const postData: BlogPostInsert = {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      featured_image_alt,
      category_id: category_id || null,
      author_id: adminUser.id,
      contest_id: contest_id || null,
      status,
      published_at: status === 'published' ? (published_at || new Date().toISOString()) : null,
      scheduled_for,
      meta_title,
      meta_description,
      og_image_url,
      og_title,
      og_description,
      has_faq: has_faq || false,
      faq_schema
    };

    // Insert post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tagId: string) => ({
        post_id: post.id,
        tag_id: tagId
      }));

      await supabase
        .from('blog_post_tags')
        .insert(tagInserts);
    }

    // Log action
    await logAdminAction({
      action: 'create_blog_post',
      resourceType: 'blog_post',
      resourceId: post.id,
      changes: { title, slug, status },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
