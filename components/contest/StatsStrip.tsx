interface StatsStripProps {
  totalVotes: number;
  artworkCount: number;
}

export function StatsStrip({ totalVotes, artworkCount }: StatsStripProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        alignItems: "center",
        padding: "12px 20px",
        background: "#111119",
        border: "1px solid rgba(139,92,246,0.12)",
        borderRadius: "8px",
        marginBottom: "32px",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontWeight: 500,
            fontSize: "1.25rem",
            color: "#eeeeff",
          }}
        >
          {totalVotes.toLocaleString()}
        </span>
        <span style={{ fontSize: "0.8125rem", color: "#7878a0" }}>votes cast</span>
      </div>
      <div
        style={{
          width: "1px",
          height: "16px",
          background: "rgba(139,92,246,0.2)",
          flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontWeight: 500,
            fontSize: "1.25rem",
            color: "#eeeeff",
          }}
        >
          {artworkCount}
        </span>
        <span style={{ fontSize: "0.8125rem", color: "#7878a0" }}>artworks competing</span>
      </div>
    </div>
  );
}
