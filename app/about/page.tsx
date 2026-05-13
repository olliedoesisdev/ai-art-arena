import { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/layout/JsonLd";
import { BlogCarousel } from "@/components/blog/BlogCarousel";
import { BLOG_POSTS } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About — Oliver White | Full Stack Developer",
  description:
    "Oliver White built AI Art Arena — a production Next.js 14 voting platform for AI-generated artwork. Every tool in the stack solved a real problem.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About — Oliver White | Full Stack Developer",
    description:
      "A production Next.js 14 + Supabase voting platform built from scratch. Every architectural decision explained.",
    url: `${SITE_URL}/about`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena — built by Oliver White" }],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Oliver White | AI Art Arena",
    description: "Production Next.js 14 + Supabase voting platform. Every tool solved a real problem.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Oliver White",
  url: SITE_URL,
  jobTitle: "Full Stack Developer",
  description:
    "Self-taught full stack developer. Built AI Art Arena — a production Next.js 14 voting platform for AI-generated artwork.",
  knowsAbout: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "React", "Tailwind CSS", "Vercel", "Redis", "NextAuth"],
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/about` },
  worksFor: {
    "@type": "CreativeWork",
    name: "AI Art Arena",
    url: SITE_URL,
    description: "A weekly voting contest for AI-generated artwork.",
  },
};

// ─── Stack data ────────────────────────────────────────────────────────────────

interface StackItem {
  name: string;
  role: string;
  blurb: string;
  blogSlug: string;
  color: string;
  icon: string;
}

const STACK: StackItem[] = [
  {
    name: "Next.js 14",
    role: "Framework",
    blurb: "App Router Server Components keep 95% of the codebase off the browser. Contest pages are ISR-cached HTML. Only 8 Client Components ship JavaScript.",
    blogSlug: "nextjs-server-client-split",
    color: "#a78bfa",
    icon: "▲",
  },
  {
    name: "Supabase",
    role: "Database + Storage",
    blurb: "PostgreSQL with RLS enforced at the database layer. One atomic SECURITY DEFINER function replaced 5 sequential queries — dropping vote latency from ~200ms to ~40ms and eliminating a race condition.",
    blogSlug: "submit-vote-postgresql-race-condition",
    color: "#34d399",
    icon: "⬡",
  },
  {
    name: "NextAuth v5",
    role: "Authentication",
    blurb: "Ground-up v5 rewrite wired into App Router. auth() works in Server Components, middleware, and API routes. GitHub OAuth + Credentials, with role attached to the session token.",
    blogSlug: "nextauth-v5-app-router",
    color: "#f472b6",
    icon: "🔑",
  },
  {
    name: "Upstash Redis",
    role: "Rate Limiting",
    blurb: "Sliding window rate limiting across 5 limiters. Vote keys are scoped per-contest per identity — email hash for authenticated users, IP hash for anonymous. One vote. Full stop.",
    blogSlug: "rate-limiting-sliding-window-redis",
    color: "#fbbf24",
    icon: "⚡",
  },
  {
    name: "TypeScript + Zod",
    role: "Types + Validation",
    blurb: "Strict mode throughout. Zod validates every API input at the boundary before anything touches Redis or the database. UUIDs, not strings — injection attempts rejected before they form a query.",
    blogSlug: "typescript-zod-api-validation",
    color: "#60a5fa",
    icon: "{}",
  },
  {
    name: "Inngest",
    role: "Background Jobs",
    blurb: "Event-driven contest automation in a serverless environment. archive-contest fires contest/archived, which triggers create-next-contest. Automatic retries, step-level observability, no cron hacks.",
    blogSlug: "inngest-background-jobs-serverless",
    color: "#84cc16",
    icon: "↻",
  },
  {
    name: "Vercel",
    role: "Deployment + CDN",
    blurb: "next/image routes through Vercel's transformation pipeline — a 4MB PNG becomes 180KB WebP, edge-cached for a year. Git push deploys in under 60 seconds.",
    blogSlug: "vercel-nextjs-image-optimization",
    color: "#eeeeff",
    icon: "◈",
  },
  {
    name: "CSP + Security Headers",
    role: "Security",
    blurb: "Six security headers on every response via middleware. unsafe-eval is gated to NODE_ENV=development only — React needs it for dev tooling, production strips it completely.",
    blogSlug: "csp-nextjs-unsafe-eval",
    color: "#f87171",
    icon: "🛡",
  },
  {
    name: "Pino + Sentry",
    role: "Observability",
    blurb: "Structured JSON logs with a requestId threaded through every API route. X-Request-Id response header ties server traces to client errors. Sentry catches anything that escapes explicit handling.",
    blogSlug: "structured-logging-pino-request-id",
    color: "#c4b5fd",
    icon: "◉",
  },
  {
    name: "Row Level Security",
    role: "Data Access Control",
    blurb: "RLS policies enforce access rules at the database layer — not in application code. Votes are insert-only. No updates, no deletes. A compromised route still can't modify data it shouldn't.",
    blogSlug: "supabase-rls-security-model",
    color: "#34d399",
    icon: "⬢",
  },
];

const STATS = [
  { value: "19", label: "Migrations", sub: "tracked in order" },
  { value: "40ms", label: "Vote latency", sub: "p50 after RPC refactor" },
  { value: "8", label: "Client components", sub: "rest is server-rendered HTML" },
  { value: "3×", label: "Duplicate prevention", sub: "IP + user_id + email hash" },
];

export default function AboutPage() {
  const carouselPosts = [...BLOG_POSTS]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 8)
    .map(({ slug, title, excerpt, tags, publishedAt, readingTime }) => ({
      slug, title, excerpt, tags, publishedAt, readingTime,
    }));

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="animate-page" style={{ paddingBottom: "100px" }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          style={{
            borderBottom: "1px solid var(--color-border-subtle)",
            paddingTop: "72px",
            paddingBottom: "72px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* grid texture */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0, opacity: 0.018,
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
              pointerEvents: "none",
            }}
          />
          <div className="shell" style={{ position: "relative" }}>
            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "20px" }}>
              Oliver White — Full Stack Developer
            </p>
            <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.25rem,6vw,4rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--color-text)", margin: "0 0 24px", lineHeight: 1.02, maxWidth: "800px" }}>
              Every tool here<br />
              <span style={{ color: "var(--color-text-dim)" }}>solved a real problem.</span>
            </h1>
            <p style={{ fontSize: "1.0625rem", lineHeight: 1.72, color: "var(--color-text-muted)", maxWidth: "580px", margin: "0 0 36px" }}>
              AI Art Arena is a live production voting contest for AI-generated artwork. I chose each piece of the stack because I had a problem, and it was the right tool to solve it.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <a
                href="https://github.com/olliedoesisdev/ai-art-arena"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "var(--color-purple-dim)", border: "1px solid var(--color-border-mid)", borderRadius: "100px", fontFamily: "var(--font-dm-mono)", fontSize: "12px", fontWeight: 600, color: "var(--color-purple-light)", textDecoration: "none", letterSpacing: "0.06em" }}
              >
                View source
              </a>
              <Link
                href="/blog"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "transparent", border: "1px solid var(--color-border-subtle)", borderRadius: "100px", fontFamily: "var(--font-dm-mono)", fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted)", textDecoration: "none", letterSpacing: "0.06em" }}
              >
                Read the blog →
              </Link>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ──────────────────────────────────────────────── */}
        <section style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
          <div className="shell">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    padding: "28px 24px",
                    borderRight: i < STATS.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "2rem", fontWeight: 500, color: "var(--color-purple-light)", margin: "0 0 4px", letterSpacing: "-0.03em" }}>{s.value}</p>
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", margin: "0 0 2px" }}>{s.label}</p>
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-dim)", margin: 0 }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE BUILDER ──────────────────────────────────────────────── */}
        <section style={{ borderBottom: "1px solid var(--color-border-subtle)", padding: "64px 0" }}>
          <div className="shell">
            <div className="grid-about-reverse">
              <div style={{ maxWidth: "600px" }}>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-dim)", marginBottom: "20px" }}>
                  The builder
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", fontSize: "1.0625rem", lineHeight: 1.72, color: "var(--color-text-muted)" }}>
                  <p style={{ margin: 0 }}>
                    Three years ago I was selling life insurance. No CS degree. No bootcamp. What I had was a stubborn need to understand how things work.
                  </p>
                  <p style={{ margin: 0 }}>
                    I taught myself to code by building things, running into problems, and figuring out solutions. React first, then Next.js, then databases, authentication, security, deployment. Each layer required the one before it.
                  </p>
                  <p style={{ margin: 0 }}>
                    Every technology on this project exists because the project demanded it. That is the only reason to learn anything.
                  </p>
                </div>
              </div>

              {/* Visual: timeline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[
                  { year: "2023", event: "First React app" },
                  { year: "2023", event: "Next.js + TypeScript" },
                  { year: "2024", event: "PostgreSQL + Auth" },
                  { year: "2024", event: "Production deployment" },
                  { year: "2025", event: "Security & observability" },
                  { year: "2026", event: "AI Art Arena live" },
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: i === arr.length - 1 ? "var(--color-purple)" : "var(--color-border-mid)", marginTop: "6px" }} />
                      {i < arr.length - 1 && <div style={{ width: "1px", height: "32px", background: "var(--color-border-subtle)" }} />}
                    </div>
                    <div style={{ paddingBottom: i < arr.length - 1 ? "8px" : 0 }}>
                      <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "var(--color-text-dim)", margin: "0 0 2px", letterSpacing: "0.08em" }}>{item.year}</p>
                      <p style={{ fontSize: "0.875rem", color: i === arr.length - 1 ? "var(--color-text)" : "var(--color-text-muted)", margin: 0, fontWeight: i === arr.length - 1 ? 600 : 400 }}>{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── THE STACK ────────────────────────────────────────────────── */}
        <section style={{ borderBottom: "1px solid var(--color-border-subtle)", padding: "64px 0" }}>
          <div className="shell">
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "36px" }}>
              <div>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-dim)", marginBottom: "8px" }}>
                  The stack
                </p>
                <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text)", margin: 0 }}>
                  10 tools. 10 problems solved.
                </h2>
              </div>
              <Link
                href="/blog"
                style={{ fontFamily: "var(--font-dm-mono)", fontSize: "12px", color: "var(--color-purple-light)", textDecoration: "none", letterSpacing: "0.06em" }}
              >
                Read the deep dives →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
              {STACK.map((item) => (
                <Link
                  key={item.name}
                  href={`/blog/${item.blogSlug}`}
                  style={{ textDecoration: "none" }}
                >
                  <article
                    style={{
                      background: "var(--color-bg-surface)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: "12px",
                      padding: "20px 22px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      transition: "border-color 0.2s, background 0.2s, transform 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = item.color + "50";
                      el.style.background = "var(--color-bg-surface2)";
                      el.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "var(--color-border-subtle)";
                      el.style.background = "var(--color-bg-surface)";
                      el.style.transform = "none";
                    }}
                  >
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ width: "32px", height: "32px", borderRadius: "8px", background: item.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        <div>
                          <p style={{ fontFamily: "var(--font-syne)", fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text)", margin: 0, lineHeight: 1.2 }}>{item.name}</p>
                          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: item.color, margin: 0, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.role}</p>
                        </div>
                      </div>
                      <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-dim)" }}>→</span>
                    </div>

                    {/* Blurb */}
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.65, margin: 0, flex: 1 }}>
                      {item.blurb}
                    </p>

                    {/* Read more */}
                    <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: item.color, fontWeight: 600, letterSpacing: "0.06em" }}>
                      Deep dive →
                    </span>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── BLOG CAROUSEL ────────────────────────────────────────────── */}
        <section style={{ borderBottom: "1px solid var(--color-border-subtle)", padding: "64px 0" }}>
          <div className="shell">
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
              <div>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-dim)", marginBottom: "8px" }}>
                  Writing
                </p>
                <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text)", margin: 0 }}>
                  Real problems. Real solutions.
                </h2>
              </div>
              <Link
                href="/blog"
                style={{ fontFamily: "var(--font-dm-mono)", fontSize: "12px", color: "var(--color-purple-light)", textDecoration: "none", letterSpacing: "0.06em" }}
              >
                All {BLOG_POSTS.length} posts →
              </Link>
            </div>

            <div style={{ maxWidth: "600px" }}>
              <BlogCarousel posts={carouselPosts} />
            </div>
          </div>
        </section>

        {/* ── ON USING AI ──────────────────────────────────────────────── */}
        <section style={{ borderBottom: "1px solid var(--color-border-subtle)", padding: "64px 0", background: "var(--color-purple-dim2)" }}>
          <div className="shell">
            <div style={{ maxWidth: "640px" }}>
              <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-dim)", marginBottom: "20px" }}>
                On using AI
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", fontSize: "1.0625rem", lineHeight: 1.72, color: "var(--color-text-muted)" }}>
                <p style={{ margin: 0 }}>
                  I use Claude as a development tool — the same way I use TypeScript, a linter, or a debugger. Every architectural decision, security tradeoff, and product direction was mine.
                </p>
                <p style={{ margin: 0 }}>
                  What AI cannot do is understand the problem I am trying to solve. It cannot decide that three independent duplicate-vote layers are necessary. It cannot look at five sequential database queries and understand why one atomic function is the right call — not just for performance, but for correctness under concurrent load. Those decisions require understanding the system. That understanding is mine.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section style={{ padding: "64px 0" }}>
          <div className="shell">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "32px" }}>
              <div>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-dim)", marginBottom: "12px" }}>
                  Work together
                </p>
                <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text)", margin: "0 0 10px" }}>
                  Let&apos;s build something real.
                </h2>
                <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", margin: 0, maxWidth: "400px" }}>
                  I take on client work. If you need a developer who solves problems instead of copying solutions — reach out.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <a
                  href="mailto:hello@olliedoesis.dev"
                  style={{ display: "inline-flex", alignItems: "center", padding: "12px 28px", background: "var(--color-purple)", borderRadius: "100px", fontFamily: "var(--font-syne)", fontSize: "0.9375rem", fontWeight: 700, color: "#fff", textDecoration: "none", letterSpacing: "0.01em" }}
                >
                  Get in touch
                </a>
                <a
                  href="https://github.com/olliedoesisdev/ai-art-arena"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", padding: "12px 28px", background: "transparent", border: "1px solid var(--color-border-mid)", borderRadius: "100px", fontFamily: "var(--font-syne)", fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-purple-light)", textDecoration: "none" }}
                >
                  View source on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
