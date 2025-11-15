import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAdminAction } from '@/lib/utils/admin-auth';

// GET /api/admin/artworks - List all artworks
export async function GET() {
  try {
    await requirePermission('canManageArtworks');

    const supabase = await createClient();

    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ artworks });
  } catch (error: any) {
    console.error('Error fetching artworks:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/admin/artworks - Create new artwork
export async function POST(request: NextRequest) {
  try {
    await requirePermission('canManageArtworks');

    const body = await request.json();
    const {
      contest_id,
      title,
      artist_name,
      description,
      image_url,
      prompt,
      style,
      position,
    } = body;

    // Validation
    if (!contest_id || !title || !artist_name || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert artwork
    const { data: artwork, error } = await supabase
      .from('artworks')
      .insert({
        contest_id,
        title,
        artist_name,
        description: description || null,
        image_url,
        prompt: prompt || '',
        style: style || null,
        position: position || 0,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log action
    await logAdminAction({
      action: 'create_artwork',
      resourceType: 'artwork',
      resourceId: artwork.id,
      changes: { title, artist_name, contest_id },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ artwork }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating artwork:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}