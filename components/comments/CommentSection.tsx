import { createPublicClient } from "@/lib/supabase/server";
import { Comment, CommentThread, ReactionCounts, ReactionEmoji } from "@/lib/types";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";

interface Props {
  artworkId: string;
}

const EMPTY_COUNTS: ReactionCounts = { like: 0, love: 0, laugh: 0, wow: 0 };

function buildCounts(rows: { emoji: string }[]): ReactionCounts {
  const counts = { ...EMPTY_COUNTS };
  for (const row of rows) {
    counts[row.emoji as ReactionEmoji]++;
  }
  return counts;
}

export async function CommentSection({ artworkId }: Props) {
  const supabase = createPublicClient();

  // Fetch comments first, then reactions in parallel with nothing else depending on them
  const { data: commentData, error } = await supabase
    .from("comments")
    .select("id, artwork_id, parent_id, author_name, body, is_admin_reply, is_approved, created_at")
    .eq("artwork_id", artworkId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) return null;

  const rows = (commentData ?? []) as Comment[];
  const commentIds = rows.map((c) => c.id);

  // Fetch reactions for all comments in one query
  const { data: reactionData } = commentIds.length > 0
    ? await supabase
        .from("comment_reactions")
        .select("comment_id, emoji")
        .in("comment_id", commentIds)
    : { data: [] };

  // Index reactions by comment_id
  const reactionsByComment = new Map<string, { emoji: string }[]>();
  for (const row of reactionData ?? []) {
    const list = reactionsByComment.get(row.comment_id) ?? [];
    list.push({ emoji: row.emoji });
    reactionsByComment.set(row.comment_id, list);
  }

  const topLevel = rows.filter((c) => c.parent_id === null);
  const threads: CommentThread[] = topLevel.map((comment) => {
    const replies = rows.filter((c) => c.parent_id === comment.id);
    return {
      comment,
      replies,
      reactions: buildCounts(reactionsByComment.get(comment.id) ?? []),
      replyReactions: replies.map((r) => buildCounts(reactionsByComment.get(r.id) ?? [])),
    };
  });

  const count = threads.reduce((n, t) => n + 1 + t.replies.length, 0);

  return (
    <section>
      {/* Section header */}
      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a78bfa",
            marginBottom: "6px",
          }}
        >
          Discussion
        </p>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "#eeeeff",
            margin: 0,
          }}
        >
          {count === 0
            ? "Comments"
            : count === 1
            ? "1 comment"
            : `${count} comments`}
        </h2>
      </div>

      {/* Thread list */}
      <div style={{ marginBottom: "32px" }}>
        <CommentList threads={threads} />
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(139,92,246,0.12)", marginBottom: "28px" }} />

      {/* Submit form */}
      <div
        style={{
          background: "#111119",
          border: "1px solid rgba(139,92,246,0.12)",
          borderRadius: "14px",
          padding: "24px",
        }}
      >
        <p
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#eeeeff",
            marginBottom: "20px",
          }}
        >
          Leave a comment
        </p>
        <CommentForm artworkId={artworkId} />
      </div>
    </section>
  );
}
