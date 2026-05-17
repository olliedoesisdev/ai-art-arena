import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";
import { adminRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";
import { z } from "zod";

const CreateContestSchema = z.object({
  contest_number: z.number().int().positive(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  start_date: z.iso.datetime(),
  end_date: z.iso.datetime(),
  status: z.enum(["active", "archived"]).default("active"),
  artwork_count: z.number().int().min(1).max(50).default(6),
}).refine(data => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
});

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: '/api/admin/contests' }, 'admin contests create request received');

  try {
    const session = await auth();

    if (!session?.user) {
      return jsonResponse(requestId, { error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return jsonResponse(requestId, { error: "Forbidden" }, { status: 403 });
    }

    // Rate limit admin actions
    const ip = getClientIP(request);
    const ipHash = hashIP(ip);
    const { success } = await adminRateLimit.limit(`admin:${ipHash}`);
    if (!success) {
      return jsonResponse(requestId, { error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const result = CreateContestSchema.safeParse(body);

    if (!result.success) {
      return jsonResponse(requestId, 
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { contest_number, title, description, start_date, end_date, status, artwork_count } = result.data;
    const supabase = createAdminClient();

    const { data: existingContest } = await supabase
      .from("contests")
      .select("id")
      .eq("contest_number", contest_number)
      .single();

    if (existingContest) {
      return jsonResponse(requestId, { error: `Contest #${contest_number} already exists` }, { status: 409 });
    }

    if (status === "active") {
      const { data: activeContests } = await supabase
        .from("contests")
        .select("id, contest_number")
        .eq("status", "active");

      if (activeContests && activeContests.length > 0) {
        return jsonResponse(requestId,
          { error: `There is already an active contest (Contest #${activeContests[0].contest_number}). Archive it first.` },
          { status: 409 }
        );
      }
    }

    const { data: newContest, error: insertError } = await supabase
      .from("contests")
      .insert({
        contest_number,
        title: title ?? `Contest #${contest_number}`,
        description: description ?? null,
        start_date: new Date(start_date).toISOString(),
        end_date: new Date(end_date).toISOString(),
        status,
        artwork_count,
      })
      .select()
      .single();

    if (insertError) {
      logger.error({ requestId, error: insertError }, 'contest creation error');
      return jsonResponse(requestId, { error: "Failed to create contest" }, { status: 500 });
    }

    logger.info({ requestId, ms: Date.now() - start, contestId: newContest.id }, 'contest created');
    return jsonResponse(requestId, { success: true, contest: newContest });
  } catch (error) {
    logger.error({ requestId, ms: Date.now() - start, error }, 'admin contests unhandled error');
    return jsonResponse(requestId, { error: "Internal server error" }, { status: 500 });
  }
}
