import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";
import { adminRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: '/api/v1/admin/contests/[id]/archive' }, 'archive request received');

  try {
    const ipHash = hashIP(getClientIP(_request) ?? "unknown");
    const { success: rateLimitOk } = await adminRateLimit.limit(`admin:${ipHash}`);
    if (!rateLimitOk) {
      return jsonResponse(requestId, { error: "Too many requests" }, { status: 429 });
    }

    const session = await auth();

    if (!session?.user) {
      return jsonResponse(requestId, { error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return jsonResponse(requestId, { error: "Forbidden - Admin access required" }, { status: 403 });
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
      return jsonResponse(requestId, { error: "Failed to archive contest" }, { status: 500 });
    }

    if (!updatedContest) {
      return jsonResponse(requestId, { error: "Contest not found" }, { status: 404 });
    }

    logger.info({ requestId, ms: Date.now() - start, contestId: id }, 'contest archived');
    return jsonResponse(requestId, { success: true, contest: updatedContest });
  } catch (error) {
    logger.error({ requestId, ms: Date.now() - start, error }, 'archive unhandled error');
    return jsonResponse(requestId, { error: "Internal server error" }, { status: 500 });
  }
}
