import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";
import { z } from "zod";

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  const requestId = generateRequestId();
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return jsonResponse(requestId, { error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();

  const { data, error, count } = await supabase
    .from("comments")
    .select("id, artwork_id, parent_id, author_name, author_email, body, is_admin_reply, is_approved, created_at, artworks(title)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error({ requestId, error }, "admin comments fetch failed");
    return jsonResponse(requestId, { error: "Failed to fetch comments" }, { status: 500 });
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

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return jsonResponse(requestId, { groups, page, totalPages, totalCount });
}

const AdminReplySchema = z.object({
  artwork_id: z.string().uuid(),
  parent_id: z.string().uuid(),
  body: z.string().min(5).max(500),
});

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return jsonResponse(requestId, { error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return jsonResponse(requestId, { error: "Invalid JSON" }, { status: 400 });
  }

  const result = AdminReplySchema.safeParse(body);
  if (!result.success) {
    return jsonResponse(requestId, { error: "Invalid input", details: result.error.issues }, { status: 400 });
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
    return jsonResponse(requestId, { error: "Failed to post reply" }, { status: 500 });
  }

  return jsonResponse(requestId, { success: true }, { status: 201 });
}
