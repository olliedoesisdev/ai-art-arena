import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAdminAction } from '@/lib/utils/admin-auth';

// GET /api/admin/blog/categories - List all categories
export async function GET() {
  try {
    await requirePermission('canManageContests');

    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/admin/blog/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    await requirePermission('canManageContests');

    const body = await request.json();
    const { name, slug, description, color, icon, sort_order } = body;

    // Validation
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert category
    const { data: category, error } = await supabase
      .from('blog_categories')
      .insert({
        name,
        slug,
        description,
        color: color || '#8b5cf6',
        icon,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log action
    await logAdminAction({
      action: 'create_blog_category',
      resourceType: 'blog_category',
      resourceId: category.id,
      changes: { name, slug },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
