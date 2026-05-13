import Link from "next/link";
import { ArtMosaic } from "@/components/home/ArtMosaic";
import { SITE_URL } from "@/lib/site";
import { LastWinner } from "@/components/home/LastWinner";
import { getHomeData } from "@/lib/data/home";
import { JsonLd } from "@/components/layout/JsonLd";
import { BlogCarousel } from "@/components/blog/BlogCarousel";
import { BLOG_POSTS } from "@/lib/blog";

const TECH_STACK = [
  { name: "Next.js 15", detail: "App Router, ISR, Server Components" },
  { name: "PostgreSQL", detail: "Atomic RPCs, RLS, custom indexes" },
  { name: "Supabase", detail: "Auth, Storage, Realtime subscriptions" },
  { name: "Upstash Redis", detail: "Sliding-window rate limiting" },
  { name: "NextAuth v5", detail: "GitHub OAuth + magic links" },
  { name: "Inngest", detail: "Serverless background jobs" },
  { name: "Vercel", detail: "Edge deployment, CI/CD" },
  { name: "TypeScript", detail: "Strict mode throughout" },
];

const BUILD_POINTS = [
  {
    label: "Architected end-to-end",
    body: "Every schema decision, every API contract, every security boundary — designed before a single line was written.",
  },
  {
    label: "Production-grade security",
    body: "CSP with per-request nonces, IP hashing, Zod validation on every input, RLS on every table, rate limiting on every endpoint.",
  },
  {
    label: "AI-assisted, human-led",
    body: "Built with AI as a collaborator. Every decision — what to build, how to structure it, what to leave out — was mine.",
  },
  {
    label: "Real performance engineering",
    body: "Five sequential DB queries became one atomic PostgreSQL function. Vote latency dropped from ~200ms to ~40ms.",
  },
];

const carouselPosts = [...BLOG_POSTS]
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  .slice(0, 8)
  .map(({ slug, title, excerpt, tags, publishedAt, readingTime }) => ({
    slug, title, excerpt, tags, publishedAt, readingTime,
  }));

