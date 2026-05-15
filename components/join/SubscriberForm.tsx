"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/gtag";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "var(--color-join-surface)",
  border: "1px solid var(--color-join-border)",
  borderRadius: "6px",
  color: "var(--color-join-text)",
  fontSize: "15px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-dm-mono)",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--color-join-muted)",
  marginBottom: "6px",
};

export function SubscriberForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { toast.error("Please enter a valid email address."); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();

      if (res.status === 409) {
        toast.error("That email is already subscribed.");
        setIsSubmitting(false);
        return;
      }
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }
      trackEvent('subscriber_signup')
      setIsDone(true);
    } catch {
      toast.error(“Network error â€” please try again.”);
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            border: "2px solid var(--color-join-amber)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-join-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "2rem", fontWeight: 800, color: "var(--color-join-text)", letterSpacing: "-0.03em", margin: "0 0 12px" }}>
          You are in.
        </h2>
        <p style={{ color: "var(--color-join-body)", fontSize: "15px", lineHeight: 1.7, margin: "0 0 20px" }}>
          Check your inbox for a welcome from us.
        </p>
        <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-join-subtle)", letterSpacing: "0.06em" }}>
          olliedoesis.dev
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "440px", margin: "0 auto" }}>
      <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-join-text)", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
        Stay in the Loop
      </h2>
      <p style={{ color: "var(--color-join-body)", fontSize: "14px", lineHeight: 1.7, margin: "0 0 36px" }}>
        Get notified when each daily contest goes live. Vote, follow the competition, and watch the community grow.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--color-join-amber)"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--color-join-border)"; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--color-join-amber)"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--color-join-border)"; }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "14px",
            background: "var(--color-join-amber)",
            border: "none",
            borderRadius: "6px",
            color: "var(--color-join-ink)",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textAlign: "center",
            cursor: isSubmitting ? "wait" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
