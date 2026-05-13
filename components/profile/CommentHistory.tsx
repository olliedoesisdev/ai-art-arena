"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CommentHistoryItem } from "@/lib/types";

function useRelativeTime(dateStr: string): string {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    function compute() {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      const hrs = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      const weeks = Math.floor(days / 7);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      if (hrs < 24) return `${hrs}h ago`;
      if (days < 7) return `${days}d ago`;
      return `${weeks}w ago`;
    }
    setLabel(compute());
    const id = setInterval(() => setLabel(compute()), 60000);
    return () => clearInterval(id);
  }, [dateStr]);

  return label;
}

function CommentCard({ comment }: { comment: CommentHistoryItem }) {
  const timeLabel = useRelativeTime(comment.commented_at);
  const href = comment.contest_status === "active"
    ? `/contest/${comment.contest_id}`
    : `/archive/${comment.contest_week}`;

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          padding: "16px 18px",
          background: "var(--color-bg-base)",
          border: "1px solid rgba(139,92,246,0.08)",
          borderLeft: "3px solid rgba(192,132,252,0.5)",
          borderRadius: "12px",
          transition: "border-color 0.2s, background 0.2s, border-left-color 0.2s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "var(--color-border-mid)";
          el.style.borderLeftColor = "var(--color-purple-light)";
          el.style.background = "var(--color-bg-surface)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(139,92,246,0.08)";
          el.style.borderLeftColor = "rgba(192,132,252,0.5)";
          el.style.background = "var(--color-bg-base)";
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-purple-light)",
              background: "rgba(139,92,246,0.1)",
              padding: "2px 7px",
              borderRadius: "100px",
            }}>
              Week {comment.contest_week}
            </span>
            {comment.contest_status === "active" && (
              <span style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-status-success)",
                background: "rgba(52,211,153,0.08)",
                padding: "2px 7px",
                borderRadius: "100px",
              }}>
                Live
              </span>
            )}
          </div>
          <span style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            color: "var(--color-text-dim)",
            flexShrink: 0,
          }}>
            {timeLabel}
          </span>
        </div>

        {/* Comment body */}
        <p style={{
          color: "var(--color-text-muted)",
          fontSize: "14px",
          lineHeight: 1.65,
          margin: 0,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
        }}>
          {comment.comment_body}
        </p>

        {/* Footer â€” view link hint */}
        <div style={{
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontFamily: "var(--font-dm-mono)",
          fontSize: "10px",
          color: "var(--color-text-dim)",
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5h7M5.5 2L8.5 5l-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          View contest
        </div>
      </div>
    </Link>
  );
}

interface Props {
  comments: CommentHistoryItem[];
}

export function CommentHistory({ comments }: Props) {
  if (comments.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7l-4 3V5a1 1 0 0 1 1-1z" stroke="var(--color-purple)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "13px",
          color: "var(--color-text-dim)",
          fontStyle: "italic",
        }}>
          No comments yet.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {comments.map((comment) => (
        <CommentCard key={comment.comment_id} comment={comment} />
      ))}
    </div>
  );
}
