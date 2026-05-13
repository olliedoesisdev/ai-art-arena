const pulse: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-surface2) 50%, var(--color-bg-surface) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: "8px",
};

export default function AboutLoading() {
  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px", background: "var(--color-bg-base)", minHeight: "100vh" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div className="shell">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "48px" }}>

          {/* Main content column */}
          <div style={{ maxWidth: "640px" }}>
            <div style={{ ...pulse, height: "11px", width: "60px", marginBottom: "16px" }} />
            <div style={{ ...pulse, height: "44px", width: "280px", marginBottom: "20px" }} />
            <div style={{ ...pulse, height: "16px", width: "100%", marginBottom: "8px" }} />
            <div style={{ ...pulse, height: "16px", width: "90%", marginBottom: "8px" }} />
            <div style={{ ...pulse, height: "16px", width: "75%", marginBottom: "40px" }} />

            <div style={{ ...pulse, height: "24px", width: "160px", marginBottom: "16px" }} />
            <div style={{ ...pulse, height: "14px", width: "100%", marginBottom: "8px" }} />
            <div style={{ ...pulse, height: "14px", width: "100%", marginBottom: "8px" }} />
            <div style={{ ...pulse, height: "14px", width: "80%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
