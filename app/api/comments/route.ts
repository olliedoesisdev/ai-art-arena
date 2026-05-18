import { createPublicClient } from "@/lib/supabase/server";
import { CreateCommentSchema } from "@/lib/validators";
import { getClientIP, hashIP } from "@/lib/utils";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";
import { sendCommentNotification, sendCommentOnYourArtwork } from "@/lib/email";
import { auth } from "@/auth";
import { authRateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: "/api/comments" }, "comment request received");

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(requestId, { error: "Invalid JSON" }, { status: 400 });
    }

    // Validate
    const result = CreateCommentSchema.safeParse(body);
    if (!result.success) {
      logger.warn({ requestId, issues: result.error.issues }, "comment validation failed");
      return jsonResponse(requestId, 
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { artwork_id, name, email, body: commentBody } = result.data;

    // Resolve session — non-fatal if missing
    let userId: string | null = null;
    try {
      const session = await auth();
      userId = session?.user?.id ?? null;
    } catch {
      // stay anonymous
    }

    // Rate limit: 5 comments per IP per 15 minutes (Redis sliding window)
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);
    const { success: allowed } = await authRateLimit.limit(`comment:${ipHash}`);
    if (!allowed) {
      logger.warn({ requestId, ipHash }, "comment rate limited");
      return jsonResponse(requestId,
        { error: "Please wait before submitting another comment" },
        { status: 429 }
      );
    }

    const supabase = createPublicClient();

    // Look up contest_id from the artwork so we can store it on the comment
    const { data: artwork } = await supabase
      .from("artworks")
      .select("contest_id")
      .eq("id", artwork_id)
      .single();

    // Insert — is_approved defaults to false (moderation queue)
    const { error: insertError } = await supabase.from("comments").insert({
      artwork_id,
      author_name: name,
      author_email: email || null,
      body: commentBody,
      ip_hash: ipHash,
      is_approved: true,
      is_admin_reply: false,
      user_id: userId,
      contest_id: artwork?.contest_id ?? null,
    });

    if (insertError) {
      logger.error({ requestId, insertError }, "comment insert failed");
      return jsonResponse(requestId, { error: "Failed to save comment" }, { status: 500 });
    }

    const ms = Date.now() - start;
    logger.info({ requestId, ms }, "comment inserted");

    // Fire email notifications — never blocks the response
    if (process.env.RESEND_API_KEY) {
      void (async () => {
        try {
          const { data: artworkData } = await supabase
            .from("artworks")
            .select("title, contest_id, contests(contest_number, contest_type)")
            .eq("id", artwork_id)
            .single();
          if (!artworkData) return;

          const contestRow = Array.isArray(artworkData.contests)
            ? artworkData.contests[0]
            : artworkData.contests;
          const contest = contestRow as { contest_number: number; contest_type: string } | null;
          if (!contest) return;

          // 1. Notify admin
          if (process.env.ADMIN_EMAIL) {
            await sendCommentNotification({
              commenterName: name,
              commenterEmail: email || null,
              commentBody,
              artworkTitle: artworkData.title,
              contestNumber: contest.contest_number,
              contestId: artworkData.contest_id,
            });
          }

          // 2. Notify artwork owner (if submitted by a user and they have an email)
          const { data: submission } = await supabase
            .from("submissions")
            .select("user_id")
            .eq("contest_id", artworkData.contest_id)
            .eq("title", artworkData.title)
            .eq("status", "approved")
            .maybeSingle();

          if (submission?.user_id) {
            const { data: owner } = await supabase
              .from("users")
              .select("email, name")
              .eq("id", submission.user_id)
              .single();

            // Don't notify if owner is the one commenting
            if (owner?.email && owner.email !== (email || null)) {
              await sendCommentOnYourArtwork({
                ownerEmail: owner.email,
                ownerName: owner.name,
                commenterName: name,
                commentBody,
                artworkTitle: artworkData.title,
                contestNumber: contest.contest_number,
                contestId: artworkData.contest_id,
                contestType: contest.contest_type,
              });
            }
          }
        } catch (err) {
          logger.warn({ requestId, err }, "comment email notification failed");
        }
      })();
    }

    return jsonResponse(requestId, { success: true }, { status: 201 });
  } catch (err) {
    const ms = Date.now() - start;
    logger.error({ requestId, ms, err }, "comment unhandled error");
    return jsonResponse(requestId, { error: "Internal server error" }, { status: 500 });
  }
}
