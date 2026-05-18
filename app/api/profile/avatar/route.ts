import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { authRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 3 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const ipHash = hashIP(getClientIP(request));
    const { success: allowed } = await authRateLimit.limit(`avatar:${ipHash}`);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests — try again later." }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to upload a profile picture." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file was received." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are accepted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Profile picture must be under 3MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext =
      file.type === "image/png" ? "png"
      : file.type === "image/webp" ? "webp"
      : file.type === "image/gif" ? "gif"
      : "jpg";

    const filePath = `${session.user.id}/avatar.${ext}`;
    const serviceClient = createAdminClient();

    // Delete all existing avatar files for this user before uploading
    const { data: existingFiles } = await serviceClient.storage
      .from("avatars")
      .list(session.user.id);

    if (existingFiles && existingFiles.length > 0) {
      const toDelete = existingFiles.map((f) => `${session.user.id}/${f.name}`);
      await serviceClient.storage.from("avatars").remove(toDelete);
    }

    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError || !uploadData) {
      return NextResponse.json(
        { error: "Failed to upload image. Please try again." },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = serviceClient.storage
      .from("avatars")
      .getPublicUrl(uploadData.path);

    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await serviceClient
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", session.user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Image uploaded but profile could not be updated." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, avatarUrl }, { status: 200 });
  } catch (err) {
    console.error("Avatar upload route error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ipHash = hashIP(getClientIP(request));
    const { success: allowed } = await authRateLimit.limit(`avatar:${ipHash}`);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests — try again later." }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const serviceClient = createAdminClient();

    const { data: existingFiles } = await serviceClient.storage
      .from("avatars")
      .list(session.user.id);

    if (existingFiles && existingFiles.length > 0) {
      const toDelete = existingFiles.map((f) => `${session.user.id}/${f.name}`);
      await serviceClient.storage.from("avatars").remove(toDelete);
    }

    await serviceClient
      .from("users")
      .update({ avatar_url: null })
      .eq("id", session.user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Avatar delete route error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
