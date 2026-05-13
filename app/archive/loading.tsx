const pulse: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-surface2) 50%, var(--color-bg-surface) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: "8px",
};

export default function ArchiveLoading() {
  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px", background: "var(--color-bg-base)", minHeight: "100vh" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div className="shell">

        {/* Page header */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ ...pulse, height: "11px", width: "80px", marginBottom: "16px" }} />
          <div style={{ ...pulse, height: "40px", width: "240px", marginBottom: "12px" }} />
          <div style={{ ...pulse, height: "16px", width: "320px" }} />
        </div>

        {/* Archive grid â€” 4 columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1.5px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              <div style={{ ...pulse, aspectRatio: "4/3", borderRadius: 0 }} />
              <div style={{ padding: "16px" }}>
                <div style={{ ...pulse, height: "11px", width: "60px", marginBottom: "10px" }} />
                <div style={{ ...pulse, height: "18px", width: "80%", marginBottom: "8px" }} />
                <div style={{ ...pulse, height: "13px", width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
