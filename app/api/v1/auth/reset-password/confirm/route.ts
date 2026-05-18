import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";
import { resetRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

const Schema = z.object({
  token: z.string().min(64).max(64),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export async function POST(request: Request) {
  const requestId = generateRequestId();
  logger.info({ requestId }, "password reset confirm received");

  try {
    let body: unknown;
    try { body = await request.json(); } catch {
      return jsonResponse(requestId, { error: "Invalid JSON" }, { status: 400 });
    }

    const result = Schema.safeParse(body);
    if (!result.success) {
      return jsonResponse(requestId,
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const ipHash = hashIP(getClientIP(request));
    const { success } = await resetRateLimit.limit(ipHash);
    if (!success) {
      return jsonResponse(requestId, { error: "Too many requests — try again later" }, { status: 429 });
    }

    const { token, password } = result.data;

    const adminClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const { data: tokenRow } = await adminClient
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used_at")
      .eq("token_hash", tokenHash)
      .single();

    if (!tokenRow) {
      return jsonResponse(requestId, { error: "Invalid or expired reset link" }, { status: 400 });
    }
    if (tokenRow.used_at) {
      return jsonResponse(requestId, { error: "This reset link has already been used" }, { status: 400 });
    }
    if (new Date(tokenRow.expires_at) < new Date()) {
      return jsonResponse(requestId, { error: "This reset link has expired — please request a new one" }, { status: 400 });
    }

    await adminClient
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRow.id);

    const { error: authError } = await adminClient.auth.admin.updateUserById(
      tokenRow.user_id,
      { password }
    );

    if (authError) {
      logger.error({ requestId, authError }, "auth password update failed");
      return jsonResponse(requestId, { error: "Failed to update password" }, { status: 500 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    await adminClient
      .from("users")
      .update({ password_hash })
      .eq("id", tokenRow.user_id);

    logger.info({ requestId, userId: tokenRow.user_id }, "password reset complete");
    return jsonResponse(requestId, { success: true });
  } catch (error) {
    logger.error({ requestId, error }, "reset confirm unhandled error");
    return jsonResponse(requestId, { error: "Internal server error" }, { status: 500 });
  }
}
