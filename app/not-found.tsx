import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "400px" }}>
        <div
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-purple)",
            marginBottom: "16px",
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
            marginBottom: "12px",
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.65,
            marginBottom: "36px",
          }}
        >
          This page doesn&apos;t exist or was moved.
        </p>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: "var(--color-bg-base)",
            background: "var(--color-status-warning)",
            padding: "11px 28px",
            borderRadius: "100px",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
