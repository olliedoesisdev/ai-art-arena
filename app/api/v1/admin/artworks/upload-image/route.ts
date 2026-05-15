import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";
import { adminUploadRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  logger.info({ requestId }, "upload-image request received");

  const ip = getClientIP(request);
  const ipHash = hashIP(ip ?? "unknown");
  const { success } = await adminUploadRateLimit.limit(`admin_upload:${ipHash}`);
  if (!success) {
    return jsonResponse(requestId, { error: "Upload rate limit exceeded" }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return jsonResponse(requestId, { error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return jsonResponse(requestId, { error: "No file provided" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return jsonResponse(requestId, { error: "Invalid file type. Use JPG, PNG, WebP, or GIF." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return jsonResponse(requestId, { error: "File too large. Max 10MB." }, { status: 400 });
    }

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `artworks/${filename}`;

    const supabase = createAdminClient();

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
      return jsonResponse(requestId, { error: "Failed to upload image" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("artworks")
      .getPublicUrl(path);

    logger.info({ requestId, path }, "image uploaded to storage");
    return jsonResponse(requestId, { url: publicUrl });
  } catch (error) {
    logger.error({ requestId, error }, "upload-image unhandled error");
    return jsonResponse(requestId, { error: "Internal server error" }, { status: 500 });
  }
}
