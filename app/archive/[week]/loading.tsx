const pulse: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-surface2) 50%, var(--color-bg-surface) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: "8px",
};

export default function ArchiveWeekLoading() {
  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px", minHeight: "100vh" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div className="shell">

        {/* Back link */}
        <div style={{ ...pulse, height: "13px", width: "72px", marginBottom: "32px" }} />

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ ...pulse, height: "11px", width: "160px", marginBottom: "12px" }} />
          <div style={{ ...pulse, height: "44px", width: "280px", marginBottom: "16px" }} />
          <div style={{ ...pulse, height: "20px", width: "120px" }} />
        </div>

        {/* Winner spotlight */}
        <div style={{
          display: "flex",
          gap: "28px",
          alignItems: "center",
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-status-warning-border)",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "40px",
        }}>
          <div style={{ ...pulse, width: "140px", height: "140px", flexShrink: 0, borderRadius: "8px" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...pulse, height: "22px", width: "120px", marginBottom: "12px" }} />
            <div style={{ ...pulse, height: "18px", width: "200px", marginBottom: "8px" }} />
            <div style={{ ...pulse, height: "14px", width: "280px", marginBottom: "10px" }} />
            <div style={{ ...pulse, height: "14px", width: "80px" }} />
          </div>
        </div>

        {/* Standings label */}
        <div style={{ ...pulse, height: "11px", width: "100px", marginBottom: "20px" }} />

        {/* Result rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--color-border-subtle)", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--color-border-subtle)" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", background: "var(--color-bg-surface)" }}>
              <div style={{ ...pulse, width: "24px", height: "14px", borderRadius: "4px" }} />
              <div style={{ ...pulse, width: "48px", height: "48px", flexShrink: 0, borderRadius: "6px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...pulse, height: "13px", width: "60%", marginBottom: "8px" }} />
                <div style={{ ...pulse, height: "3px", width: `${80 - i * 12}%`, borderRadius: "100px" }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...pulse, height: "14px", width: "40px", marginBottom: "4px" }} />
                <div style={{ ...pulse, height: "11px", width: "32px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
