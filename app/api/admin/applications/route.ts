import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";

export async function GET() {
  const requestId = generateRequestId();
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return jsonResponse(requestId, { error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("artist_applications")
    .select("*")
    .order("applied_at", { ascending: false });

  if (error) {
    logger.error({ requestId, error }, "applications fetch failed");
    return jsonResponse(requestId, { error: "Failed to fetch applications" }, { status: 500 });
  }

  return jsonResponse(requestId, { applications: data ?? [] });
}
