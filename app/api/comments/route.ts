import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { CreateCommentSchema } from "@/lib/validators";
import { getClientIP, hashIP } from "@/lib/utils";
import { logger, generateRequestId } from "@/lib/logger";
import { sendCommentNotification } from "@/lib/email";

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: "/api/comments" }, "comment request received");

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Validate
    const result = CreateCommentSchema.safeParse(body);
    if (!result.success) {
      logger.warn({ requestId, issues: result.error.issues }, "comment validation failed");
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { artwork_id, name, email, body: commentBody } = result.data;

    // Rate limit: one comment per IP per 60 seconds
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    const supabase = createPublicClient();

    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if ((count ?? 0) > 0) {
      logger.warn({ requestId, ipHash }, "comment rate limited");
      return NextResponse.json(
        { error: "Please wait before submitting another comment" },
        { status: 429 }
      );
    }

    // Insert — is_approved defaults to false (moderation queue)
    const { error: insertError } = await supabase.from("comments").insert({
      artwork_id,
      author_name: name,
      author_email: email || null,
      body: commentBody,
      ip_hash: ipHash,
      is_approved: false,
      is_admin_reply: false,
    });

    if (insertError) {
      logger.error({ requestId, insertError }, "comment insert failed");
      return NextResponse.json({ error: "Failed to save comment" }, { status: 500 });
    }

    const ms = Date.now() - start;
    logger.info({ requestId, ms }, "comment inserted");

    // Fire email notification — never blocks the response
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      void (async () => {
        try {
          const { data } = await supabase
            .from("artworks")
            .select("title, contest_id, contests(week_number)")
            .eq("id", artwork_id)
            .single();
          if (!data) return;
          const contestRow = Array.isArray(data.contests)
            ? data.contests[0]
            : data.contests;
          const week = (contestRow as { week_number: number } | null)?.week_number;
          if (!week) return;
          await sendCommentNotification({
            commenterName: name,
            commenterEmail: email || null,
            commentBody,
            artworkTitle: data.title,
            weekNumber: week,
            contestId: data.contest_id,
          });
        } catch (err) {
          logger.warn({ requestId, err }, "comment email notification failed");
        }
      })();
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const ms = Date.now() - start;
    logger.error({ requestId, ms, err }, "comment unhandled error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
