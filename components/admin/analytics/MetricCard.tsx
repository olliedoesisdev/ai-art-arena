interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function MetricCard({ label, value, sub, color = "#8b5cf6" }: Props) {
  return (
    <div style={{
      background: "#111119",
      border: "1px solid rgba(139,92,246,0.12)",
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
      <div style={{ fontSize: "0.8125rem", color: "#7878a0" }}>{label}</div>
      {sub && (
        <div style={{ fontSize: "0.75rem", color: "#3a3a58", fontFamily: "var(--font-dm-mono)", marginTop: "4px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
