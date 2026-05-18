import * as Sentry from "@sentry/nextjs";
import { createClient, createPublicClient } from "@/lib/supabase/server";
import { VoteSchema } from "@/lib/validators";
import {
  voteRateLimit,
  anonVoteRateLimit,
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

    // 4b. Resolve contest_id from artwork — needed to scope the anon rate limit
    //     key per-contest. Using createPublicClient (no cookies, no dynamic
    //     rendering penalty). Also surfaces ARTWORK_NOT_FOUND before Redis.
    const publicClient = createPublicClient();
    const { data: artworkRow } = await publicClient
      .from("artworks")
      .select("contest_id")
      .eq("id", artwork_id)
      .single();
    const contestIdForKey = artworkRow?.contest_id ?? null;

    // 5. Two-lane rate limit:
    //    Authenticated → voteRateLimit (1/24h, keyed by email hash)
    //    Anonymous     → anonVoteRateLimit (50/contest, keyed by ip:hash:contestId)
    const rateLimitKey = buildVoteRateLimitKey(userEmail, ipHash, contestIdForKey);
    const limiter = userEmail ? voteRateLimit : anonVoteRateLimit;
    let allowed: boolean, reset: number;
    try {
      const rl = await limiter.limit(rateLimitKey);
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
        ? `You have used all 10 votes for this contest. Resets in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? "s" : ""}.`
        : `This connection has reached the vote limit for this contest. Sign in to get your own personal votes. Resets in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? "s" : ""}.`;

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
      const EXPECTED_CODES = new Set([
        "ALREADY_VOTED",
        "CONTEST_NOT_ACTIVE",
        "VOTE_LIMIT_REACHED",
        "ARTWORK_VOTE_LIMIT_REACHED",
      ]);
      const map: Record<string, { status: number; error: string }> = {
        CONTEST_NOT_FOUND:        { status: 404, error: "Contest not found" },
        CONTEST_NOT_ACTIVE:       { status: 400, error: "Contest is not active" },
        ARTWORK_NOT_FOUND:        { status: 404, error: "Artwork not found" },
        ALREADY_VOTED:            { status: 409, error: "Already voted on this contest" },
        VOTE_LIMIT_REACHED:       { status: 409, error: "You have used all 10 votes for this contest" },
        ARTWORK_VOTE_LIMIT_REACHED: { status: 409, error: "You have reached the 5-vote limit on this artwork" },
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
      revalidatePath(`/contests/ai-art/${row.contest_id}`);
      revalidatePath(`/contests/photo/${row.contest_id}`);
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
