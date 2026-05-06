export function WinnerBadge() {
  return (
    <div
      style={{
        position: "absolute",
        top: "12px",
        left: "12px",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#fbbf24",
        background: "rgba(251,191,36,0.12)",
        border: "1px solid rgba(251,191,36,0.3)",
        padding: "4px 10px",
        borderRadius: "100px",
      }}
    >
      ★ Winner
    </div>
  );
}
