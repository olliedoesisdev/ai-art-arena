import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { adminRateLimit } from "@/lib/ratelimit";
import { logger, generateRequestId } from "@/lib/logger";
import { getClientIP, hashIP } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PatchContestSchema = z.object({
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const requestId = generateRequestId();
  const log = logger.child({ requestId, route: "PATCH /api/v1/admin/contests/[id]", id });

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIP(req);
  const ipHash = hashIP(ip);
  const { success: rateLimitOk } = await adminRateLimit.limit(ipHash);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = PatchContestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.issues }, { status: 400 });
  }

  const { start_date, end_date } = result.data;

  if (new Date(end_date) <= new Date(start_date)) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: contest, error: fetchError } = await supabase
    .from("contests")
    .select("id, contest_type, status")
    .eq("id", id)
    .single();

  if (fetchError || !contest) {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  }

  if (contest.status === "archived") {
    return NextResponse.json({ error: "Cannot edit an archived contest" }, { status: 400 });
  }

  const { error } = await supabase
    .from("contests")
    .update({ start_date, end_date })
    .eq("id", id);

  if (error) {
    log.error({ error }, "failed to update contest dates");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const contestPath = contest.contest_type === "photo" ? "photo" : "ai-art";
  revalidatePath(`/contests/${contestPath}/${id}`);
  revalidatePath(`/admin/contests/${id}`);

  log.info({ id }, "contest dates updated");
  return NextResponse.json({ success: true });
}
