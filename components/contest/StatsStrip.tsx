interface StatsStripProps {
  totalVotes: number;
  artworkCount: number;
  startDate: string;
}

export function StatsStrip({ totalVotes, artworkCount, startDate }: StatsStripProps) {
  const hoursActive = Math.max(1, Math.round((Date.now() - new Date(startDate).getTime()) / 3600000));
  const timeLabel = hoursActive < 24
    ? `in ${hoursActive} hour${hoursActive !== 1 ? "s" : ""}`
    : `in ${Math.round(hoursActive / 24)} day${Math.round(hoursActive / 24) !== 1 ? "s" : ""}`;

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
        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
          votes cast {timeLabel}
        </span>
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
