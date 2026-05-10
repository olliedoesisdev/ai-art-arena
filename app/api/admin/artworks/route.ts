import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { logger, generateRequestId } from "@/lib/logger";
import { adminRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";

const UploadArtworksSchema = z.object({
  artworks: z
    .array(
      z.object({
        contest_id: z.string().uuid(),
        image_url: z.string().url(),
        title: z.string().min(1).max(100),
        prompt: z.string().max(500).nullable().optional(),
      })
    )
    .min(1)
    .max(50),
});

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: '/api/admin/artworks' }, 'artwork upload request received');

  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const ipHash = hashIP(getClientIP(request));
    const { success: rateLimitOk } = await adminRateLimit.limit(`admin:${ipHash}`);
    if (!rateLimitOk) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const result = UploadArtworksSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.issues }, { status: 400 });
    }

    const { artworks } = result.data;
    const contest_id = artworks[0]?.contest_id;

    const supabase = createAdminClient();

    const { data: contest, error: contestError } = await supabase
      .from("contests")
      .select("id, artwork_count")
      .eq("id", contest_id)
      .single();

    if (contestError || !contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    if (artworks.length > contest.artwork_count) {
      return NextResponse.json(
        { error: `This contest allows at most ${contest.artwork_count} artworks` },
        { status: 400 }
      );
    }

    const artworksToInsert = artworks.map((artwork) => ({
      contest_id: artwork.contest_id,
      image_url: artwork.image_url,
      title: artwork.title,
      prompt: artwork.prompt || null,
    }));

    const { data: insertedArtworks, error: insertError } = await supabase
      .from("artworks")
      .insert(artworksToInsert)
      .select();

    if (insertError) {
      logger.error({ requestId, error: insertError }, 'artwork insertion error');
      return NextResponse.json({ error: "Failed to upload artworks" }, { status: 500 });
    }

    logger.info({ requestId, ms: Date.now() - start, count: insertedArtworks.length }, 'artworks uploaded');
    return NextResponse.json({ success: true, data: insertedArtworks, count: insertedArtworks.length });
  } catch (error) {
    logger.error({ requestId, ms: Date.now() - start, error }, 'artworks unhandled error');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
