"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/gtag";

const DISMISSED_KEY = "notify_banner_dismissed";

export function ContestNotifyBanner() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return typeof window !== "undefined" && !!localStorage.getItem(DISMISSED_KEY);
    } catch { return false; }
  });

  function dismiss() {
    try { localStorage.setItem(DISMISSED_KEY, "1"); } catch { /* blocked */ }
    setDismissed(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok || res.status === 200) {
        trackEvent("contest_notify_signup");
        setDone(true);
        try { localStorage.setItem(DISMISSED_KEY, "1"); } catch { /* blocked */ }
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { error?: string }).error ?? "Something went wrong.");
      }
    } catch {
      toast.error("Network error — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (dismissed && !done) return null;

  if (done) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 18px",
          background: "var(--color-status-successDim)",
          border: "1px solid rgba(52,211,153,0.2)",
          borderRadius: "10px",
          marginTop: "48px",
        }}
      >
        <span style={{ color: "var(--color-status-success)", fontSize: "15px" }}>✓</span>
        <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "12px", fontWeight: 600, color: "var(--color-status-success)", letterSpacing: "0.06em", margin: 0 }}>
          You are subscribed — we will notify you when the next contest opens.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        padding: "16px 20px",
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "10px",
        marginTop: "48px",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "3px" }}>
          Stay in the loop
        </p>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.45 }}>
          Get notified when the next contest goes live.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            padding: "8px 14px",
            background: "var(--color-bg-surface2)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "100px",
            color: "var(--color-text)",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "12px",
            outline: "none",
            width: "200px",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(139,92,246,0.4)"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--color-border-subtle)"; }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "8px 18px",
            background: "var(--color-purple-dim)",
            border: "1px solid rgba(139,92,246,0.35)",
            borderRadius: "100px",
            color: "var(--color-purple-light)",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting ? 0.7 : 1,
            whiteSpace: "nowrap",
            transition: "opacity 0.15s",
          }}
        >
          {submitting ? "..." : "Notify me →"}
        </button>
      </form>

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-dim)", fontSize: "16px", padding: "4px", flexShrink: 0, lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
}
