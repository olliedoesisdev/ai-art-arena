import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — AI Art Arena",
  description: "Learn about AI Art Arena — a weekly voting contest for AI-generated artwork.",
  openGraph: {
    title: "About — AI Art Arena",
    description: "Learn about AI Art Arena — a weekly voting contest for AI-generated artwork.",
    url: "https://olliedoesis.dev/about",
    siteName: "AI Art Arena",
    images: [{ url: "https://olliedoesis.dev/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — AI Art Arena",
    description: "Learn about AI Art Arena — a weekly voting contest for AI-generated artwork.",
    images: ["https://olliedoesis.dev/og-image.png"],
  },
};

const ROADMAP = [
  { status: "done", label: "Weekly voting contests" },
  { status: "done", label: "Anonymous + authenticated voting" },
  { status: "done", label: "Real-time vote counts" },
  { status: "done", label: "Contest archive" },
  { status: "soon", label: "Leaderboard" },
  { status: "soon", label: "Email vote reminders" },
  { status: "planned", label: "User profiles" },
  { status: "planned", label: "Artwork submission from the community" },
];

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  done:    { color: "#34d399", bg: "rgba(52,211,153,0.08)",    label: "Live" },
  soon:    { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",    label: "Soon" },
  planned: { color: "#7878a0", bg: "rgba(120,120,160,0.08)",   label: "Planned" },
};

export default function AboutPage() {
  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a78bfa",
            marginBottom: "16px",
          }}
        >
          About
        </p>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "#eeeeff",
            marginBottom: "64px",
          }}
        >
          What is AI Art Arena?
        </h1>

        {/* 2-col layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "48px",
            alignItems: "start",
          }}
        >
          {/* Left — description */}
          <div>
            <div
              style={{
                background: "#111119",
                border: "1px solid rgba(139,92,246,0.12)",
                borderRadius: "14px",
                padding: "36px",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "#eeeeff",
                  marginBottom: "16px",
                }}
              >
                The concept
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "#7878a0", lineHeight: 1.7, marginBottom: "16px" }}>
                Every week, a fresh set of AI-generated artworks enters the arena. Visitors vote for their favourite — no account required. When the week is up, the highest-voted piece is crowned champion and immortalised in the Archive.
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#7878a0", lineHeight: 1.7 }}>
                It&apos;s a lightweight, honest measure of what AI art resonates with real people right now. No algorithm. No follower counts. Just the work.
              </p>
            </div>

            <div
              style={{
                background: "#111119",
                border: "1px solid rgba(139,92,246,0.12)",
                borderRadius: "14px",
                padding: "36px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "#eeeeff",
                  marginBottom: "16px",
                }}
              >
                How voting works
              </h2>
              <ol style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  "Six AI-generated artworks are uploaded each week by the curator.",
                  "Anyone can vote — no sign-in needed. One vote per contest, enforced by IP.",
                  "Signing in links your vote to your account so you can track it across devices.",
                  "At week end, the contest auto-archives and a new one begins.",
                ].map((step, i) => (
                  <li key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-dm-mono)",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: "#8b5cf6",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      0{i + 1}
                    </span>
                    <p style={{ fontSize: "0.9375rem", color: "#7878a0", lineHeight: 1.65 }}>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right — profile card + roadmap */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Creator card */}
            <div
              style={{
                background: "#111119",
                border: "1px solid rgba(139,92,246,0.12)",
                borderRadius: "14px",
                padding: "28px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#3a3a58",
                  marginBottom: "16px",
                }}
              >
                Creator
              </p>
              <p
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.0625rem",
                  color: "#eeeeff",
                  marginBottom: "6px",
                }}
              >
                Oliver
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#7878a0", lineHeight: 1.6, marginBottom: "20px" }}>
                Building AI Art Arena as a side project to explore what AI-generated art people actually connect with.
              </p>
              <Link
                href="https://github.com/olliedoesisdev/ai-art-arena"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#a78bfa",
                  textDecoration: "none",
                }}
              >
                View on GitHub →
              </Link>
            </div>

            {/* Roadmap */}
            <div
              style={{
                background: "#111119",
                border: "1px solid rgba(139,92,246,0.12)",
                borderRadius: "14px",
                padding: "28px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#3a3a58",
                  marginBottom: "20px",
                }}
              >
                Roadmap
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {ROADMAP.map(({ status, label }) => {
                  const style = STATUS_STYLES[status];
                  return (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "0.8125rem", color: "#7878a0" }}>{label}</span>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: style.color,
                          background: style.bg,
                          padding: "2px 8px",
                          borderRadius: "100px",
                          flexShrink: 0,
                        }}
                      >
                        {style.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
