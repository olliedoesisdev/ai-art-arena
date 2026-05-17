// app/api/v1/admin/submissions/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { adminRateLimit } from "@/lib/ratelimit";
import { logger, generateRequestId } from "@/lib/logger";
import { getClientIP, hashIP } from "@/lib/utils";
import { sendSubmissionRejected } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: submissionId } = await params;
  const requestId = generateRequestId();
  const log = logger.child({ requestId, route: "POST /api/v1/admin/submissions/[id]/reject", submissionId });

  log.info("reject request received");

  // 1. Auth + admin role check
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    log.warn("unauthorized reject attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit
  const ip = getClientIP(req);
  const ipHash = hashIP(ip);
  const { success: rateLimitOk } = await adminRateLimit.limit(ipHash);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const supabase = createAdminClient();

  // 3. Fetch submission + contest before updating (need data for email)
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("id, contest_id, user_id, title, status, contests(contest_number, contest_type, theme)")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    log.warn("submission not found");
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.status === "rejected") {
    return NextResponse.json({ error: "Submission is already rejected" }, { status: 400 });
  }

  // 4. Update submission status
  const { error } = await supabase
    .from("submissions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.user.id,
    })
    .eq("id", submissionId);

  if (error) {
    log.error({ error }, "failed to reject submission");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // 5. Email the submitter (best effort — never block the response)
  const contest = (submission.contests as unknown) as { contest_number: number; contest_type: string; theme: string | null } | null;
  const { data: submitter } = await supabase
    .from("users")
    .select("email, name")
    .eq("id", submission.user_id)
    .single();

  if (submitter?.email && contest) {
    sendSubmissionRejected({
      email: submitter.email,
      submitterName: submitter.name,
      submissionTitle: submission.title,
      contestNumber: contest.contest_number,
      contestType: contest.contest_type,
      contestId: submission.contest_id,
      contestTheme: contest.theme,
    }).catch((err) => log.error({ err }, "failed to send rejection email"));
  }

  log.info({ submissionId }, "submission rejected");
  return NextResponse.json({ success: true }, { status: 200 });
}
