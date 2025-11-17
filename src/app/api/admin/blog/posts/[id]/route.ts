import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAdminAction, getAdminUser } from '@/lib/utils/admin-auth';
import type { BlogPostUpdate } from '@/types/database';

// GET /api/admin/blog/posts/[id] - Get single blog post
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('canManageContests');

    const { id } = await params;
    const supabase = await createClient();

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*),
        author:admin_users(id, name, email),
        contest:contests(id, title, week_number, year)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get tags
    const { data: postTags } = await supabase
      .from('blog_post_tags')
      .select('tag:blog_tags(*)')
      .eq('post_id', id);

    const postWithTags = {
      ...post,
      tags: postTags?.map(pt => pt.tag) || []
    };

    return NextResponse.json({ post: postWithTags });
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// PUT /api/admin/blog/posts/[id] - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('canManageContests');

    const { id } = await params;
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
      status,
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

    const supabase = await createClient();

    // Check if post exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // If slug changed, check uniqueness
    if (slug && slug !== existingPost.slug) {
      const { data: slugExists } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (slugExists) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: BlogPostUpdate = {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      featured_image_alt,
      category_id: category_id === undefined ? existingPost.category_id : category_id,
      contest_id: contest_id === undefined ? existingPost.contest_id : contest_id,
      status,
      scheduled_for,
      meta_title,
      meta_description,
      og_image_url,
      og_title,
      og_description,
      has_faq,
      faq_schema
    };

    // Handle published_at based on status
    if (status === 'published' && existingPost.status !== 'published') {
      updateData.published_at = published_at || new Date().toISOString();
    } else if (status !== 'published') {
      updateData.published_at = null;
    }

    // Update post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update tags
    if (tags !== undefined) {
      // Delete existing tags
      await supabase
        .from('blog_post_tags')
        .delete()
        .eq('post_id', id);

      // Insert new tags
      if (tags.length > 0) {
        const tagInserts = tags.map((tagId: string) => ({
          post_id: id,
          tag_id: tagId
        }));

        await supabase
          .from('blog_post_tags')
          .insert(tagInserts);
      }
    }

    // Log action
    await logAdminAction({
      action: 'update_blog_post',
      resourceType: 'blog_post',
      resourceId: id,
      changes: { title, slug, status },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/blog/posts/[id] - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('canDeleteAny');

    const { id } = await params;
    const supabase = await createClient();

    // Check if post exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('title')
      .eq('id', id)
      .single();

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete post (tags will be deleted via CASCADE)
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log action
    await logAdminAction({
      action: 'delete_blog_post',
      resourceType: 'blog_post',
      resourceId: id,
      changes: { title: existingPost.title },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
