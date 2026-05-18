"use client";

import { useState } from "react";
import { toast } from "sonner";

interface ShareResultButtonProps {
  contestNumber: number;
  winnerTitle: string;
  archiveUrl: string;
}

export function ShareResultButton({
  contestNumber,
  winnerTitle,
  archiveUrl,
}: ShareResultButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = `Contest #${contestNumber} winner on AI Art Arena: "${winnerTitle}" ${archiveUrl}`;

    if (
      typeof navigator !== "undefined" &&
      "share" in navigator &&
      /Mobi|Android/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({
          title: `AI Art Arena — Contest #${contestNumber} Winner`,
          text: `"${winnerTitle}" won Contest #${contestNumber}`,
          url: archiveUrl,
        });
        return;
      } catch {
        // User cancelled or not supported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Result link copied");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 20px",
        background: copied ? "rgba(139,92,246,0.12)" : "var(--color-purple-dim2)",
        border: `1px solid ${copied ? "rgba(139,92,246,0.5)" : "var(--color-border-subtle)"}`,
        borderRadius: "100px",
        fontFamily: "var(--font-dm-mono)",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: copied ? "var(--color-purple-light)" : "var(--color-text-muted)",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? "COPIED ✓" : "SHARE RESULT →"}
    </button>
  );
}
