"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { VoteHistoryItem } from "@/lib/types";

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

function VoteCard({ vote }: { vote: VoteHistoryItem }) {
  const timeLabel = useRelativeTime(vote.voted_at);
  const href = vote.contest_status === "active"
    ? `/contest/${vote.contest_id}`
    : `/archive/${vote.contest_week}`;

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "14px",
          background: "#0d0d14",
          border: "1px solid rgba(139,92,246,0.08)",
          borderRadius: "12px",
          transition: "border-color 0.2s, background 0.2s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(139,92,246,0.28)";
          el.style.background = "#111119";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(139,92,246,0.08)";
          el.style.background = "#0d0d14";
        }}
      >
        {/* Thumbnail */}
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "10px",
          overflow: "hidden",
          flexShrink: 0,
          background: "#181820",
          border: "1px solid rgba(139,92,246,0.12)",
        }}>
          {vote.artwork_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vote.artwork_image_url}
              alt={vote.artwork_title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "rgba(139,92,246,0.06)" }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-syne)",
            fontSize: "14px",
            fontWeight: 700,
            color: "#eeeeff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: "5px",
          }}>
            {vote.artwork_title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#a78bfa",
              background: "rgba(139,92,246,0.1)",
              padding: "2px 7px",
              borderRadius: "100px",
            }}>
              Week {vote.contest_week}
            </span>
            {vote.contest_status === "active" && (
              <span style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#34d399",
                background: "rgba(52,211,153,0.08)",
                padding: "2px 7px",
                borderRadius: "100px",
              }}>
                Live
              </span>
            )}
          </div>
        </div>

        {/* Time */}
        <div style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "11px",
          color: "#3a3a58",
          flexShrink: 0,
        }}>
          {timeLabel}
        </div>

        {/* Arrow */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: "#3a3a58" }}>
          <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}

interface Props {
  votes: VoteHistoryItem[];
}

export function VoteHistory({ votes }: Props) {
  if (votes.length === 0) {
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
            <path d="M10 3l2.5 5 5.5.8-4 3.9.94 5.5L10 15.7l-4.94 2.5.94-5.5L2 8.8l5.5-.8L10 3z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "13px",
          color: "#3a3a58",
          fontStyle: "italic",
        }}>
          No votes cast yet.
        </p>
      </div>
    );
  }

  // Group by contest week
  const grouped = new Map<number, VoteHistoryItem[]>();
  for (const vote of votes) {
    const week = vote.contest_week;
    if (!grouped.has(week)) grouped.set(week, []);
    grouped.get(week)!.push(vote);
  }
  const sortedWeeks = [...grouped.keys()].sort((a, b) => b - a);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {sortedWeeks.map((week) => (
        <div key={week}>
          {/* Week divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "10px",
          }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.08)" }} />
            <span style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#3a3a58",
            }}>
              Week {String(week).padStart(2, "0")}
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.08)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {grouped.get(week)!.map((vote) => (
              <VoteCard key={vote.vote_id} vote={vote} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
