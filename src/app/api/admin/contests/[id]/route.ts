import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAdminAction } from '@/lib/utils/admin-auth';

// GET /api/admin/contests/[id] - Get single contest
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('canManageContests');

    const { id } = await params;
    const supabase = await createClient();

    const { data: contest, error } = await supabase
      .from('contests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    return NextResponse.json({ contest });
  } catch (error: any) {
    console.error('Error fetching contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// PUT /api/admin/contests/[id] - Update contest
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('canManageContests');

    const { id } = await params;
    const body = await request.json();
    const { title, week_number, year, start_date, end_date, status } = body;

    // Validation
    if (!title || !week_number || !year || !start_date || !end_date || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update contest
    const { data: contest, error } = await supabase
      .from('contests')
      .update({
        title,
        week_number,
        year,
        start_date,
        end_date,
        status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Log action
    await logAdminAction({
      action: 'update_contest',
      resourceType: 'contest',
      resourceId: contest.id,
      changes: { title, week_number, year, start_date, end_date, status },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ contest });
  } catch (error: any) {
    console.error('Error updating contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/contests/[id] - Delete contest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('canDeleteAny');

    const { id } = await params;
    const supabase = await createClient();

    // Check if contest exists
    const { data: contest } = await supabase
      .from('contests')
      .select('*')
      .eq('id', id)
      .single();

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Delete associated artworks first
    await supabase.from('artworks').delete().eq('contest_id', id);

    // Delete contest
    const { error } = await supabase
      .from('contests')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log action
    await logAdminAction({
      action: 'delete_contest',
      resourceType: 'contest',
      resourceId: id,
      changes: { deleted_contest: contest.title },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}