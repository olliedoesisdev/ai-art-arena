// app/api/v1/contests/photo/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { submissionRateLimit } from "@/lib/ratelimit";
import { logger, generateRequestId } from "@/lib/logger";
import { z } from "zod";
import sharp from "sharp";

const textSchema = z.object({
  contest_id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(300).optional().default(""),
});

const ACCEPTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const log = logger.child({ requestId, route: "POST /api/v1/contests/photo/submit" });

  log.info("submission request received");

  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    log.warn("unauthenticated submission attempt");
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userId = session.user.id;

  // 2. Rate limit — keyed by user id
  const { success: rateLimitOk, reset } = await submissionRateLimit.limit(userId);
  if (!rateLimitOk) {
    log.warn({ userId }, "submission rate limit exceeded");
    return NextResponse.json(
      { error: "Too many submissions. Try again later.", reset_at: new Date(reset).toISOString() },
      { status: 429 }
    );
  }

  // 3. Parse multipart form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const rawTitle = formData.get("title");
  const rawDescription = formData.get("description");
  const rawContestId = formData.get("contest_id");
  const file = formData.get("file");

  // 4. Zod validate text fields
  const parsed = textSchema.safeParse({
    contest_id: rawContestId,
    title: rawTitle,
    description: rawDescription ?? "",
  });

  if (!parsed.success) {
    log.warn({ errors: parsed.error.flatten() }, "validation failed");
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { contest_id, title, description } = parsed.data;

  const supabase = createAdminClient();

  // 5. Verify contest exists, is photo type, is active
  const { data: contest, error: contestError } = await supabase
    .from("contests")
    .select("id, status, contest_type, max_submissions")
    .eq("id", contest_id)
    .single();

  if (contestError || !contest) {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  }
  if (contest.contest_type !== "photo" && contest.contest_type !== "ai_art") {
    return NextResponse.json({ error: "This contest does not accept user submissions" }, { status: 400 });
  }
  if (contest.status !== "upcoming") {
    return NextResponse.json({ error: "This contest is not currently accepting submissions" }, { status: 400 });
  }

  // 6. Check per-user submission count against max_submissions
  const { count: userCount } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("contest_id", contest_id)
    .eq("user_id", userId)
    .neq("status", "rejected");

  const perUserMax = contest.max_submissions ?? 1;
  if ((userCount ?? 0) >= perUserMax) {
    return NextResponse.json(
      { error: perUserMax === 1 ? "You have already submitted to this contest" : `You have reached the submission limit of ${perUserMax} for this contest` },
      { status: 409 }
    );
  }

  // 7. Check overall contest submission cap (2x max_submissions as a ceiling)
  if (contest.max_submissions) {
    const { count: totalCount } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("contest_id", contest_id)
      .neq("status", "rejected");

    if ((totalCount ?? 0) >= contest.max_submissions * 10) {
      return NextResponse.json({ error: "This contest has reached its submission limit" }, { status: 400 });
    }
  }

  // 8. Validate file server-side
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const blob = file as Blob;
  if (!ACCEPTED_MIME.has(blob.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are accepted" }, { status: 400 });
  }
  if (blob.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 8 MB" }, { status: 400 });
  }

  // 9. Resize/compress with sharp — WebP, max 1600px longest edge, quality 85
  const buffer = Buffer.from(await blob.arrayBuffer());
  let processedBuffer: Buffer;
  try {
    processedBuffer = await sharp(buffer)
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch (err) {
    log.error({ err }, "sharp processing failed");
    return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
  }

  // 10. Upload to Supabase Storage (private bucket)
  const fileId = crypto.randomUUID();
  const storagePath = `${contest_id}/${userId}/${fileId}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("photo-submissions-private")
    .upload(storagePath, processedBuffer, {
      contentType: "image/webp",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    log.error({ uploadError }, "storage upload failed");
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  // 11. Insert submission row
  const { error: insertError } = await supabase.from("submissions").insert({
    contest_id,
    user_id: userId,
    image_url: storagePath,
    title,
    description: description || null,
    status: "pending",
  });

  if (insertError) {
    log.error({ insertError }, "submission insert failed");
    // Clean up uploaded file
    await supabase.storage.from("photo-submissions-private").remove([storagePath]);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  log.info({ userId, contest_id }, "submission created successfully");
  return NextResponse.json({ success: true }, { status: 200 });
}
