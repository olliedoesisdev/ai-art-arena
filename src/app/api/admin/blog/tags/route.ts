import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAdminAction } from '@/lib/utils/admin-auth';

// GET /api/admin/blog/tags - List all tags
export async function GET() {
  try {
    await requirePermission('canManageContests');

    const supabase = await createClient();

    const { data: tags, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ tags });
  } catch (error: any) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/admin/blog/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    await requirePermission('canManageContests');

    const body = await request.json();
    const { name, slug } = body;

    // Validation
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert tag
    const { data: tag, error } = await supabase
      .from('blog_tags')
      .insert({ name, slug })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log action
    await logAdminAction({
      action: 'create_blog_tag',
      resourceType: 'blog_tag',
      resourceId: tag.id,
      changes: { name, slug },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
