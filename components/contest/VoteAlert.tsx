"use client";

interface VoteAlertProps {
  artworkTitle: string;
}

export function VoteAlert({ artworkTitle }: VoteAlertProps) {
  return (
    <div
      style={{
        background: "rgba(6,182,212,0.08)", /* card-accent-2 dim — no token for this alpha */
        border: "1px solid rgba(6,182,212,0.2)",
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
