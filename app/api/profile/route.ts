import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { updateUserProfile } from "@/lib/data/profiles";
import { logger, generateRequestId } from "@/lib/logger";

const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).trim().optional(),
  bio: z.string().max(300).trim().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  is_public: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You must be signed in to update your profile." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await updateUserProfile(session.user.id, parsed.data);
    if (!result.success) {
      logger.error({ requestId, error: result.error }, "profile update failed");
      return NextResponse.json({ error: result.error || "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ requestId, error }, "profile route unhandled error");
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
