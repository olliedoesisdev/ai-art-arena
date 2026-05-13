export default function ProfileLoading() {
  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "24px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--color-bg-surface2)", flexShrink: 0 }} />
            <div style={{ flex: 1, paddingTop: "4px" }}>
              <div style={{ height: "28px", background: "var(--color-bg-surface2)", borderRadius: "6px", width: "180px", marginBottom: "10px" }} />
              <div style={{ height: "14px", background: "var(--color-bg-surface2)", borderRadius: "4px", width: "140px", marginBottom: "12px" }} />
              <div style={{ height: "14px", background: "var(--color-bg-surface2)", borderRadius: "4px", width: "260px" }} />
            </div>
          </div>
          <div style={{ height: "1px", background: "var(--color-border-subtle)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ height: "88px", background: "var(--color-bg-surface)", borderRadius: "10px", border: "1px solid var(--color-border-subtle)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
