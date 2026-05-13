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
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
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
            color: "var(--color-text)",
          }}
        >
          {totalVotes.toLocaleString()}
        </span>
        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>votes cast</span>
      </div>
      <div
        style={{
          width: "1px",
          height: "16px",
          background: "var(--color-border-mid)",
          flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontWeight: 500,
            fontSize: "1.25rem",
            color: "var(--color-text)",
          }}
        >
          {artworkCount}
        </span>
        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>artworks competing</span>
      </div>
    </div>
  );
}
