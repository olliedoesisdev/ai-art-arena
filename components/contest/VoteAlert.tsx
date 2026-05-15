"use client";

interface VoteAlertProps {
  artworkTitle: string;
}

export function VoteAlert({ artworkTitle }: VoteAlertProps) {
  return (
    <div
      style={{
        background: "var(--color-card-accent-2-dim)",
        border: "1px solid var(--color-card-accent-2-border)",
        borderRadius: "10px",
        padding: "12px 18px",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontFamily: "var(--font-dm-mono)",
        fontSize: "13px",
        color: "var(--color-card-accent-2)",
        animation: "slideDown 0.3s ease",
      }}
    >
      <span>✓</span>
      <span>
        Vote submitted for{" "}
        <span style={{ color: "var(--color-text)" }}>{artworkTitle}</span>
        {" "}— results update live.
      </span>
    </div>
  );
}
