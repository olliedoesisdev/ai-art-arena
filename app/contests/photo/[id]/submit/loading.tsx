// app/contests/photo/[id]/submit/loading.tsx [SERVER]
const pulse: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-surface2) 50%, var(--color-bg-surface) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: "8px",
};

export default function PhotoSubmitLoading() {
  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div className="shell" style={{ maxWidth: "640px" }}>
        <div style={{ ...pulse, height: "13px", width: "100px", marginBottom: "32px" }} />
        <div style={{ ...pulse, height: "20px", width: "80px", marginBottom: "12px" }} />
        <div style={{ ...pulse, height: "32px", width: "300px", marginBottom: "24px" }} />
        <div style={{ ...pulse, aspectRatio: "4/3", borderRadius: "12px", marginBottom: "20px" }} />
        <div style={{ ...pulse, height: "44px", borderRadius: "8px", marginBottom: "16px" }} />
        <div style={{ ...pulse, height: "80px", borderRadius: "8px", marginBottom: "16px" }} />
        <div style={{ ...pulse, height: "48px", borderRadius: "8px" }} />
      </div>
    </div>
  );
}
