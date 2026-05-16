// app/api/v1/admin/submissions/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { adminRateLimit } from "@/lib/ratelimit";
import { logger, generateRequestId } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { getClientIP, hashIP } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: submissionId } = await params;
  const requestId = generateRequestId();
  const log = logger.child({ requestId, route: "POST /api/v1/admin/submissions/[id]/approve", submissionId });

  log.info("approve request received");

  // 1. Auth + admin role check
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    log.warn("unauthorized approve attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit
  const ip = getClientIP(req);
  const ipHash = hashIP(ip);
  const { success: rateLimitOk } = await adminRateLimit.limit(ipHash);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const supabase = createAdminClient();

  // 3. Fetch submission row
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("id, contest_id, user_id, image_url, title, description, status")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    log.warn("submission not found");
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.status !== "pending") {
    return NextResponse.json({ error: `Submission is already ${submission.status}` }, { status: 400 });
  }

  // 4. Copy image from private bucket to public artworks bucket
  const destPath = `photo/${submission.contest_id}/${submissionId}.webp`;

  const { error: copyError } = await supabase.storage
    .from("artworks")
    .copy(`photo-submissions-private/${submission.image_url}` as never, destPath);

  // If copy fails, try using download + upload approach (different bucket API)
  let publicImageUrl: string;
  if (copyError) {
    // Download from private bucket then upload to public
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("photo-submissions-private")
      .download(submission.image_url);

    if (downloadError || !fileData) {
      log.error({ downloadError }, "failed to download submission image");
      return NextResponse.json({ error: "Failed to retrieve image" }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("artworks")
      .upload(destPath, buffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      log.error({ uploadError }, "failed to upload to artworks bucket");
      return NextResponse.json({ error: "Failed to publish image" }, { status: 500 });
    }
  }

  // 5. Get public URL
  const { data: urlData } = supabase.storage.from("artworks").getPublicUrl(destPath);
  publicImageUrl = urlData.publicUrl;

  // 6. Insert into artworks table
  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .insert({
      contest_id: submission.contest_id,
      image_url: publicImageUrl,
      title: submission.title,
      artist_prompt: submission.description ?? null,
      vote_count: 0,
    })
    .select("id")
    .single();

  if (artworkError || !artwork) {
    log.error({ artworkError }, "failed to insert artwork");
    return NextResponse.json({ error: "Failed to create artwork" }, { status: 500 });
  }

  // 7. Update submission status
  const { error: updateError } = await supabase
    .from("submissions")
    .update({
      status: "approved",
      public_image_url: publicImageUrl,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.user.id,
    })
    .eq("id", submissionId);

  if (updateError) {
    log.error({ updateError }, "failed to update submission status");
  }

  // 8. Remove from private bucket (best effort)
  await supabase.storage.from("photo-submissions-private").remove([submission.image_url]);

  // 9. Revalidate contest page
  revalidatePath(`/contests/photo/${submission.contest_id}`);

  log.info({ submissionId, artworkId: artwork.id }, "submission approved");
  return NextResponse.json({ success: true, artwork_id: artwork.id }, { status: 200 });
}
