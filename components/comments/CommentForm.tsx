"use client";

import { useState } from "react";

interface Props {
  artworkId: string;
}

const MAX_BODY = 500;

export function CommentForm({ artworkId }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artwork_id: artworkId, name, email: email || undefined, body }),
      });

      if (res.status === 201) {
        setStatus("success");
        setName("");
        setEmail("");
        setBody("");
      } else {
        const data = (await res.json()) as { error?: string };
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#181820",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "0.875rem",
    color: "#eeeeff",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#7878a0",
    marginBottom: "6px",
    letterSpacing: "0.04em",
  };

  if (status === "success") {
    return (
      <div
        style={{
          background: "rgba(52,211,153,0.06)",
          border: "1px solid rgba(52,211,153,0.2)",
          borderRadius: "10px",
          padding: "16px 20px",
          fontSize: "0.875rem",
          color: "#34d399",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>✓</span>
        <span>Your comment is awaiting approval</span>
        <button
          onClick={() => setStatus("idle")}
          style={{
            marginLeft: "auto",
            fontSize: "0.75rem",
            color: "#7878a0",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Leave another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="grid-comment-fields">
        <div>
          <label style={labelStyle} htmlFor="comment-name">
            Name <span style={{ color: "#8b5cf6" }}>*</span>
          </label>
          <input
            id="comment-name"
            type="text"
            required
            minLength={2}
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={status === "submitting"}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="comment-email">
            Email{" "}
            <span style={{ color: "#3a3a58", fontWeight: 400 }}>(private, never shown)</span>
          </label>
          <input
            id="comment-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={status === "submitting"}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle} htmlFor="comment-body">
          Comment <span style={{ color: "#8b5cf6" }}>*</span>
        </label>
        <textarea
          id="comment-body"
          required
          minLength={5}
          maxLength={MAX_BODY}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts on this artwork..."
          rows={4}
          disabled={status === "submitting"}
          style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
        />
        <p
          style={{
            fontSize: "0.6875rem",
            color: body.length > MAX_BODY * 0.9 ? "#fbbf24" : "#3a3a58",
            textAlign: "right",
            marginTop: "4px",
            fontFamily: "var(--font-dm-mono)",
          }}
        >
          {body.length} / {MAX_BODY}
        </p>
      </div>

      {status === "error" && (
        <div
          style={{
            background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "0.8125rem",
            color: "#f87171",
          }}
        >
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        style={{
          alignSelf: "flex-start",
          padding: "10px 24px",
          background: status === "submitting" ? "rgba(139,92,246,0.4)" : "#8b5cf6",
          border: "none",
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#eeeeff",
          cursor: status === "submitting" ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
      >
        {status === "submitting" ? "Submitting..." : "Post comment"}
      </button>
    </form>
  );
}
