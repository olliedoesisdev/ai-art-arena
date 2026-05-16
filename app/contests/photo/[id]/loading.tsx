// app/contests/photo/[id]/loading.tsx [SERVER]
const pulse: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-surface2) 50%, var(--color-bg-surface) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: "8px",
};

export default function PhotoContestLoading() {
  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px", background: "var(--color-bg-base)", minHeight: "100vh" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div className="shell">
        <div style={{ marginBottom: "32px" }}>
          <div style={{ ...pulse, height: "11px", width: "100px", marginBottom: "16px" }} />
          <div style={{ ...pulse, height: "36px", width: "280px", marginBottom: "12px" }} />
          <div style={{ ...pulse, height: "20px", width: "200px" }} />
        </div>
        <div style={{ ...pulse, height: "40px", borderRadius: "10px", marginBottom: "32px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ ...pulse, aspectRatio: "1", borderRadius: 0 }} />
              <div style={{ padding: "16px" }}>
                <div style={{ ...pulse, height: "16px", width: "75%", marginBottom: "8px" }} />
                <div style={{ ...pulse, height: "11px", width: "55%", marginBottom: "14px" }} />
                <div style={{ ...pulse, height: "34px", borderRadius: "8px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
