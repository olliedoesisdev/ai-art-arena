export default function GlobalLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "2px solid rgba(139,92,246,0.15)",
            borderTopColor: "var(--color-purple)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "12px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-dim)",
          }}
        >
          Loading
        </span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
