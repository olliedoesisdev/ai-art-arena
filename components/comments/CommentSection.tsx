import { createPublicClient } from "@/lib/supabase/server";
import { Comment, CommentThread } from "@/lib/types";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";

interface Props {
  artworkId: string;
}

export async function CommentSection({ artworkId }: Props) {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("comments")
    .select("id, artwork_id, parent_id, author_name, body, is_admin_reply, is_approved, created_at")
    .eq("artwork_id", artworkId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    // Non-fatal — degrade gracefully
    return null;
  }

  const rows = (data ?? []) as Comment[];

  // Group into threads: top-level comments first, replies nested under parent
  const topLevel = rows.filter((c) => c.parent_id === null);
  const threads: CommentThread[] = topLevel.map((comment) => ({
    comment,
    replies: rows.filter((c) => c.parent_id === comment.id),
  }));

  const count = threads.reduce((n, t) => n + 1 + t.replies.length, 0);

  return (
    <section style={{ marginTop: "48px" }}>
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
