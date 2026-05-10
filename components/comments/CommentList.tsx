import { CommentThread, ReactionCounts } from "@/lib/types";
import { ReactionBar } from "./ReactionBar";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m} ${m === 1 ? "minute" : "minutes"} ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  }
  if (diff < 2592000) {
    const d = Math.floor(diff / 86400);
    return `${d} ${d === 1 ? "day" : "days"} ago`;
  }
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) {
  return avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl}
      alt={name}
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid rgba(139,92,246,0.2)",
        flexShrink: 0,
      }}
    />
  ) : (
    <div style={{
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      background: "#181820",
      border: "1px solid rgba(139,92,246,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontFamily: "var(--font-dm-mono)",
      fontSize: "11px",
      fontWeight: 700,
      color: "#a78bfa",
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function CommentBubble({
  id,
  authorName,
  avatarUrl,
  body,
  createdAt,
  isAdminReply,
  isReply,
  reactions,
}: {
  id: string;
  authorName: string;
  avatarUrl?: string | null;
  body: string;
  createdAt: string;
  isAdminReply: boolean;
  isReply: boolean;
  reactions: ReactionCounts;
}) {
  return (
    <div
      style={{
        background: isAdminReply ? "rgba(139,92,246,0.06)" : "#111119",
        border: isAdminReply
          ? "1px solid rgba(139,92,246,0.2)"
          : "1px solid rgba(139,92,246,0.1)",
        borderLeft: isAdminReply ? "3px solid #8b5cf6" : undefined,
        borderRadius: "10px",
        padding: "14px 16px",
        marginLeft: isReply ? "32px" : "0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
        <Avatar avatarUrl={avatarUrl} name={authorName} />
        <span style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: isAdminReply ? "#a78bfa" : "#eeeeff",
        }}>
          {authorName}
        </span>
        {isAdminReply && (
          <span style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#8b5cf6",
            background: "rgba(139,92,246,0.12)",
            padding: "2px 7px",
            borderRadius: "100px",
          }}>
            Admin
          </span>
        )}
        <span style={{ fontSize: "0.6875rem", color: "#3a3a58", fontFamily: "var(--font-dm-mono)", marginLeft: "auto" }}>
          {timeAgo(createdAt)}
        </span>
      </div>
      <p style={{ fontSize: "0.875rem", color: "#7878a0", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {body}
      </p>
      <ReactionBar commentId={id} initialCounts={reactions} />
    </div>
  );
}

interface Props {
  threads: CommentThread[];
}

export function CommentList({ threads }: Props) {
  if (threads.length === 0) {
    return (
      <p style={{ fontSize: "0.875rem", color: "#3a3a58", textAlign: "center", padding: "24px 0" }}>
        No comments yet. Be the first to share your thoughts.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {threads.map(({ comment, replies, reactions, replyReactions }) => (
        <div key={comment.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <CommentBubble
            id={comment.id}
            authorName={comment.author_name}
            avatarUrl={(comment as { avatar_url?: string | null }).avatar_url}
            body={comment.body}
            createdAt={comment.created_at}
            isAdminReply={comment.is_admin_reply}
            isReply={false}
            reactions={reactions}
          />
          {replies.map((reply, i) => (
            <CommentBubble
              key={reply.id}
              id={reply.id}
              authorName={reply.author_name}
              avatarUrl={(reply as { avatar_url?: string | null }).avatar_url}
              body={reply.body}
              createdAt={reply.created_at}
              isAdminReply={reply.is_admin_reply}
              isReply={true}
              reactions={replyReactions[i] ?? { like: 0, love: 0, laugh: 0, wow: 0 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
