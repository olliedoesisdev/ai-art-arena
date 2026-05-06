"use client";

interface VoteAlertProps {
  artworkTitle: string;
}

export function VoteAlert({ artworkTitle }: VoteAlertProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 20px",
        background: "rgba(52,211,153,0.08)",
        border: "1px solid rgba(52,211,153,0.2)",
        borderRadius: "8px",
        marginBottom: "32px",
        animation: "slideDown 0.3s ease",
      }}
    >
      <span
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#34d399",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "11px",
          color: "#08080e",
          fontWeight: 700,
        }}
      >
        ✓
      </span>
      <span style={{ fontSize: "0.875rem", color: "#34d399", fontWeight: 500 }}>
        You voted for{" "}
        <span style={{ color: "#eeeeff" }}>{artworkTitle}</span>
      </span>
    </div>
  );
}
