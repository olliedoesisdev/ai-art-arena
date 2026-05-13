"use client";

import { useState } from "react";

type Emoji = "like" | "love" | "laugh" | "wow";

const REACTIONS: { emoji: Emoji; icon: string; label: string }[] = [
  { emoji: "like",  icon: "👍", label: "Like" },
  { emoji: "love",  icon: "❤️", label: "Love" },
  { emoji: "laugh", icon: "😂", label: "Haha" },
  { emoji: "wow",   icon: "😮", label: "Wow" },
];

interface Props {
  commentId: string;
  initialCounts: Record<Emoji, number>;
}

export function ReactionBar({ commentId, initialCounts }: Props) {
  const [counts, setCounts] = useState(initialCounts);
  // Track which emojis this session has toggled on (best-effort — resets on page reload)
  const [activeSet, setActiveSet] = useState<Set<Emoji>>(new Set());
  const [pending, setPending] = useState<Emoji | null>(null);

  async function handleReact(emoji: Emoji) {
    if (pending) return;
    setPending(emoji);

    const wasActive = activeSet.has(emoji);

    // Optimistic update
    setActiveSet((prev) => {
      const next = new Set(prev);
      wasActive ? next.delete(emoji) : next.add(emoji);
      return next;
    });
    setCounts((prev) => ({
      ...prev,
      [emoji]: wasActive ? Math.max(0, prev[emoji] - 1) : prev[emoji] + 1,
    }));

    try {
      const res = await fetch(`/api/comments/${commentId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });

      if (res.ok) {
        const data = await res.json() as { reacted: boolean; counts: Record<Emoji, number> };
        setCounts(data.counts);
        setActiveSet((prev) => {
          const next = new Set(prev);
          data.reacted ? next.add(emoji) : next.delete(emoji);
          return next;
        });
      } else {
        // Revert
        setActiveSet((prev) => {
          const next = new Set(prev);
          wasActive ? next.add(emoji) : next.delete(emoji);
          return next;
        });
        setCounts((prev) => ({
          ...prev,
          [emoji]: wasActive ? prev[emoji] + 1 : Math.max(0, prev[emoji] - 1),
        }));
      }
    } catch {
      // Revert on network error
      setActiveSet((prev) => {
        const next = new Set(prev);
        wasActive ? next.add(emoji) : next.delete(emoji);
        return next;
      });
      setCounts((prev) => ({
        ...prev,
        [emoji]: wasActive ? prev[emoji] + 1 : Math.max(0, prev[emoji] - 1),
      }));
    } finally {
      setPending(null);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginTop: "10px",
        flexWrap: "wrap",
      }}
    >
      {REACTIONS.map(({ emoji, icon, label }) => {
        const count = counts[emoji];
        const isActive = activeSet.has(emoji);
        const isLoading = pending === emoji;

        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            disabled={!!pending}
            title={label}
            aria-label={`${label}${count > 0 ? ` (${count})` : ""}`}
            aria-pressed={isActive}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: count > 0 ? "3px 10px 3px 6px" : "4px 8px",
              background: isActive
                ? "rgba(139,92,246,0.15)"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${
                isActive ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"
              }`,
              borderRadius: "100px",
              cursor: pending ? (isLoading ? "wait" : "default") : "pointer",
              transition: "background 0.15s, border-color 0.15s, transform 0.1s",
              transform: isActive ? "scale(1.06)" : "scale(1)",
              fontSize: "14px",
              lineHeight: 1,
              userSelect: "none",
              opacity: pending && !isLoading ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: "14px" }}>{icon}</span>
            {count > 0 && (
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-mono)",
                  fontWeight: 600,
                  color: isActive ? "var(--color-purple-light)" : "var(--color-text-muted)",
                  lineHeight: 1,
                  minWidth: "8px",
                  textAlign: "center",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
