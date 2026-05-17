import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateContestSchema } from "@/lib/validators";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: '/api/admin' }, 'admin contest create request received');

  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return jsonResponse(requestId, { error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const result = CreateContestSchema.safeParse(body);

    if (!result.success) {
      return jsonResponse(requestId, 
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { contest_number, start_date, end_date, status } = result.data;
    const supabase = await createClient();

    const { data: contest, error } = await supabase
      .from("contests")
      .insert({
        contest_number,
        start_date: new Date(start_date).toISOString(),
        end_date: new Date(end_date).toISOString(),
        status: status || "active",
      })
      .select()
      .single();

    if (error) {
      logger.error({ requestId, error }, 'contest creation error');
      return jsonResponse(requestId, { error: "Failed to create contest" }, { status: 500 });
    }

    logger.info({ requestId, ms: Date.now() - start, contestId: contest.id }, 'contest created');
    return jsonResponse(requestId, { success: true, data: contest });
  } catch (error) {
    logger.error({ requestId, ms: Date.now() - start, error }, 'admin contest unhandled error');
    return jsonResponse(requestId, { error: "Internal server error" }, { status: 500 });
  }
}
