"use client";

export default function ProfileError() {
  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#3a3a58",
          marginBottom: "12px",
        }}>
          Profile unavailable
        </p>
        <p style={{ color: "#7878a0", fontSize: "14px" }}>
          This profile could not be loaded. It may be private or deleted.
        </p>
      </div>
    </div>
  );
}
