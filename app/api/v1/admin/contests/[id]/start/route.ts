import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { logger, generateRequestId } from "@/lib/logger";
import { adminRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";
import { revalidatePath } from "next/cache";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const requestId = generateRequestId();
  const log = logger.child({ requestId, route: "POST /api/v1/admin/contests/[id]/start" });

  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ipHash = hashIP(getClientIP(req) ?? "unknown");
  const { success: rateLimitOk } = await adminRateLimit.limit(`admin:${ipHash}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: contest } = await supabase
    .from("contests")
    .select("status, contest_type")
    .eq("id", id)
    .single();

  if (!contest) {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  }

  if (contest.status !== "upcoming") {
    return NextResponse.json({ error: `Contest is already ${contest.status}` }, { status: 400 });
  }

  const { error } = await supabase
    .from("contests")
    .update({ status: "active", start_date: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    log.error({ error }, "failed to start contest");
    return NextResponse.json({ error: "Failed to start contest" }, { status: 500 });
  }

  const contestPath = contest.contest_type === "photo" ? "photo" : "ai-art";
  revalidatePath(`/contests/${contestPath}/${id}`);
  revalidatePath("/contests");

  log.info({ contestId: id }, "contest started");
  return NextResponse.json({ success: true });
}
