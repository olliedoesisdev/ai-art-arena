"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "var(--color-bg-surface2)",
  border: "1px solid var(--color-border-mid)",
  borderRadius: "8px",
  color: "var(--color-text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--color-text-muted)",
  marginBottom: "6px",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "11px",
  background: "var(--color-purple)",
  border: "none",
  borderRadius: "8px",
  color: "var(--color-bg-base)",
  fontFamily: "var(--font-syne)",
  fontWeight: 700,
  fontSize: "0.9375rem",
  cursor: "pointer",
  marginTop: "8px",
};

const disabledBtn: React.CSSProperties = {
  ...primaryBtn,
  background: "var(--color-text-dim)",
  cursor: "not-allowed",
};

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRequestLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/v1/auth/reset-password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess("If an account exists for that email, a reset link is on its way. Check your inbox.");
    } else {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Something went wrong");
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/v1/auth/reset-password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json() as { error?: string };
    setLoading(false);

    if (res.ok) {
      setSuccess("Password updated! Redirecting to sign in...");
      setTimeout(() => router.push("/signin"), 2000);
    } else {
      setError(data.error ?? "Something went wrong");
    }
  }

  return (
    <div>
      {error && (
        <div
          style={{
            background: "rgba(248,113,113,0.08)", /* status-error dim — no alpha token */
            border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "20px",
            fontSize: "0.875rem",
            color: "var(--color-status-error)",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "var(--color-status-success-dim)",
            border: "1px solid rgba(52,211,153,0.3)",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "20px",
            fontSize: "0.875rem",
            color: "var(--color-status-success)",
          }}
        >
          {success}
        </div>
      )}

      {token ? (
        /* ── Set new password ── */
        <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>New password</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm password</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your new password"
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={loading} style={loading ? disabledBtn : primaryBtn}>
            {loading ? "Saving..." : "Set new password"}
          </button>
        </form>
      ) : (
        /* ── Request reset link ── */
        <form onSubmit={handleRequestLink} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
            Enter your email and we will send you a link to reset your password.
          </p>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={loading} style={loading ? disabledBtn : primaryBtn}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Link
          href="/signin"
          style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", textDecoration: "none" }}
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
