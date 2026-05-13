interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function MetricCard({ label, value, sub, color = "var(--color-purple)" }: Props) {
  return (
    <div style={{
      background: "var(--color-bg-surface)",
      border: "1px solid var(--color-border-subtle)",
      borderRadius: "14px",
      padding: "20px 24px",
    }}>
      <div style={{
        fontFamily: "var(--font-dm-mono)",
        fontSize: "2rem",
        fontWeight: 700,
        color,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        marginBottom: "6px",
      }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{label}</div>
      {sub && (
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-dim)", fontFamily: "var(--font-dm-mono)", marginTop: "4px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
