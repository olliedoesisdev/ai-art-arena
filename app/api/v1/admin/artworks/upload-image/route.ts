import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { logger, generateRequestId } from "@/lib/logger";
import { adminUploadRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  logger.info({ requestId }, "upload-image request received");

  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const ip = getClientIP(request);
  const ipHash = hashIP(ip);
  const { success } = await adminUploadRateLimit.limit(`admin_upload:${ipHash}`);
  if (!success) {
    return NextResponse.json({ error: "Upload rate limit exceeded" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, WebP, or GIF." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `artworks/${filename}`;

    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("artworks")
      .upload(path, bytes, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      logger.error({ requestId, uploadError }, "storage upload failed");
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("artworks")
      .getPublicUrl(path);

    logger.info({ requestId, path }, "image uploaded to storage");
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    logger.error({ requestId, error }, "upload-image unhandled error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
