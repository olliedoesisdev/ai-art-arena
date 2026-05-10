export default function ProfileLoading() {
  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "24px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#181820", flexShrink: 0 }} />
            <div style={{ flex: 1, paddingTop: "4px" }}>
              <div style={{ height: "28px", background: "#181820", borderRadius: "6px", width: "180px", marginBottom: "10px" }} />
              <div style={{ height: "14px", background: "#181820", borderRadius: "4px", width: "140px", marginBottom: "12px" }} />
              <div style={{ height: "14px", background: "#181820", borderRadius: "4px", width: "260px" }} />
            </div>
          </div>
          <div style={{ height: "1px", background: "rgba(139,92,246,0.12)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ height: "88px", background: "#111119", borderRadius: "10px", border: "1px solid rgba(139,92,246,0.1)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
