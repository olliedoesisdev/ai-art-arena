import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, getAdminUser } from '@/lib/utils/admin-auth';

// GET /api/admin/blog/media - List media files
export async function GET(request: NextRequest) {
  try {
    await requirePermission('canManageContests');

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const folder = searchParams.get('folder') || 'blog';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: media, error } = await supabase
      .from('blog_media')
      .select('*')
      .eq('folder', folder)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ media });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/admin/blog/media - Upload media file
export async function POST(request: NextRequest) {
  try {
    await requirePermission('canManageContests');

    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'blog';
    const alt_text = formData.get('alt_text') as string;
    const caption = formData.get('caption') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const storagePath = `${folder}/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('blog-media')
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('blog-media')
      .getPublicUrl(storagePath);

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;

    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Simple dimension extraction for common formats
        // For production, consider using a library like 'sharp'
        if (file.type === 'image/png') {
          width = buffer.readUInt32BE(16);
          height = buffer.readUInt32BE(20);
        } else if (file.type === 'image/jpeg') {
          // JPEG dimension extraction is more complex
          // For now, we'll skip it - consider adding 'sharp' library
        }
      } catch (err) {
        console.error('Error extracting image dimensions:', err);
      }
    }

    // Save metadata to database
    const { data: media, error: dbError } = await supabase
      .from('blog_media')
      .insert({
        filename,
        original_filename: file.name,
        storage_path: storagePath,
        public_url: publicUrl,
        mime_type: file.type,
        file_size: file.size,
        width,
        height,
        alt_text,
        caption,
        uploaded_by: adminUser.id,
        folder,
        metadata: {
          uploaded_at: new Date().toISOString(),
          original_size: file.size
        }
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, clean up uploaded file
      await supabase.storage.from('blog-media').remove([storagePath]);
      throw dbError;
    }

    return NextResponse.json({ media }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
