export default function BlogPostLoading() {
  return (
    <div style={{ paddingTop: "56px", paddingBottom: "100px" }}>
      <div className="shell">
        <div style={{ width: "80px", height: "16px", background: "var(--color-bg-surface2)", borderRadius: "4px", marginBottom: "40px" }} />
        <div style={{ maxWidth: "740px" }}>
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
            {[60, 80, 70].map((w) => (
              <div key={w} style={{ width: `${w}px`, height: "22px", background: "var(--color-bg-surface2)", borderRadius: "100px" }} />
            ))}
          </div>
          <div style={{ height: "48px", background: "var(--color-bg-surface2)", borderRadius: "8px", marginBottom: "12px" }} />
          <div style={{ height: "32px", width: "70%", background: "var(--color-bg-surface2)", borderRadius: "8px", marginBottom: "32px" }} />
          <div style={{ height: "1px", background: "var(--color-border-subtle)", marginBottom: "48px" }} />
          {[100, 90, 95, 80, 100, 85].map((w, i) => (
            <div key={i} style={{ height: "18px", width: `${w}%`, background: "var(--color-bg-surface2)", borderRadius: "4px", marginBottom: "12px" }} />
          ))}
          <div style={{ height: "120px", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "10px", marginTop: "24px" }} />
        </div>
      </div>
    </div>
  );
}
