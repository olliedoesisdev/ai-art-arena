"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

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

interface AuthFormProps {
  callbackUrl: string;
  defaultTab: "signin" | "signup";
}

export function AuthForm({ callbackUrl, defaultTab }: AuthFormProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      // Use window.location for a hard navigation so the server re-evaluates
      // the session cookie and performs the role-based redirect server-side
      window.location.href = "/signin";
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/v1/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name.trim() || undefined }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create account");
      setLoading(false);
      return;
    }

    // Auto sign in after signup
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setSuccess("Account created! Please sign in.");
      setTab("signin");
      setLoading(false);
    } else {
      window.location.href = "/signin";
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: "var(--color-bg-surface2)",
          borderRadius: "8px",
          padding: "4px",
          marginBottom: "28px",
        }}
      >
        {(["signin", "signup"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(null); setSuccess(null); }}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              background: tab === t ? "var(--color-purple)" : "transparent",
              color: tab === t ? "var(--color-bg-base)" : "var(--color-text-muted)",
              transition: "all 0.15s",
            }}
          >
            {t === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(248,113,113,0.08)", /* status-error dim — no token; matches status-error-dim pattern */
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

      {/* Success */}
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

      {tab === "signin" ? (
        <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
              <a
                href="/reset-password"
                style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textDecoration: "none" }}
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={loading} style={loading ? disabledBtn : primaryBtn}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
            No account?{" "}
            <button
              type="button"
              onClick={() => { setTab("signup"); setError(null); }}
              style={{ background: "none", border: "none", color: "var(--color-purple-light)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}
            >
              Sign up free
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Name (optional)</label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={inputStyle}
            />
          </div>
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
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={loading} style={loading ? disabledBtn : primaryBtn}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => { setTab("signin"); setError(null); }}
              style={{ background: "none", border: "none", color: "var(--color-purple-light)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}
            >
              Sign in
            </button>
          </p>
        </form>
      )}

      {/* Divider + GitHub */}
      <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--color-border-subtle)" }}>
        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl })}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "10px",
            background: "var(--color-bg-surface3)",
            border: "1px solid var(--color-border-mid)",
            borderRadius: "8px",
            color: "var(--color-text)",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
