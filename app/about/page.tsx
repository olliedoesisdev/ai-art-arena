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
    "Oliver White builds fast. Sales background, self-taught developer, Directed Output workflow. AI Art Arena is the proof of concept — live, production, every decision deliberate.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About — Oliver White | Full Stack Developer",
    description:
      "Self-taught developer with a sales background and a Directed Output workflow. AI Art Arena is the proof of concept — production Next.js 14 + Supabase, shipped fast.",
    url: `${SITE_URL}/about`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena — built by Oliver White" }],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Oliver White | AI Art Arena",
    description: "Self-taught developer. Directed Output workflow. This site is the proof of concept.",
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
    "Self-taught full stack developer. Former sales professional. Directed Output workflow — uses AI as a tool, not a collaborator. Built AI Art Arena as the proof of concept.",
  knowsAbout: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "React", "Tailwind CSS", "Vercel", "Redis", "NextAuth"],
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/about` },
  worksFor: {
    "@type": "CreativeWork",
    name: "AI Art Arena",
    url: SITE_URL,
    description: "A daily voting contest for AI-generated artwork. Built fast, built right.",
  },
};

// ─── Stack data ────────────────────────────────────────────────────────────────

interface StackItem {
  name: string;
  role: string;
  blurb: string;
  blogSlug: string;
  color: string;
  iconBg: string;
  hoverBorder: string;
  icon: string;
}

const STACK: StackItem[] = [
  {
    name: "Next.js 14",
    role: "Framework",
    blurb: "App Router Server Components keep 95% of the codebase off the browser. Contest pages are ISR-cached HTML. Only 8 Client Components ship JavaScript.",
    blogSlug: "nextjs-server-client-split",
    color: "#a78bfa",
    iconBg: "var(--color-stack-purple-light-icon)",
    hoverBorder: "var(--color-stack-purple-light-hover)",
    icon: "▲",
  },
  {
    name: "Supabase",
    role: "Database + Storage",
    blurb: "PostgreSQL with RLS enforced at the database layer. One atomic SECURITY DEFINER function replaced 5 sequential queries — dropping vote latency from ~200ms to ~40ms and eliminating a race condition.",
    blogSlug: "submit-vote-postgresql-race-condition",
    color: "#34d399",
    iconBg: "var(--color-stack-green-icon)",
    hoverBorder: "var(--color-stack-green-hover)",
    icon: "⬡",
  },
  {
    name: "NextAuth v5",
    role: "Authentication",
    blurb: "Ground-up v5 rewrite wired into App Router. auth() works in Server Components, middleware, and API routes. GitHub OAuth + Credentials, with role attached to the session token.",
    blogSlug: "nextauth-v5-app-router",
    color: "#f472b6",
    iconBg: "var(--color-stack-pink-icon)",
    hoverBorder: "var(--color-stack-pink-hover)",
    icon: "🔑",
  },
  {
    name: "Upstash Redis",
    role: "Rate Limiting",
    blurb: "Sliding window rate limiting across 5 limiters. Vote keys are scoped per-contest per identity — email hash for authenticated users, IP hash for anonymous. One vote. Full stop.",
    blogSlug: "rate-limiting-sliding-window-redis",
    color: "#fbbf24",
    iconBg: "var(--color-stack-amber-icon)",
    hoverBorder: "var(--color-stack-amber-hover)",
    icon: "⚡",
  },
  {
    name: "TypeScript + Zod",
    role: "Types + Validation",
    blurb: "Strict mode throughout. Zod validates every API input at the boundary before anything touches Redis or the database. UUIDs, not strings — injection attempts rejected before they form a query.",
    blogSlug: "typescript-zod-api-validation",
    color: "#60a5fa",
    iconBg: "var(--color-stack-blue-icon)",
    hoverBorder: "var(--color-stack-blue-hover)",
    icon: "{}",
  },
  {
    name: "Inngest",
    role: "Background Jobs",
    blurb: "Event-driven contest automation in a serverless environment. archive-contest fires contest/archived, which triggers create-next-contest. Automatic retries, step-level observability, no cron hacks.",
    blogSlug: "inngest-background-jobs-serverless",
    color: "#84cc16",
    iconBg: "var(--color-stack-lime-icon)",
    hoverBorder: "var(--color-stack-lime-hover)",
    icon: "↻",
  },
  {
    name: "Vercel",
    role: "Deployment + CDN",
    blurb: "next/image routes through Vercel's transformation pipeline — a 4MB PNG becomes 180KB WebP, edge-cached for a year. Git push deploys in under 60 seconds.",
    blogSlug: "vercel-nextjs-image-optimization",
    color: "#eeeeff",
    iconBg: "var(--color-stack-white-icon)",
    hoverBorder: "var(--color-stack-white-hover)",
    icon: "◈",
  },
  {
    name: "CSP + Security Headers",
    role: "Security",
    blurb: "Six security headers on every response via middleware. unsafe-eval is gated to NODE_ENV=development only — React needs it for dev tooling, production strips it completely.",
    blogSlug: "csp-nextjs-unsafe-eval",
    color: "#f87171",
    iconBg: "var(--color-stack-red-icon)",
    hoverBorder: "var(--color-stack-red-hover)",
    icon: "🛡",
  },
  {
    name: "Pino + Sentry",
    role: "Observability",
    blurb: "Structured JSON logs with a requestId threaded through every API route. X-Request-Id response header ties server traces to client errors. Sentry catches anything that escapes explicit handling.",
    blogSlug: "structured-logging-pino-request-id",
    color: "#c4b5fd",
    iconBg: "var(--color-stack-purple-pale-icon)",
    hoverBorder: "var(--color-stack-purple-pale-hover)",
    icon: "◉",
  },
  {
    name: "Row Level Security",
    role: "Data Access Control",
    blurb: "RLS policies enforce access rules at the database layer — not in application code. Votes are insert-only. No updates, no deletes. A compromised route still can't modify data it shouldn't.",
    blogSlug: "supabase-rls-security-model",
    color: "#34d399",
    iconBg: "var(--color-stack-green-icon)",
    hoverBorder: "var(--color-stack-green-hover)",
    icon: "⬢",
  },
];

const STATS = [
  { value: "19", label: "Migrations", sub: "schema changes, in production" },
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
              Ships fast.<br />
              <span style={{ color: "var(--color-text-muted)" }}>Decides deliberately.</span><br />
              <span style={{ color: "var(--color-purple-light)" }}>Explains every call.</span>
            </h1>
            <p style={{ fontSize: "1.0625rem", lineHeight: 1.72, color: "var(--color-text-muted)", maxWidth: "580px", margin: "0 0 36px" }}>
              AI Art Arena is the proof of concept. Production Next.js, 22 migrations, 40ms vote latency. Real constraints. Built in months, not years.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <Link
                href="/join?track=artist"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "var(--color-status-warning)", borderRadius: "100px", fontFamily: "var(--font-dm-mono)", fontSize: "12px", fontWeight: 700, color: "#08080e", textDecoration: "none", letterSpacing: "0.06em" }}
              >
                Apply as an artist →
              </Link>
              <a
                href="https://github.com/olliedoesisdev/ai-art-arena"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "var(--color-purple-dim)", border: "1px solid var(--color-border-strong)", borderRadius: "100px", fontFamily: "var(--font-dm-mono)", fontSize: "12px", fontWeight: 600, color: "var(--color-purple-pale)", textDecoration: "none", letterSpacing: "0.06em" }}
              >
                View source
              </a>
              <Link
                href="/blog"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "transparent", border: "1px solid var(--color-border-mid)", borderRadius: "100px", fontFamily: "var(--font-dm-mono)", fontSize: "12px", fontWeight: 600, color: "var(--color-text)", textDecoration: "none", letterSpacing: "0.06em" }}
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
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>{s.sub}</p>
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
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "20px" }}>
                  Background
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", fontSize: "1.0625rem", lineHeight: 1.72, color: "var(--color-text-muted)" }}>
                  <p style={{ margin: 0 }}>
                    Three years ago I was in sales. No CS degree, no bootcamp.
                    I learned by building things that had to work — real databases,
                    real deployments, real consequences when something broke.
                  </p>
                  <p style={{ margin: 0 }}>
                    Sales taught me something most developers miss: the work is not the code.
                    The work is understanding what someone needs, deciding what to build, and
                    getting it in front of them. Code is the fastest path between those two points.
                  </p>
                  <p style={{ margin: 0 }}>
                    AI Art Arena is a production project built under real conditions — real
                    database constraints, real security requirements, real deployment pipeline.
                    There are no shortcuts in the codebase. Every decision has a reason. Ask me any of them.
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
                      <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "var(--color-text-muted)", margin: "0 0 2px", letterSpacing: "0.08em" }}>{item.year}</p>
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
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "8px" }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
              {STACK.map((item) => (
                <Link
                  key={item.name}
                  href={`/blog/${item.blogSlug}`}
                  style={{ textDecoration: "none" }}
                >
                  <article
                    className="stack-card"
                    style={{
                      "--card-hover-border": item.hoverBorder,
                      background: "var(--color-bg-surface)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: "12px",
                      padding: "20px 22px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      cursor: "pointer",
                    } as React.CSSProperties}
                  >
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ width: "32px", height: "32px", borderRadius: "8px", background: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
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
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "8px" }}>
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

        {/* ── DIRECTED OUTPUT ──────────────────────────────────────────── */}
        <section style={{ borderBottom: "1px solid var(--color-border-subtle)", padding: "64px 0", background: "var(--color-purple-dim2)" }}>
          <div className="shell">
            <div style={{ maxWidth: "640px" }}>
              <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "20px" }}>
                Directed Output
              </p>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text)", margin: "0 0 24px" }}>
                AI is a tool. I am the operator.
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", fontSize: "1.0625rem", lineHeight: 1.72, color: "var(--color-text-muted)" }}>
                <p style={{ margin: 0 }}>
                  The calculator did not replace mathematicians. It removed the arithmetic friction so they could solve harder problems faster. AI does the same thing for software development — it removes execution bottlenecks so judgment, taste, and direction can operate at higher speed.
                </p>
                <p style={{ margin: 0 }}>
                  I use Claude the same way I use TypeScript or a linter: I give it precise instructions, evaluate the output, take what works, and discard what does not. Every architectural decision in this project — the three-layer duplicate-vote prevention, the atomic RPC replacing five sequential queries, the security header configuration — was mine. Those decisions require understanding the system. The tool does not have that understanding. I do.
                </p>
                <p style={{ margin: 0 }}>
                  The competitive gap in this industry is not AI versus developers. It is developers using AI versus developers who are not.
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
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "12px" }}>
                  Available for hire
                </p>
                <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text)", margin: "0 0 10px" }}>
                  Let&apos;s build something real.
                </h2>
                <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", margin: 0, maxWidth: "440px" }}>
                  I take on client work. If you need someone who ships fast, makes deliberate decisions, and can explain every one of them — reach out.
                </p>
                <Link
                  href="/join?track=artist"
                  style={{ display: "inline-flex", alignItems: "center", marginTop: "16px", padding: "10px 20px", background: "var(--color-status-warning)", borderRadius: "100px", fontFamily: "var(--font-dm-mono)", fontSize: "12px", fontWeight: 700, color: "#08080e", textDecoration: "none", letterSpacing: "0.06em" }}
                >
                  Apply as an artist →
                </Link>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <a
                  href="mailto:hello@olliedoesis.dev"
                  style={{ display: "inline-flex", alignItems: "center", padding: "12px 28px", background: "var(--color-purple)", borderRadius: "100px", fontFamily: "var(--font-syne)", fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text)", textDecoration: "none", letterSpacing: "0.01em" }}
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
