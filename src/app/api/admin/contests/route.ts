import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAdminAction } from '@/lib/utils/admin-auth';

// GET /api/admin/contests - List all contests
export async function GET() {
  try {
    await requirePermission('canManageContests');

    const supabase = await createClient();

    const { data: contests, error } = await supabase
      .from('contests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ contests });
  } catch (error: any) {
    console.error('Error fetching contests:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/admin/contests - Create new contest
export async function POST(request: NextRequest) {
  try {
    await requirePermission('canManageContests');

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

    // Insert contest
    const { data: contest, error } = await supabase
      .from('contests')
      .insert({
        title,
        week_number,
        year,
        start_date,
        end_date,
        status,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log action
    await logAdminAction({
      action: 'create_contest',
      resourceType: 'contest',
      resourceId: contest.id,
      changes: { title, week_number, year, start_date, end_date, status },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ contest }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}