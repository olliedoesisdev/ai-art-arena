import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — AI Art Arena",
  description: "AI Art Arena is a weekly voting contest where AI-generated artwork earns its crown. Learn how it works and what was built.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About — AI Art Arena",
    description: "AI Art Arena is a weekly voting contest where AI-generated artwork earns its crown.",
    url: `${SITE_URL}/about`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — AI Art Arena",
    description: "AI Art Arena is a weekly voting contest where AI-generated artwork earns its crown.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

const STACK = [
  { name: "Next.js 14+", desc: "App Router, Server Components, ISR caching" },
  { name: "Supabase", desc: "PostgreSQL, RLS, Storage, Realtime" },
  { name: "Upstash Redis", desc: "Per-contest rate limiting, sliding window" },
  { name: "NextAuth v5", desc: "GitHub OAuth, credentials auth" },
  { name: "Inngest", desc: "Background jobs, weekly contest automation" },
  { name: "Vercel", desc: "Edge deployment, CDN, CI/CD" },
  { name: "Recharts", desc: "Admin analytics — trends, breakdowns, donuts" },
  { name: "Resend", desc: "Transactional email notifications" },
];

const LESSONS = [
  {
    title: "Atomic DB functions are not optional at scale",
    body: "The vote endpoint used to make five separate database calls. One to check the contest status. One to verify the artwork. One to check for duplicate votes. One to insert. One to increment. That's five round trips, five points of failure, and a race condition waiting to happen. One stored procedure with SECURITY DEFINER collapsed it to a single call with a transaction guarantee.",
  },
  {
    title: "Server Components change how you think about data",
    body: "The temptation in React is to fetch everything client-side with useEffect. App Router flips that. Data fetching is boring server code again — await supabase.from(...) directly in the component, no loading spinners, no client state, no waterfalls. The client only gets involved when it genuinely has to.",
  },
  {
    title: "Rate limiting needs to be scoped correctly",
    body: "My first instinct was one vote per IP per day, globally. But that would block someone from voting in any new contest after casting their vote in week one. The correct scope is per-IP per-contest. A small distinction with a big difference in fairness.",
  },
  {
    title: "Middleware is load-bearing",
    body: "Next.js looks for middleware.ts specifically. Rename it to literally anything else and NextAuth silently stops working — session endpoints return 404, every page shows as logged out, and the error messages point you nowhere near the real problem. middleware.ts. Not proxy.ts. Not auth-middleware.ts. The filename is the contract.",
  },
  {
    title: "RLS policies are invisible until they're not",
    body: "Row-level security in Supabase is elegant right up until you write an API route that does an insert followed by a .select().single() to read back the inserted row. If your policy only allows users to read their own rows — and your route runs with the anon key — that select returns null and your error message says \"failed to save\" when the save actually succeeded. Read the policy. Trust the insert error. Don't trust the read-back.",
  },
];

const WHAT_IS_LIVE = [
  "Full voting experience — artworks, countdown, live vote counts, one-vote enforcement",
  "Artist application flow — aspiring contributors can submit their work and portfolio",
  "User profiles with activity feeds, avatar uploads, and public pages",
  "Admin dashboard — contest management, artwork uploads, comment moderation, analytics",
  "Archive of every past contest and its results",
  "Leaderboard of all-time highest-voted artworks",
  "Automated weekly contest cycling via background jobs",
  "CI pipeline — type checks, lint, unit tests, and build on every push",
];

const ROADMAP = [
  { status: "live",    label: "Weekly voting contests" },
  { status: "live",    label: "Anonymous + authenticated voting" },
  { status: "live",    label: "Real-time vote counts via Supabase Realtime" },
  { status: "live",    label: "Contest archive and leaderboard" },
  { status: "live",    label: "Artist application system" },
  { status: "live",    label: "User profiles and activity feeds" },
  { status: "live",    label: "Admin analytics dashboard" },
  { status: "soon",    label: "Email vote reminders" },
  { status: "soon",    label: "Public artist profiles" },
  { status: "planned", label: "Community artwork submissions" },
  { status: "planned", label: "Themed weekly contests" },
];

const STATUS: Record<string, { color: string; bg: string; border: string; label: string }> = {
  live:    { color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)",  label: "Live" },
  soon:    { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)",  label: "Soon" },
  planned: { color: "#3a3a58", bg: "rgba(58,58,88,0.12)",    border: "rgba(58,58,88,0.2)",    label: "Planned" },
};

const card: React.CSSProperties = {
  background: "#111119",
  border: "1px solid rgba(139,92,246,0.12)",
  borderRadius: "14px",
};

const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#a78bfa",
  marginBottom: "12px",
};

