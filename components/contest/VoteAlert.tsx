"use client";

interface VoteAlertProps {
  artworkTitle: string;
}

export function VoteAlert({ artworkTitle }: VoteAlertProps) {
  return (
    <div
      style={{
        background: "rgba(6,182,212,0.08)",
        border: "1px solid rgba(6,182,212,0.2)",
        borderRadius: "10px",
        padding: "12px 18px",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontFamily: "var(--font-dm-mono)",
        fontSize: "13px",
        color: "#06b6d4",
        animation: "slideDown 0.3s ease",
      }}
    >
      <span>✓</span>
      <span>
        Vote submitted for{" "}
        <span style={{ color: "#eeeeff" }}>{artworkTitle}</span>
        {" "}— results update live.
      </span>
    </div>
  );
}
