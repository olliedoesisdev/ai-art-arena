import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";
import { resetRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { z } from "zod";

const Schema = z.object({
  email: z.string().email(),
});

const TOKEN_TTL_MINUTES = 30;

export async function POST(request: Request) {
  const requestId = generateRequestId();
  logger.info({ requestId }, "password reset request received");

  try {
    const ipHash = hashIP(getClientIP(request));
    const { success } = await resetRateLimit.limit(ipHash);
    if (!success) {
      return jsonResponse(requestId, { error: "Too many requests — try again later" }, { status: 429 });
    }

    let body: unknown;
    try { body = await request.json(); } catch {
      return jsonResponse(requestId, { error: "Invalid JSON" }, { status: 400 });
    }

    const result = Schema.safeParse(body);
    if (!result.success) {
      return jsonResponse(requestId, { error: "Valid email required" }, { status: 400 });
    }

    const { email } = result.data;

    const adminClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Look up user — always return 200 to prevent email enumeration
    const { data: user } = await adminClient
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (!user) {
      logger.info({ requestId }, "reset requested for unknown email — silent ok");
      return jsonResponse(requestId, { success: true });
    }

    // Invalidate any existing unused tokens for this user
    await adminClient
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("used_at", null);

    // Generate a cryptographically random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: insertError } = await adminClient
      .from("password_reset_tokens")
      .insert({ user_id: user.id, token_hash: tokenHash, expires_at: expiresAt });

    if (insertError) {
      logger.error({ requestId, insertError }, "failed to insert reset token");
      return jsonResponse(requestId, { error: "Internal server error" }, { status: 500 });
    }

    // Fire-and-forget — never block the response on email delivery
    void sendPasswordResetEmail({ email, token: rawToken, expiresInMinutes: TOKEN_TTL_MINUTES });

    logger.info({ requestId }, "reset token issued");
    return jsonResponse(requestId, { success: true });
  } catch (error) {
    logger.error({ requestId, error }, "reset request unhandled error");
    return jsonResponse(requestId, { error: "Internal server error" }, { status: 500 });
  }
}