const sectionHead: React.CSSProperties = {
  fontFamily: "var(--font-syne)",
  fontWeight: 800,
  fontSize: "clamp(1.5rem, 3vw, 2rem)",
  letterSpacing: "-0.03em",
  color: "#eeeeff",
  marginBottom: "32px",
};

export default function AboutPage() {
  return (
    <div className="animate-page" style={{ paddingTop: "72px", paddingBottom: "120px" }}>
      <div className="shell">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: "100px", maxWidth: "760px" }}>
          <p style={eyebrow}>About</p>
          <h1 style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "#eeeeff",
            margin: "0 0 28px",
          }}>
            The arena where AI art<br />
            <span style={{ color: "#8b5cf6" }}>earns its crown.</span>
          </h1>
          <p style={{ fontSize: "1.0625rem", color: "#7878a0", lineHeight: 1.7, maxWidth: "620px", margin: "0 0 20px" }}>
            It&apos;s Monday morning. Six pieces of AI-generated artwork walk into a ring. They&apos;re stunning, weird, uncanny, beautiful — sometimes all four at once. And for the next seven days, the internet gets to decide which one is the champion.
          </p>
          <p style={{ fontSize: "1.0625rem", color: "#7878a0", lineHeight: 1.7, maxWidth: "620px" }}>
            That&apos;s AI Art Arena. Built from scratch to answer one question: in an ocean of AI-generated images, what actually resonates with real people?
          </p>
        </section>

        {/* ── The Idea ─────────────────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ background: "#111119", padding: "40px" }}>
              <p style={{ ...eyebrow, color: "#3a3a58" }}>The Problem</p>
              <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.25rem", color: "#eeeeff", marginBottom: "16px", letterSpacing: "-0.02em" }}>
                An ocean with no crown
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "#7878a0", lineHeight: 1.72 }}>
                There&apos;s an ocean of AI-generated art. Midjourney galleries, Stable Diffusion subreddits, ComfyUI workflows producing a thousand images an hour. It&apos;s everywhere. But there&apos;s almost no moment of judgment. No stakes. No measure of what actually connects.
              </p>
            </div>
            <div style={{ background: "#111119", padding: "40px", borderLeft: "1px solid rgba(139,92,246,0.12)" }}>
              <p style={{ ...eyebrow, color: "#8b5cf6" }}>The Solution</p>
              <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.25rem", color: "#eeeeff", marginBottom: "16px", letterSpacing: "-0.02em" }}>
                Make it earn it
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "#7878a0", lineHeight: 1.72 }}>
                Every week, a curated set of AI artworks enters the contest. Visitors vote once — no account required, just show up and pick your favourite. When the timer hits zero, the highest-voted piece wins and gets archived forever. Then we go again.
              </p>
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <p style={eyebrow}>How it works</p>
          <h2 style={sectionHead}>Simple by design.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {[
              { n: "01", title: "Six artworks drop every Monday", body: "A curated selection of AI-generated images enters the arena — each built from a unique prompt, each competing for the same crown." },
              { n: "02", title: "You vote once", body: "One vote per contest. No account required. Pick the artwork that stops you in your tracks. Signing in links your vote to your profile so you can track it." },
              { n: "03", title: "Live counts update in real time", body: "Supabase Realtime pushes vote counts to every open browser tab the moment a vote lands. Watch the standings shift." },
              { n: "04", title: "Champion is crowned at the final bell", body: "When the timer hits zero, the highest-voted piece wins. The contest auto-archives and a new one opens automatically." },
              { n: "05", title: "Results live forever in the Archive", body: "Every past champion is preserved with their vote count, week number, and full contest results. Nothing disappears." },
            ].map(({ n, title, body }, i) => (
              <div
                key={n}
                className="animate-card"
                style={{ "--card-delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <div style={{
                  display: "flex",
                  gap: "24px",
                  alignItems: "flex-start",
                  padding: "28px 32px",
                  background: "#111119",
                  border: "1px solid rgba(139,92,246,0.12)",
                  borderRadius: "12px",
                }}>
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", fontWeight: 700, color: "#8b5cf6", flexShrink: 0, marginTop: "3px", letterSpacing: "0.06em" }}>{n}</span>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1rem", color: "#eeeeff", marginBottom: "6px", letterSpacing: "-0.01em" }}>{title}</h3>
                    <p style={{ fontSize: "0.9375rem", color: "#7878a0", lineHeight: 1.65, margin: 0 }}>{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── The Stack ─────────────────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <p style={eyebrow}>Under the hood</p>
          <h2 style={sectionHead}>Built on tools I&apos;d trust with production traffic.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden", marginBottom: "28px" }}>
            {STACK.map(({ name, desc }) => (
              <div key={name} style={{ background: "#111119", padding: "24px 28px" }}>
                <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.8125rem", fontWeight: 500, color: "#a78bfa", marginBottom: "6px" }}>{name}</div>
                <div style={{ fontSize: "0.8125rem", color: "#7878a0", lineHeight: 1.55 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card, padding: "28px 32px" }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#eeeeff", marginBottom: "8px", letterSpacing: "-0.01em" }}>
              The vote endpoint is one atomic PostgreSQL function.
            </p>
            <p style={{ fontSize: "0.9375rem", color: "#7878a0", lineHeight: 1.7, margin: 0 }}>
              <code style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.8125rem", color: "#8b5cf6", background: "rgba(139,92,246,0.08)", padding: "1px 6px", borderRadius: "4px" }}>submit_vote</code> checks contest status, artwork existence, duplicate votes, and increments the count in a single transaction. What used to be five sequential database queries is now one round trip at ~40ms. No race conditions. No partial writes.
            </p>
          </div>
        </section>

        {/* ── Lessons ───────────────────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <p style={eyebrow}>What I learned</p>
          <h2 style={sectionHead}>Building it taught me things the docs don&apos;t say.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {LESSONS.map(({ title, body }, i) => (
              <div
                key={i}
                className="animate-card"
                style={{ "--card-delay": `${i * 50}ms`, ...card, padding: "28px 32px" } as React.CSSProperties}
              >
                <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1rem", color: "#eeeeff", marginBottom: "10px", letterSpacing: "-0.01em" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "0.9375rem", color: "#7878a0", lineHeight: 1.72, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What's Live + Roadmap ─────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
            {/* What's live */}
            <div>
              <p style={eyebrow}>What&apos;s live today</p>
              <h2 style={{ ...sectionHead, marginBottom: "24px" }}>Everything is working.</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {WHAT_IS_LIVE.map((item) => (
                  <div key={item} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px 20px", background: "#111119", border: "1px solid rgba(139,92,246,0.1)", borderRadius: "10px" }}>
                    <span style={{ color: "#34d399", fontSize: "0.875rem", flexShrink: 0, marginTop: "1px" }}>✓</span>
                    <span style={{ fontSize: "0.9375rem", color: "#7878a0", lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div style={{ ...card, padding: "28px", position: "sticky", top: "120px" }}>
              <p style={{ ...eyebrow, color: "#3a3a58" }}>Roadmap</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {ROADMAP.map(({ status, label }) => {
                  const s = STATUS[status];
                  return (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "0.8125rem", color: status === "live" ? "#7878a0" : "#3a3a58", lineHeight: 1.4 }}>{label}</span>
                      <span style={{
                        fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                        color: s.color, background: s.bg, border: `1px solid ${s.border}`,
                        padding: "2px 8px", borderRadius: "100px", flexShrink: 0,
                      }}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section>
          <div style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.06) 50%, rgba(139,92,246,0.02) 100%)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "20px",
            padding: "64px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Subtle orb behind CTA */}
            <div style={{ position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)", width: "400px", height: "200px", background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

            <p style={{ ...eyebrow, position: "relative" }}>The arena is open</p>
            <h2 style={{
              fontFamily: "var(--font-syne)", fontWeight: 800,
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)", letterSpacing: "-0.04em",
              color: "#eeeeff", margin: "0 0 16px", position: "relative",
            }}>
              Come vote. Pick your champion.
            </h2>
            <p style={{ fontSize: "1rem", color: "#7878a0", lineHeight: 1.65, maxWidth: "480px", margin: "0 auto 36px", position: "relative" }}>
              If you make AI art, want to see AI art, or just want to have an opinion about AI art — this is the place.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <Link href="/contest" style={{
                fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.9375rem",
                color: "#08080e", background: "#fbbf24",
                padding: "13px 32px", borderRadius: "100px", textDecoration: "none",
                letterSpacing: "0.01em",
              }}>
                Vote this week &rarr;
              </Link>
              <Link href="https://github.com/olliedoesisdev/ai-art-arena" target="_blank" rel="noopener noreferrer" style={{
                fontFamily: "var(--font-syne)", fontWeight: 600, fontSize: "0.9375rem",
                color: "#a78bfa", background: "rgba(139,92,246,0.10)",
                border: "1px solid rgba(139,92,246,0.25)",
                padding: "13px 32px", borderRadius: "100px", textDecoration: "none",
              }}>
                View the code
              </Link>
            </div>
          </div>

          {/* Footer credit */}
          <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "#3a3a58", fontFamily: "var(--font-dm-mono)", marginTop: "32px" }}>
            Built with Next.js, Supabase, Vercel, and an unreasonable amount of dark purple.
          </p>
        </section>

      </div>
    </div>
  );
}
