const pulse: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-surface2) 50%, var(--color-bg-surface) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: "8px",
};

export default function SignInLoading() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ ...pulse, height: "28px", width: "160px", margin: "0 auto 12px" }} />
          <div style={{ ...pulse, height: "16px", width: "220px", margin: "0 auto" }} />
        </div>
        <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "14px", padding: "32px" }}>
          <div style={{ ...pulse, height: "40px", borderRadius: "8px", marginBottom: "28px" }} />
          <div style={{ ...pulse, height: "14px", width: "60px", marginBottom: "8px" }} />
          <div style={{ ...pulse, height: "40px", borderRadius: "8px", marginBottom: "16px" }} />
          <div style={{ ...pulse, height: "14px", width: "60px", marginBottom: "8px" }} />
          <div style={{ ...pulse, height: "40px", borderRadius: "8px", marginBottom: "16px" }} />
          <div style={{ ...pulse, height: "44px", borderRadius: "8px", marginTop: "8px" }} />
        </div>
      </div>
    </div>
  );
}
