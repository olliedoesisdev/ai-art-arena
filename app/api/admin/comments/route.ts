import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { logger, generateRequestId } from "@/lib/logger";
import { z } from "zod";

// GET — list all comments grouped by artwork (admin only)
export async function GET() {
  const requestId = generateRequestId();
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("comments")
    .select("id, artwork_id, parent_id, author_name, author_email, body, is_admin_reply, is_approved, created_at, artworks(title)")
    .order("created_at", { ascending: true });

  if (error) {
    logger.error({ requestId, error }, "admin comments fetch failed");
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }

  type RawRow = {
    id: string;
    artwork_id: string;
    parent_id: string | null;
    author_name: string;
    author_email: string | null;
    body: string;
    is_admin_reply: boolean;
    is_approved: boolean;
    created_at: string;
    artworks: { title: string } | { title: string }[] | null;
  };

  const rows = ((data ?? []) as RawRow[]).map((r) => ({
    id: r.id,
    artwork_id: r.artwork_id,
    parent_id: r.parent_id,
    author_name: r.author_name,
    author_email: r.author_email,
    body: r.body,
    is_admin_reply: r.is_admin_reply,
    is_approved: r.is_approved,
    created_at: r.created_at,
    artwork_title: Array.isArray(r.artworks)
      ? (r.artworks[0]?.title ?? "Unknown")
      : (r.artworks?.title ?? "Unknown"),
  }));

  // Group by artwork_id, preserving insertion order
  const map = new Map<string, typeof rows>();
  for (const row of rows) {
    if (!map.has(row.artwork_id)) map.set(row.artwork_id, []);
    map.get(row.artwork_id)!.push(row);
  }

  const groups = Array.from(map.entries()).map(([artwork_id, comments]) => ({
    artwork_id,
    artwork_title: comments[0]?.artwork_title ?? "Unknown",
    comments,
  }));

  return NextResponse.json({ groups });
}

// POST — insert an admin reply (auto-approved, is_admin_reply = true)
const AdminReplySchema = z.object({
  artwork_id: z.string().uuid(),
  parent_id: z.string().uuid(),
  body: z.string().min(5).max(500),
});

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = AdminReplySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.issues }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("comments").insert({
    artwork_id: result.data.artwork_id,
    parent_id: result.data.parent_id,
    author_name: "Admin",
    body: result.data.body,
    is_admin_reply: true,
    is_approved: true,
  });

  if (error) {
    logger.error({ requestId, error }, "admin reply insert failed");
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
