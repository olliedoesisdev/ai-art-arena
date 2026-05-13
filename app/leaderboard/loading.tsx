export default function LeaderboardLoading() {
  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <div style={{ width: "80px", height: "11px", background: "var(--color-bg-surface2)", borderRadius: "4px", marginBottom: "16px" }} />
        <div style={{ width: "260px", height: "40px", background: "var(--color-bg-surface2)", borderRadius: "8px", marginBottom: "48px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden" }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", background: "var(--color-bg-surface)" }}>
                <div style={{ width: "24px", height: "16px", background: "var(--color-bg-surface2)", borderRadius: "4px" }} />
                <div style={{ width: "52px", height: "52px", background: "var(--color-bg-surface2)", borderRadius: "6px", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: "60%", height: "14px", background: "var(--color-bg-surface2)", borderRadius: "4px", marginBottom: "6px" }} />
                  <div style={{ width: "30%", height: "11px", background: "var(--color-bg-surface2)", borderRadius: "4px" }} />
                </div>
                <div style={{ width: "40px", height: "20px", background: "var(--color-bg-surface2)", borderRadius: "4px" }} />
              </div>
            ))}
          </div>
          <div style={{ background: "var(--color-bg-surface)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ aspectRatio: "1", background: "var(--color-bg-surface2)" }} />
            <div style={{ padding: "20px" }}>
              <div style={{ width: "70%", height: "18px", background: "var(--color-bg-surface2)", borderRadius: "4px", marginBottom: "10px" }} />
              <div style={{ width: "40%", height: "13px", background: "var(--color-bg-surface2)", borderRadius: "4px" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
