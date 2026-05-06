import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { logger, generateRequestId } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: '/api/admin/contests/[id]/archive' }, 'archive request received');

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const supabase = createAdminClient();

    const { id } = await context.params;

    const { data: updatedContest, error: updateError } = await supabase
      .from("contests")
      .update({ status: "archived" })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      logger.error({ requestId, error: updateError }, 'contest archive error');
      return NextResponse.json({ error: "Failed to archive contest" }, { status: 500 });
    }

    if (!updatedContest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    logger.info({ requestId, ms: Date.now() - start, contestId: id }, 'contest archived');
    return NextResponse.json({ success: true, contest: updatedContest });
  } catch (error) {
    logger.error({ requestId, ms: Date.now() - start, error }, 'archive unhandled error');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
