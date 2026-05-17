"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SubscriberForm } from "./SubscriberForm";
import { ArtistOnboarding } from "./ArtistOnboarding";

type Track = "choose" | "subscriber" | "artist";

function parseTrack(param: string | null): Track {
  if (param === "subscriber") return "subscriber";
  if (param === "artist") return "artist";
  return "choose";
}

function JoinHubInner() {
  const searchParams = useSearchParams();
  const [track, setTrack] = useState<Track>(() => parseTrack(searchParams.get("track")));

  const cardBase: React.CSSProperties = {
    flex: 1,
    minWidth: "260px",
    background: "var(--color-join-card)",
    border: "1px solid var(--color-join-border)",
    borderRadius: "12px",
    padding: "36px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-join-ink)", padding: "64px 24px 80px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-join-muted)",
            margin: "0 0 16px",
          }}>
            AI Art Arena
          </p>
          <h1 style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            color: "var(--color-join-text)",
            letterSpacing: "-0.03em",
            margin: "0 0 12px",
          }}>
            Compete. Vote. Follow.
          </h1>
          <p style={{ color: "var(--color-join-muted)", fontSize: "15px", margin: "0 0 10px" }}>Pick your track — AI artist, photographer, or subscriber.</p>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-join-subtle)", margin: 0, letterSpacing: "0.04em" }}>
            Built by Oliver White
          </p>
        </div>

        {track !== "choose" && (
          <button
            onClick={() => setTrack("choose")}
            aria-label="Go back to track selection"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-join-muted)",
              cursor: "pointer",
              marginBottom: "40px",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            ← Back
          </button>
        )}

        {track === "choose" && (
          <>
            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--color-join-border)" }} />
              <span style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-join-subtle)",
                whiteSpace: "nowrap",
              }}>
                Which path is yours?
              </span>
              <div style={{ flex: 1, height: "1px", background: "var(--color-join-border)" }} />
            </div>

            {/* Track cards */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>

              {/* Subscriber card */}
              <div style={cardBase}>
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--color-join-card-icon)", border: "1px solid var(--color-join-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-join-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.375rem", fontWeight: 800, color: "var(--color-join-text)", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
                    Stay in the Loop
                  </h2>
                  <p style={{ color: "var(--color-join-body)", fontSize: "14px", lineHeight: 1.7, margin: "0 0 10px" }}>
                    Get notified when each daily contest goes live. Vote, follow the competition, and watch the community grow.
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "var(--color-join-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                    Name + email. One step.
                  </p>
                </div>
                <button
                  onClick={() => setTrack("subscriber")}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(232,213,183,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  style={{
                    padding: "11px 20px",
                    background: "transparent",
                    border: "1px solid var(--color-join-amber)",
                    borderRadius: "6px",
                    color: "var(--color-join-amber)",
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    marginTop: "auto",
                  }}
                >
                  Subscribe to Updates
                </button>
              </div>

              {/* AI Artist card */}
              <div style={cardBase}>
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--color-join-card-icon)", border: "1px solid var(--color-join-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-join-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.375rem", fontWeight: 800, color: "var(--color-join-text)", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
                    AI Art Contest
                  </h2>
                  <p style={{ color: "var(--color-join-body)", fontSize: "14px", lineHeight: 1.7, margin: "0 0 10px" }}>
                    Submit your AI-generated artwork for consideration. Tell us about your process, your tools, and let the work speak.
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "var(--color-join-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                    Application reviewed by admin.
                  </p>
                </div>
                <button
                  onClick={() => setTrack("artist")}
                  style={{
                    padding: "11px 20px",
                    background: "var(--color-join-amber)",
                    border: "none",
                    borderRadius: "6px",
                    color: "var(--color-join-ink)",
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textAlign: "center",
                    cursor: "pointer",
                    marginTop: "auto",
                  }}
                >
                  Apply as AI Artist
                </button>
              </div>

              {/* Photo contest card */}
              <div style={cardBase}>
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--color-join-card-icon)", border: "1px solid var(--color-join-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-join-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.375rem", fontWeight: 800, color: "var(--color-join-text)", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
                    Photo Contest
                  </h2>
                  <p style={{ color: "var(--color-join-body)", fontSize: "14px", lineHeight: 1.7, margin: "0 0 10px" }}>
                    Upload your photo directly to an active contest. Sign in, pick a contest, and submit — no application needed.
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "var(--color-join-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                    Reviewed before going live.
                  </p>
                </div>
                <a
                  href="/contests"
                  style={{
                    padding: "11px 20px",
                    background: "transparent",
                    border: "1px solid rgba(139,92,246,0.4)",
                    borderRadius: "6px",
                    color: "rgba(167,139,250,1)",
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textAlign: "center",
                    textDecoration: "none",
                    marginTop: "auto",
                    display: "block",
                  }}
                >
                  Browse photo contests →
                </a>
              </div>
            </div>
          </>
        )}

        {track === "subscriber" && (
          <div style={{ maxWidth: "480px" }}>
            <SubscriberForm />
          </div>
        )}

        {track === "artist" && (
          <ArtistOnboarding />
        )}
      </div>
    </div>
  );
}

export function JoinHub() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--color-join-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--color-join-border)", borderTopColor: "var(--color-join-amber)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <JoinHubInner />
    </Suspense>
  );
}
