import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { getClientIP, hashIP } from "@/lib/utils";
import { z } from "zod";

const VALID_EMOJIS = ["like", "love", "laugh", "wow"] as const;
type ReactionEmoji = (typeof VALID_EMOJIS)[number];

const ReactSchema = z.object({
  emoji: z.enum(VALID_EMOJIS),
});

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  const { id: commentId } = await params;

  if (!z.string().uuid().safeParse(commentId).success) {
    return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = ReactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
  }

  const { emoji } = result.data;
  const ipHash = hashIP(getClientIP(request));
  const supabase = createPublicClient();

  // Check if comment exists and is approved
  const { data: comment } = await supabase
    .from("comments")
    .select("id")
    .eq("id", commentId)
    .eq("is_approved", true)
    .single();

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // Check if this IP already reacted with this emoji (toggle off if so)
  const { data: existing } = await supabase
    .from("comment_reactions")
    .select("id")
    .eq("comment_id", commentId)
    .eq("emoji", emoji)
    .eq("ip_hash", ipHash)
    .single();

  if (existing) {
    // Toggle off — delete the reaction
    await supabase.from("comment_reactions").delete().eq("id", existing.id);
    const counts = await getReactionCounts(supabase, commentId);
    return NextResponse.json({ reacted: false, counts }, { status: 200 });
  }

  // Toggle on — insert
  await supabase.from("comment_reactions").insert({
    comment_id: commentId,
    emoji,
    ip_hash: ipHash,
  });

  const counts = await getReactionCounts(supabase, commentId);
  return NextResponse.json({ reacted: true, counts }, { status: 200 });
}

async function getReactionCounts(
  supabase: ReturnType<typeof createPublicClient>,
  commentId: string
): Promise<Record<ReactionEmoji, number>> {
  const { data } = await supabase
    .from("comment_reactions")
    .select("emoji")
    .eq("comment_id", commentId);

  const counts: Record<ReactionEmoji, number> = { like: 0, love: 0, laugh: 0, wow: 0 };
  for (const row of data ?? []) {
    counts[row.emoji as ReactionEmoji]++;
  }
  return counts;
}
