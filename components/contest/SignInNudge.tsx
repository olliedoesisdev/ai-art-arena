"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DISMISSED_KEY = "sign_in_nudge_dismissed";

interface SignInNudgeProps {
  callbackPath: string;
}

export function SignInNudge({ callbackPath }: SignInNudgeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(DISMISSED_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch { /* blocked */ }
    setVisible(false);
  }

  if (!visible) return null;

  const signInUrl = `/signin?callbackUrl=${encodeURIComponent(callbackPath)}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        padding: "12px 18px",
        background: "var(--color-purple-dim2)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "10px",
        marginBottom: "28px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <span style={{ fontSize: "16px", flexShrink: 0 }}>💡</span>
        <p
          style={{
            fontSize: "13px",
            color: "var(--color-text-muted)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>Sign in to track your votes.</strong>{" "}
          Your vote history, profile, and contest activity are saved to your account.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <Link
          href={signInUrl}
          style={{
            padding: "6px 16px",
            background: "var(--color-purple-dim)",
            border: "1px solid rgba(139,92,246,0.35)",
            borderRadius: "100px",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-purple-light)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Sign in →
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-dim)",
            fontSize: "16px",
            lineHeight: 1,
            padding: "4px",
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
