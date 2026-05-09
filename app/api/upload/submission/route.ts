import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const start = Date.now();
  logger.info({ requestId, path: "/api/upload/submission" }, "upload request received");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be under 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";
    const filename = `submissions/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const supabase = createAdminClient();

    const { data, error } = await supabase.storage
      .from("submissions")
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
      });

    if (error || !data) {
      logger.error({ requestId, error }, "storage upload error");
      return NextResponse.json(
        { error: "Failed to upload image. Please try again." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("submissions").getPublicUrl(data.path);

    logger.info({ requestId, ms: Date.now() - start, status: 201 }, "upload response sent");
    return NextResponse.json(
      { success: true, url: publicUrl, path: data.path },
      { status: 201 }
    );
  } catch (error) {
    logger.error({ requestId, error }, "upload route error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
