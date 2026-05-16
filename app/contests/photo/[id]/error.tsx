"use client";
// app/contests/photo/[id]/error.tsx [CLIENT]
import { useEffect } from "react";
import Link from "next/link";

export default function PhotoContestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ paddingTop: "80px", paddingBottom: "80px", textAlign: "center" }}>
      <div className="shell">
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-status-error)", marginBottom: "16px" }}>
          Error
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "2rem", color: "var(--color-text)", marginBottom: "12px" }}>
          Something went wrong
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "15px", marginBottom: "32px" }}>
          Could not load this contest. Try again or return to the contests page.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              background: "var(--color-purple)",
              border: "none",
              borderRadius: "8px",
              color: "var(--color-text)",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/contests"
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid var(--color-border-mid)",
              borderRadius: "8px",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            All contests
          </Link>
        </div>
      </div>
    </div>
  );
}
