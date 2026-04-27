import { createClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { logger, generateRequestId } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: '/api/admin/contests' }, 'admin contests create request received');

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { week_number, start_date, end_date, status } = body;

    if (!week_number || !start_date || !end_date || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (status !== "active" && status !== "archived") {
      return NextResponse.json({ error: "Status must be 'active' or 'archived'" }, { status: 400 });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    const { data: existingContest } = await supabase
      .from("contests")
      .select("id")
      .eq("week_number", week_number)
      .single();

    if (existingContest) {
      return NextResponse.json({ error: `Week ${week_number} already exists` }, { status: 409 });
    }

    if (status === "active") {
      const { data: activeContests } = await supabase
        .from("contests")
        .select("id, week_number")
        .eq("status", "active");

      if (activeContests && activeContests.length > 0) {
        return NextResponse.json(
          { error: `There is already an active contest (Week ${activeContests[0].week_number}). Please archive it first.` },
          { status: 409 }
        );
      }
    }

    const { data: newContest, error: insertError } = await supabase
      .from("contests")
      .insert({ week_number, start_date: startDate.toISOString(), end_date: endDate.toISOString(), status })
      .select()
      .single();

    if (insertError) {
      logger.error({ requestId, error: insertError }, 'contest creation error');
      return NextResponse.json({ error: "Failed to create contest" }, { status: 500 });
    }

    logger.info({ requestId, ms: Date.now() - start, contestId: newContest.id }, 'contest created');
    return NextResponse.json({ success: true, contest: newContest });
  } catch (error) {
    logger.error({ requestId, ms: Date.now() - start, error }, 'admin contests unhandled error');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
