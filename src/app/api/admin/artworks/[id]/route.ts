import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAdminAction } from '@/lib/utils/admin-auth';

// GET /api/admin/artworks/[id] - Get single artwork
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('canManageArtworks');

    const { id } = await params;
    const supabase = await createClient();

    const { data: artwork, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    return NextResponse.json({ artwork });
  } catch (error: any) {
    console.error('Error fetching artwork:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// PUT /api/admin/artworks/[id] - Update artwork
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('canManageArtworks');

    const { id } = await params;
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

    // Update artwork
    const { data: artwork, error } = await supabase
      .from('artworks')
      .update({
        contest_id,
        title,
        artist_name,
        description: description || null,
        image_url,
        prompt: prompt || '',
        style: style || null,
        position: position || 0,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    // Log action
    await logAdminAction({
      action: 'update_artwork',
      resourceType: 'artwork',
      resourceId: artwork.id,
      changes: { title, artist_name, contest_id },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ artwork });
  } catch (error: any) {
    console.error('Error updating artwork:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/artworks/[id] - Delete artwork
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('canDeleteAny');

    const { id } = await params;
    const supabase = await createClient();

    // Check if artwork exists
    const { data: artwork } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', id)
      .single();

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    // Delete votes associated with this artwork
    await supabase.from('votes').delete().eq('artwork_id', id);

    // Delete artwork
    const { error } = await supabase
      .from('artworks')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log action
    await logAdminAction({
      action: 'delete_artwork',
      resourceType: 'artwork',
      resourceId: id,
      changes: { deleted_artwork: artwork.title },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting artwork:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}