export default async function HomePage() {
  const { stats, mosaicArtworks, lastWinner, lastWinnerWeek } = await getHomeData();
  const activeId = stats?.active_id ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI Art Arena",
    url: SITE_URL,
    description: "A full-stack AI art voting platform built from scratch by Oliver White — Next.js, PostgreSQL, Supabase, Redis, and TypeScript.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/archive` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="animate-page">
      <JsonLd data={jsonLd} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ paddingTop: "100px", paddingBottom: "64px" }}>
        <div className="shell">
          <div style={{ maxWidth: "760px" }}>
            <p style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-purple-light)",
              fontFamily: "var(--font-dm-mono)",
              marginBottom: "24px",
            }}>
              Built by Oliver White
            </p>

            <h1 style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "clamp(2.25rem, 6vw, 4.25rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "var(--color-text)",
              margin: "0 0 24px",
            }}>
              A full-stack platform,
              <br />
              <span style={{ color: "var(--color-purple)" }}>built from scratch.</span>
            </h1>

            <p style={{
              fontSize: "1.0625rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              maxWidth: "560px",
              margin: "0 0 16px",
            }}>
              AI Art Arena is a weekly AI art voting contest — and the vehicle for demonstrating
              what it takes to ship a production-grade web application in 2026.
              Every piece of the stack was chosen deliberately. Every tradeoff was made consciously.
            </p>

            <p style={{
              fontSize: "0.9375rem",
              color: "var(--color-text-dim)",
              lineHeight: 1.65,
              maxWidth: "520px",
              margin: "0 0 40px",
              fontFamily: "var(--font-dm-mono)",
            }}>
              Next.js &middot; PostgreSQL &middot; Supabase &middot; Redis &middot; TypeScript &middot; Vercel
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link
                href="/about"
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: "var(--color-bg-base)",
                  background: "var(--color-purple)",
                  padding: "13px 32px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                }}
              >
                How it was built &rarr;
              </Link>
              {activeId ? (
                <Link
                  href={`/contest/${activeId}`}
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    color: "var(--color-status-warning)",
                    background: "var(--color-status-warning-dim)",
                    border: "1px solid rgba(251,191,36,0.25)",
                    padding: "13px 32px",
                    borderRadius: "100px",
                    textDecoration: "none",
                  }}
                >
                  See the live contest &rarr;
                </Link>
              ) : (
                <Link
                  href="/archive"
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    color: "var(--color-purple-light)",
                    background: "var(--color-purple-dim)",
                    border: "1px solid var(--color-border-mid)",
                    padding: "13px 32px",
                    borderRadius: "100px",
                    textDecoration: "none",
                  }}
                >
                  Browse archive
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Art Mosaic ───────────────────────────────────────────── */}
      {mosaicArtworks.length > 0 && (
        <ArtMosaic artworks={mosaicArtworks} />
      )}

      {/* ── Live stats ───────────────────────────────────────────── */}
      {stats && (
        <section style={{ paddingBottom: "80px" }}>
          <div className="shell">
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px",
              background: "var(--color-border-subtle)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "14px",
              overflow: "hidden",
            }}>
              {[
                { label: "Votes cast", value: stats.total_votes.toLocaleString() },
                { label: "Artworks judged", value: stats.total_artworks.toLocaleString() },
                { label: "Contests run", value: stats.total_contests.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "var(--color-bg-surface)", padding: "32px 24px", textAlign: "center" }}>
                  <div style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontWeight: 500,
                    fontSize: "2.25rem",
                    color: "var(--color-text)",
                    letterSpacing: "-0.02em",
                    marginBottom: "6px",
                  }}>
                    {value}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── What was built ───────────────────────────────────────── */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "56px" }} className="build-section-grid">

            {/* Left: build story */}
            <div style={{ maxWidth: "560px" }}>
              <p style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-purple-light)",
                fontFamily: "var(--font-dm-mono)",
                marginBottom: "16px",
              }}>
                The build
              </p>
              <h2 style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 800,
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                letterSpacing: "-0.03em",
                color: "var(--color-text)",
                margin: "0 0 20px",
                lineHeight: 1.1,
              }}>
                Each layer engineered to hold weight.
              </h2>
              <p style={{
                fontSize: "1rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                margin: "0 0 32px",
              }}>
                The same stack trusted by companies like Vercel, GitHub, Linear, and Loom.
                The difference is that every part here — from the database schema to the
                rate limiter to the CSP headers — was designed and wired together by one person.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {BUILD_POINTS.map((pt) => (
                  <div key={pt.label} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--color-purple)",
                      flexShrink: 0,
                      marginTop: "8px",
                    }} />
                    <div>
                      <p style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize: "0.9375rem",
                        color: "var(--color-text)",
                        margin: "0 0 4px",
                      }}>
                        {pt.label}
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.65, margin: 0 }}>
                        {pt.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "36px" }}>
                <Link
                  href="/about"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--color-purple-light)",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                  }}
                >
                  Read the full breakdown &rarr;
                </Link>
              </div>
            </div>

            {/* Right: tech stack grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <p style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-text-dim)",
                fontFamily: "var(--font-dm-mono)",
                marginBottom: "12px",
              }}>
                Stack
              </p>
              {TECH_STACK.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    padding: "14px 20px",
                    background: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--color-text)",
                  }}>
                    {item.name}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    textAlign: "right",
                  }}>
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Blog carousel ────────────────────────────────────────── */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }} className="blog-carousel-grid">
            <div>
              <p style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-purple-light)",
                fontFamily: "var(--font-dm-mono)",
                marginBottom: "16px",
              }}>
                Writing
              </p>
              <h2 style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 800,
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                letterSpacing: "-0.03em",
                color: "var(--color-text)",
                margin: "0 0 16px",
                lineHeight: 1.1,
              }}>
                Real problems.<br />
                <span style={{ color: "var(--color-text-dim)" }}>Real solutions.</span>
              </h2>
              <p style={{
                fontSize: "1rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                maxWidth: "440px",
                margin: "0 0 32px",
              }}>
                Deep dives into Next.js, PostgreSQL, Supabase, and the engineering
                decisions behind this platform. Written while building it.
              </p>
              <Link
                href="/blog"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-purple-light)",
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
              >
                All {BLOG_POSTS.length} posts &rarr;
              </Link>
            </div>

            <div style={{ maxWidth: "600px" }}>
              <BlogCarousel posts={carouselPosts} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Last winner ──────────────────────────────────────────── */}
      {lastWinner && lastWinnerWeek !== null && (
        <LastWinner artwork={lastWinner} weekNumber={lastWinnerWeek} />
      )}

      {/* ── Contest CTA ──────────────────────────────────────────── */}
      <section style={{ paddingBottom: "80px" }}>
        <div className="shell">
          <div style={{
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(139,92,246,0.04) 60%, transparent 100%)",
            border: "1px solid var(--color-border-mid)",
            borderRadius: "14px",
            padding: "56px 48px",
          }}>
            <div aria-hidden style={{
              position: "absolute",
              top: "-60px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "500px",
              height: "240px",
              background: "radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "center", flexWrap: "wrap", position: "relative" }}>
              <div>
                <p style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-mono)",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-purple-light)",
                  marginBottom: "12px",
                }}>
                  The contest
                </p>
                <h2 style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 800,
                  fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                  letterSpacing: "-0.03em",
                  color: "var(--color-text)",
                  margin: "0 0 12px",
                  lineHeight: 1.1,
                }}>
                  {activeId
                    ? `Week ${stats?.active_week ?? ""} is live.`
                    : "No contest running right now."}
                </h2>
                <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.65, margin: 0, maxWidth: "480px" }}>
                  {activeId
                    ? "A fresh set of AI-generated artworks, one vote per person. Pick the piece that stops you in your tracks."
                    : "Check back Monday when the next round of artworks drops. Or browse the archive to see past results."}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
                {activeId ? (
                  <Link
                    href={`/contest/${activeId}`}
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      color: "var(--color-bg-base)",
                      background: "var(--color-status-warning)",
                      padding: "13px 28px",
                      borderRadius: "100px",
                      textDecoration: "none",
                      letterSpacing: "0.01em",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Vote now &rarr;
                  </Link>
                ) : (
                  <Link
                    href="/archive"
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      color: "var(--color-bg-base)",
                      background: "var(--color-purple)",
                      padding: "13px 28px",
                      borderRadius: "100px",
                      textDecoration: "none",
                      letterSpacing: "0.01em",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Browse archive &rarr;
                  </Link>
                )}
                <Link
                  href="/join?track=artist"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--color-text-dim)",
                    textDecoration: "none",
                    textAlign: "center",
                    letterSpacing: "0.04em",
                  }}
                >
                  Submit artwork &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Profile CTA ──────────────────────────────────────────── */}
      <section style={{ paddingBottom: "120px" }}>
        <div className="shell">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "32px",
            alignItems: "center",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "14px",
            padding: "32px 40px",
          }}>
            <div>
              <p style={{
                fontSize: "11px",
                fontFamily: "var(--font-dm-mono)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-text-dim)",
                marginBottom: "8px",
              }}>
                Track your votes
              </p>
              <h2 style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "clamp(1rem, 2.5vw, 1.375rem)",
                letterSpacing: "-0.02em",
                color: "var(--color-text)",
                marginBottom: "6px",
              }}>
                Sign in to link your votes to a profile.
              </h2>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0, maxWidth: "440px" }}>
                GitHub OAuth or email. See your full contest history, appear in the community.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
              <Link
                href="/api/auth/signin"
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "var(--color-bg-base)",
                  background: "var(--color-purple)",
                  padding: "11px 24px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                Create profile &rarr;
              </Link>
              <Link
                href="/profile/me"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "11px",
                  color: "var(--color-text-dim)",
                  textDecoration: "none",
                  textAlign: "center",
                  letterSpacing: "0.04em",
                }}
              >
                Already signed in? View yours
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
