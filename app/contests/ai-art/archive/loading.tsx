// app/contests/ai-art/archive/loading.tsx [SERVER]
const pulse: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-surface2) 50%, var(--color-bg-surface) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: "8px",
};

export default function AiArtArchiveLoading() {
  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div className="shell">
        <div style={{ ...pulse, height: "11px", width: "60px", marginBottom: "32px" }} />
        <div style={{ ...pulse, height: "11px", width: "80px", marginBottom: "16px" }} />
        <div style={{ ...pulse, height: "36px", width: "240px", marginBottom: "12px" }} />
        <div style={{ ...pulse, height: "16px", width: "320px", marginBottom: "48px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ ...pulse, aspectRatio: "1", borderRadius: 0 }} />
              <div style={{ padding: "16px 20px" }}>
                <div style={{ ...pulse, height: "16px", width: "60%", marginBottom: "8px" }} />
                <div style={{ ...pulse, height: "12px", width: "80%", marginBottom: "6px" }} />
                <div style={{ ...pulse, height: "12px", width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
