import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { VoteSchema } from "@/lib/validators";
import {
  voteRateLimit,
  buildVoteRateLimitKey,
  hashEmail,
} from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";
import { auth } from "@/auth";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: "/api/v1/vote" }, "vote request received");

  try {
    // 1. Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        requestId,
        { error: "Invalid JSON" },
        { status: 400 },
      );
    }

    // 2. Zod validate — reject before touching DB or Redis.
    //    Schema only requires `artwork_id`; the submit_vote RPC derives
    //    contest_id from it server-side (see migration 20240020).
    const result = VoteSchema.safeParse(body);
    if (!result.success) {
      logger.warn(
        { requestId, issues: result.error.issues },
        "vote validation failed",
      );
      return jsonResponse(
        requestId,
        { error: "Invalid input", details: result.error.issues },
        { status: 400 },
      );
    }
    const { artwork_id } = result.data;

    // 3. Resolve identity — email for authed users, IP for anonymous.
    //    Auth failure is non-fatal: treat as anonymous rather than throwing.
    let userEmail: string | null = null;
    let userId: string | null = null;
    try {
      const session = await auth();
      userEmail = session?.user?.email ?? null;
      userId = session?.user?.id ?? null;
    } catch {
      // stay anonymous
    }

    // 4. Hash IP — reject if no IP headers (prevents hash collision)
    const clientIP = getClientIP(request);
    if (!clientIP) {
      logger.warn({ requestId }, "vote rejected: no IP headers");
      return jsonResponse(
        requestId,
        { error: "Unable to verify request origin" },
        { status: 400 },
      );
    }
    const ipHash = hashIP(clientIP);

    // 5. Rate limit — keyed by email hash for authed users, IP hash for anon.
    //    Scope is per-identity globally (not per-contest); since only one
    //    contest is active at a time this is effectively identical.
    const rateLimitKey = buildVoteRateLimitKey(userEmail, ipHash);
    let allowed: boolean, reset: number;
    try {
      const rl = await voteRateLimit.limit(rateLimitKey);
      allowed = rl.success;
      reset = rl.reset;
    } catch (rlError) {
      logger.error({ requestId, rlError }, "rate limit check failed");
      return jsonResponse(
        requestId,
        { error: "Internal server error" },
        { status: 500 },
      );
    }

    if (!allowed) {
      const resetDate = new Date(reset);
      const hoursUntilReset = Math.ceil(
        (resetDate.getTime() - Date.now()) / (1000 * 60 * 60),
      );
      const errorMessage = userEmail
        ? `You have already voted today. Your next vote is available in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? "s" : ""}.`
        : `This device has already voted today. Sign in with your email to vote from any device. Next vote available in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? "s" : ""}.`;

      logger.warn(
        { requestId, rateLimitKey, isAuthenticated: !!userEmail },
        "vote rate limited",
      );
      return jsonResponse(
        requestId,
        {
          error: errorMessage,
          reset_at: resetDate.toISOString(),
          isAuthenticated: !!userEmail,
        },
        { status: 429 },
      );
    }

    // 6. Call submit_vote RPC — single atomic call. The function derives
    //    contest_id from artwork_id internally, runs the three-layer duplicate
    //    check, inserts the vote and bumps the denormalised counter.
    const emailHash = userEmail ? hashEmail(userEmail) : null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .rpc("submit_vote", {
        p_artwork_id: artwork_id,
        p_user_id: userId,
        p_ip_hash: ipHash,
        p_email_hash: emailHash,
      })
      .single();

    if (error) {
      logger.error({ requestId, error }, "submit_vote RPC error");
      return jsonResponse(
        requestId,
        { error: "Internal server error" },
        { status: 500 },
      );
    }

    const row = data as {
      success: boolean;
      error_code: string | null;
      vote_count: number;
      contest_id: string | null;
    };

    if (!row.success) {
      const EXPECTED_CODES = new Set(["ALREADY_VOTED", "CONTEST_NOT_ACTIVE"]);
      const map: Record<string, { status: number; error: string }> = {
        CONTEST_NOT_FOUND: { status: 404, error: "Contest not found" },
        CONTEST_NOT_ACTIVE: { status: 400, error: "Contest is not active" },
        ARTWORK_NOT_FOUND: { status: 404, error: "Artwork not found" },
        ALREADY_VOTED: { status: 409, error: "Already voted on this contest" },
      };
      const mapped = map[row.error_code ?? ""] ?? {
        status: 500,
        error: "Internal server error",
      };
      logger.warn(
        { requestId, error_code: row.error_code, contest_id: row.contest_id },
        "vote rejected by RPC",
      );

      if (!EXPECTED_CODES.has(row.error_code ?? "")) {
        Sentry.captureMessage(
          `submit_vote unexpected error_code: ${row.error_code ?? "null"}`,
          {
            level: "error",
            extra: {
              requestId,
              artwork_id,
              contest_id: row.contest_id,
              error_code: row.error_code,
            },
          },
        );
      }

      return jsonResponse(
        requestId,
        { error: mapped.error },
        { status: mapped.status },
      );
    }

    // 7. Revalidate the contest page ISR cache. contest_id was derived inside
    //    the RPC and handed back on the success row — no extra round-trip.
    //    Defensive fallback: if the RPC ever returns NULL on success (shouldn't
    //    happen given the migration), skip revalidation rather than crashing.
    if (row.contest_id) {
      revalidatePath(`/contest/${row.contest_id}`);
    }

    const ms = Date.now() - start;
    logger.info(
      { requestId, ms, vote_count: row.vote_count, contest_id: row.contest_id },
      "vote accepted",
    );
    return jsonResponse(requestId, {
      success: true,
      vote_count: row.vote_count,
    });
  } catch (error) {
    const ms = Date.now() - start;
    logger.error({ requestId, ms, error }, "vote unhandled error");
    return jsonResponse(
      requestId,
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
