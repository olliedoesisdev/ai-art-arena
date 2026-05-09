"use client";

import { useState } from "react";
import { toast } from "sonner";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "#0d0d0d",
  border: "1px solid #1f1f1f",
  borderRadius: "6px",
  color: "#f5f5f5",
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
  color: "#555",
  marginBottom: "6px",
};

export function SubscriberForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleSubmit() {
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
      setIsDone(true);
    } catch {
      toast.error("Network error — please try again.");
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
            border: "2px solid #e8d5b7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8d5b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "2rem", fontWeight: 800, color: "#f5f5f5", letterSpacing: "-0.03em", margin: "0 0 12px" }}>
          You are in.
        </h2>
        <p style={{ color: "#888", fontSize: "15px", lineHeight: 1.7, margin: "0 0 20px" }}>
          Check your inbox for a welcome from us.
        </p>
        <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "#333", letterSpacing: "0.06em" }}>
          olliedoesis.dev
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "440px", margin: "0 auto" }}>
      <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, color: "#f5f5f5", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
        Stay in the Loop
      </h2>
      <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.7, margin: "0 0 36px" }}>
        Get notified when each weekly contest goes live. Vote, follow the competition, and watch the community grow.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#e8d5b7"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#1f1f1f"; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#e8d5b7"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#1f1f1f"; }}
          />
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={isSubmitting ? undefined : handleSubmit}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSubmit(); } }}
          style={{
            width: "100%",
            padding: "14px",
            background: "#e8d5b7",
            borderRadius: "6px",
            color: "#0a0a0a",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textAlign: "center",
            cursor: isSubmitting ? "wait" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            transition: "opacity 0.15s",
            userSelect: "none",
          }}
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </div>
      </div>
    </div>
  );
}
