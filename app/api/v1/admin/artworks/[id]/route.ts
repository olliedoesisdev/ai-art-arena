import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { logger, generateRequestId } from "@/lib/logger";
import { adminRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const editSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  prompt: z.string().max(500).optional(),
});

// PATCH — edit title / prompt
export async function PATCH(req: NextRequest, context: RouteContext) {
  const requestId = generateRequestId();
  const log = logger.child({ requestId, route: "PATCH /api/v1/admin/artworks/[id]" });

  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ipHash = hashIP(getClientIP(req) ?? "unknown");
  const { success: rateLimitOk } = await adminRateLimit.limit(`admin:${ipHash}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json() as unknown;
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: artwork } = await supabase
    .from("artworks")
    .select("contest_id, contests(contest_type)")
    .eq("id", id)
    .single();

  if (!artwork) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("artworks")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    log.error({ error }, "failed to update artwork");
    return NextResponse.json({ error: "Failed to update artwork" }, { status: 500 });
  }

  const contestType = (artwork.contests as unknown as { contest_type: string } | null)?.contest_type ?? "ai-art";
  const contestPath = contestType === "photo" ? "photo" : "ai-art";
  revalidatePath(`/contests/${contestPath}/${artwork.contest_id}`);
  revalidatePath(`/admin/contests/${artwork.contest_id}`);

  log.info({ artworkId: id }, "artwork updated");
  return NextResponse.json({ success: true });
}

// DELETE — remove artwork + storage file
export async function DELETE(req: NextRequest, context: RouteContext) {
  const requestId = generateRequestId();
  const log = logger.child({ requestId, route: "DELETE /api/v1/admin/artworks/[id]" });

  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ipHash = hashIP(getClientIP(req) ?? "unknown");
  const { success: rateLimitOk } = await adminRateLimit.limit(`admin:${ipHash}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: artwork } = await supabase
    .from("artworks")
    .select("image_url, contest_id, contests(contest_type)")
    .eq("id", id)
    .single();

  if (!artwork) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }

  // Delete DB row first — if storage fails we can clean up manually
  const { error: deleteError } = await supabase
    .from("artworks")
    .delete()
    .eq("id", id);

  if (deleteError) {
    log.error({ deleteError }, "failed to delete artwork row");
    return NextResponse.json({ error: "Failed to delete artwork" }, { status: 500 });
  }

  // Best-effort storage cleanup — derive path from public URL
  try {
    const url = new URL(artwork.image_url);
    const pathMatch = url.pathname.match(/\/object\/public\/artworks\/(.+)$/);
    if (pathMatch?.[1]) {
      await supabase.storage.from("artworks").remove([decodeURIComponent(pathMatch[1])]);
    }
  } catch (err) {
    log.warn({ err }, "storage cleanup failed — row deleted, file may be orphaned");
  }

  const contestType = (artwork.contests as unknown as { contest_type: string } | null)?.contest_type ?? "ai-art";
  const contestPath = contestType === "photo" ? "photo" : "ai-art";
  revalidatePath(`/contests/${contestPath}/${artwork.contest_id}`);
  revalidatePath(`/admin/contests/${artwork.contest_id}`);
  revalidatePath("/admin/artworks");

  log.info({ artworkId: id }, "artwork deleted");
  return NextResponse.json({ success: true });
}
