import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

// PATCH — toggle is_approved (or any admin-writable field)
const PatchSchema = z.object({
  is_approved: z.boolean().optional(),
  is_admin_reply: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const requestId = generateRequestId();
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return jsonResponse(requestId, { error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return jsonResponse(requestId, { error: "Invalid JSON" }, { status: 400 });
  }

  const result = PatchSchema.safeParse(body);
  if (!result.success) {
    return jsonResponse(requestId, { error: "Invalid input" }, { status: 400 });
  }

  if (Object.keys(result.data).length === 0) {
    return jsonResponse(requestId, { error: "Nothing to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("comments")
    .update(result.data)
    .eq("id", id);

  if (error) {
    logger.error({ requestId, id, error }, "comment patch failed");
    return jsonResponse(requestId, { error: "Update failed" }, { status: 500 });
  }

  return jsonResponse(requestId, { success: true });
}

// DELETE — remove a comment (cascades to replies via FK)
export async function DELETE(_request: Request, { params }: Params) {
  const requestId = generateRequestId();
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return jsonResponse(requestId, { error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id);

  if (error) {
    logger.error({ requestId, id, error }, "comment delete failed");
    return jsonResponse(requestId, { error: "Delete failed" }, { status: 500 });
  }

  return jsonResponse(requestId, { success: true });
}
