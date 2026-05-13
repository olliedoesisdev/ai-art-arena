"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ActivityFeedItem, ActivityType } from "@/lib/types";

function useRelativeTime(dateStr: string): string {
  const [label, setLabel] = useState("");
  useEffect(() => {
    function compute() {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      const hrs = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      if (hrs < 24) return `${hrs}h ago`;
      if (days < 7) return `${days}d ago`;
      return `${Math.floor(days / 7)}w ago`;
    }
    setLabel(compute());
    const id = setInterval(() => setLabel(compute()), 60000);
    return () => clearInterval(id);
  }, [dateStr]);
  return label;
}

function dateBucket(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();
  if (d.toDateString() === todayStr) return "Today";
  if (d.toDateString() === yesterdayStr) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function VoteItem({ item, index }: { item: ActivityFeedItem; index: number }) {
  const timeLabel = useRelativeTime(item.activity_at);
  const href = item.contest_status === "active"
    ? `/contest/${item.contest_id}`
    : `/archive/${item.contest_week}`;

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "14px 16px",
          background: "var(--color-bg-base)",
          border: "1px solid rgba(139,92,246,0.08)",
          borderRadius: "12px",
          transition: "border-color 0.15s, background 0.15s",
          animationDelay: `${index * 30}ms`,
        }}
        className="feed-item-enter"
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "var(--color-border-mid)";
          el.style.background = "var(--color-bg-surface)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(139,92,246,0.08)";
          el.style.background = "var(--color-bg-base)";
        }}
      >
        {/* Type indicator */}
        <div style={{ flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 12V3M3 6l4-4 4 4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Thumbnail */}
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
          background: "var(--color-bg-surface3)",
          border: "1px solid rgba(139,92,246,0.1)",
        }}>
          {item.artwork_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.artwork_image_url}
              alt={item.artwork_title ?? ""}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-syne)",
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--color-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: "3px",
          }}>
            {item.artwork_title}
          </div>
          <div style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "10px",
            fontWeight: 700,
            color: "var(--color-status-success)",
            letterSpacing: "0.06em",
          }}>
            Voted on Week {item.contest_week}
          </div>
        </div>

        {/* Time + arrow */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-dim)" }}>
            {timeLabel}
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6h7M6.5 3L9.5 6l-3 3" stroke="#34d399" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </Link>
  );
}

function CommentItem({ item, index }: { item: ActivityFeedItem; index: number }) {
  const timeLabel = useRelativeTime(item.activity_at);
  const [expanded, setExpanded] = useState(false);
  const href = item.contest_status === "active"
    ? `/contest/${item.contest_id}`
    : `/archive/${item.contest_week}`;
  const body = item.comment_body ?? "";
  const isLong = body.length > 200;

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          padding: "14px 16px",
          background: "var(--color-bg-base)",
          border: "1px solid rgba(139,92,246,0.08)",
          borderLeft: "3px solid rgba(192,132,252,0.6)",
          borderRadius: "12px",
          transition: "border-color 0.15s, background 0.15s",
          animationDelay: `${index * 30}ms`,
        }}
        className="feed-item-enter"
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "var(--color-border-mid)";
          el.style.borderLeftColor = "var(--color-purple-light)";
          el.style.background = "var(--color-bg-surface)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(139,92,246,0.08)";
          el.style.borderLeftColor = "rgba(192,132,252,0.6)";
          el.style.background = "var(--color-bg-base)";
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M1 1.5h10a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5H4l-3 2V2a.5.5 0 0 1 .5-.5z" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "10px",
            fontWeight: 700,
            color: "var(--color-purple-light)",
            letterSpacing: "0.06em",
          }}>
            Commented on Week {item.contest_week}
          </span>
          <span style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            color: "var(--color-text-dim)",
            marginLeft: "auto",
          }}>
            {timeLabel}
          </span>
        </div>

        {/* Body */}
        <p style={{
          color: "var(--color-text-muted)",
          fontSize: "13px",
          lineHeight: 1.65,
          margin: 0,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: expanded ? undefined : 3,
          WebkitBoxOrient: "vertical",
        }}>
          {body}
        </p>

        {isLong && (
          <span
            onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
            style={{
              display: "inline-block",
              marginTop: "4px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--color-purple-light)",
              cursor: "pointer",
              letterSpacing: "0.06em",
            }}
          >
            {expanded ? "Show less" : "Show more"}
          </span>
        )}
      </div>
    </Link>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
      <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.08)" }} />
      <span style={{
        fontFamily: "var(--font-dm-mono)",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#3a3a58",
        whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.08)" }} />
    </div>
  );
}

type Filter = "all" | ActivityType;

interface Props {
  activityFeed: ActivityFeedItem[];
  totalVotes: number;
  totalComments: number;
}

export function ActivityFeed({ activityFeed, totalVotes, totalComments }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all"
    ? activityFeed
    : activityFeed.filter((a) => a.activity_type === filter);

  // Group by date bucket
  const groups: { label: string; items: ActivityFeedItem[] }[] = [];
  for (const item of filtered) {
    const label = dateBucket(item.activity_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }

  const filterBtnStyle = (f: Filter): React.CSSProperties => ({
    background: "none",
    border: "none",
    borderBottom: filter === f ? "2px solid var(--color-purple-light)" : "2px solid transparent",
    color: filter === f ? "var(--color-purple-light)" : "var(--color-text-muted)",
    fontFamily: "var(--font-dm-mono)",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    padding: "8px 0",
    transition: "color 0.15s, border-color 0.15s",
    marginBottom: "-1px",
  });

  let flatIndex = 0;

  return (
    <div>
      {/* Heading + stat pills */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2 style={{
          fontFamily: "var(--font-syne)",
          fontSize: "1.125rem",
          fontWeight: 800,
          color: "var(--color-text)",
          letterSpacing: "-0.02em",
          margin: 0,
        }}>
          Activity
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { label: `${totalVotes} votes` },
            { label: `${totalComments} comments` },
          ].map(({ label }) => (
            <span key={label} style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-dim)",
              background: "var(--color-bg-base)",
              border: "1px solid rgba(139,92,246,0.1)",
              padding: "3px 10px",
              borderRadius: "100px",
            }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        display: "flex",
        gap: "20px",
        borderBottom: "1px solid rgba(139,92,246,0.1)",
        marginBottom: "20px",
      }}>
        <button style={filterBtnStyle("all")} onClick={() => setFilter("all")}>All</button>
        <button style={filterBtnStyle("vote")} onClick={() => setFilter("vote")}>Votes</button>
        <button style={filterBtnStyle("comment")} onClick={() => setFilter("comment")}>Comments</button>
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "13px", color: "#3a3a58", fontStyle: "italic" }}>
            No activity yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {groups.map((group) => (
            <div key={group.label}>
              <DateDivider label={group.label} />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                {group.items.map((item) => {
                  const i = flatIndex++;
                  return item.activity_type === "vote"
                    ? <VoteItem key={item.activity_id} item={item} index={i} />
                    : <CommentItem key={item.activity_id} item={item} index={i} />;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .feed-item-enter {
          animation: feedFadeIn 0.3s ease both;
        }
        @keyframes feedFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
