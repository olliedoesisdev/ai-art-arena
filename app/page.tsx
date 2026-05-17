import { Metadata } from "next";
import Link from "next/link";
import { ArtCarousel } from "@/components/home/ArtCarousel";
import { SITE_URL } from "@/lib/site";
import { LastWinner } from "@/components/home/LastWinner";
import { getHomeData } from "@/lib/data/home";
import { JsonLd } from "@/components/layout/JsonLd";
import { BlogCarousel } from "@/components/blog/BlogCarousel";
import { BLOG_POSTS } from "@/lib/blog";
import { auth } from "@/auth";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI Art Arena — Built by Oliver White",
  description:
    "A production AI art voting platform built from scratch. Next.js 14, PostgreSQL, Supabase, Redis, TypeScript. Every architectural decision deliberate. Every tradeoff explainable.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "AI Art Arena — Built by Oliver White",
    description:
      "Production voting platform for AI-generated artwork. Self-taught developer, Directed Output workflow — AI handles execution, Oliver handles everything that matters.",
    url: SITE_URL,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena — built by Oliver White" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Art Arena — Built by Oliver White",
    description: "Production Next.js 14 + Supabase voting platform. Directed Output workflow. Every decision deliberate.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

const PROOF_POINTS = [
  {
    value: "40ms",
    label: "Vote latency",
    sub: "5 queries → 1 atomic RPC",
  },
  {
    value: "8",
    label: "Client components",
    sub: "rest is server-rendered HTML",
  },
  {
    value: "3×",
    label: "Duplicate prevention",
    sub: "IP + user ID + email hash",
  },
  {
    value: "19",
    label: "Migrations",
    sub: "every schema change tracked",
  },
];

const carouselPosts = [...BLOG_POSTS]
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  .slice(0, 8)
  .map(({ slug, title, excerpt, tags, publishedAt, readingTime }) => ({
    slug, title, excerpt, tags, publishedAt, readingTime,
  }));

export default async function HomePage() {
  const [{ stats, mosaicArtworks, lastWinner, lastWinnerContestNumber }, session] = await Promise.all([
    getHomeData(),
    auth(),
  ]);
  const activeId = stats?.active_id ?? null;
  const photoSubmitHref = session?.user
    ? "/profile/me"
    : "/api/auth/signin?callbackUrl=/profile/me";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI Art Arena",
    url: SITE_URL,
    description: "A production AI art voting platform built from scratch by Oliver White — Next.js, PostgreSQL, Supabase, Redis, and TypeScript.",
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
              Full stack developer.<br />
              <span style={{ color: "var(--color-purple-light)" }}>Built with intention.</span>
            </h1>

            <p style={{
              fontSize: "1.0625rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              maxWidth: "560px",
              margin: "0 0 40px",
            }}>
              AI Art Arena is a live voting contest for AI-generated artwork — and the proof of concept
              for a workflow where AI handles execution and the developer handles everything that matters:
              architecture, security, product decisions, and taste.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link
                href="/join?track=artist"
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: "var(--color-text)",
                  background: "var(--color-purple)",
                  padding: "13px 32px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                }}
              >
                Apply as an artist &rarr;
              </Link>
              <Link
                href={photoSubmitHref}
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: "var(--color-text)",
                  background: "transparent",
                  border: "1px solid rgba(139,92,246,0.4)",
                  padding: "13px 32px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                }}
              >
                Submit a photo &rarr;
              </Link>
              <Link
                href="/signin"
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: "var(--color-purple-light)",
                  background: "transparent",
                  border: "1px solid var(--color-border-mid)",
                  padding: "13px 32px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                }}
              >
                Create profile &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Art Carousel ─────────────────────────────────────────── */}
      {mosaicArtworks.length > 0 && (
        <ArtCarousel artworks={mosaicArtworks} />
      )}

      {/* ── Proof points ─────────────────────────────────────────── */}
      <section style={{ paddingBottom: "80px" }}>
        <div className="shell">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: "var(--color-border-subtle)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
          className="proof-grid"
          >
            {PROOF_POINTS.map(({ value, label, sub }) => (
              <div key={label} style={{ background: "var(--color-bg-surface)", padding: "28px 20px", textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontWeight: 500,
                  fontSize: "2rem",
                  color: "var(--color-purple-light)",
                  letterSpacing: "-0.02em",
                  marginBottom: "4px",
                }}>
                  {value}
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text)", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-dm-mono)", marginBottom: "2px" }}>
                  {label}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Directed Output ──────────────────────────────────────── */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="shell">
          <div style={{ display: "grid", gap: "56px" }} className="split-grid">

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
                The approach
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
                AI removes execution bottlenecks.
                <br />
                <span style={{ color: "var(--color-text-muted)" }}>Judgment fills the rest.</span>
              </h2>
              <p style={{
                fontSize: "1rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                margin: "0 0 20px",
              }}>
                Most developers treat AI like autocomplete. That is not this.
              </p>
              <p style={{
                fontSize: "1rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                margin: "0 0 20px",
              }}>
                Every decision in this project — the schema design, the three-layer
                vote fraud prevention, the atomic RPC, the rate limiter configuration
                — started with a problem I understood and a specification I wrote.
                AI shipped the implementation. Fast. The decisions were mine.
              </p>
              <p style={{
                fontSize: "1rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                margin: "0 0 32px",
              }}>
                That gap between directing and executing is where the work actually lives.
              </p>
            </div>

            {/* Right: decisions list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <p style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-purple-light)",
                fontFamily: "var(--font-dm-mono)",
                marginBottom: "12px",
              }}>
                Decisions made
              </p>
              {[
                { decision: "One atomic RPC instead of 5 sequential queries", why: "Eliminates race conditions and cuts vote latency 5×" },
                { decision: "Three independent duplicate-vote layers", why: "IP hash + user ID + email hash — any one catches a fraud attempt" },
                { decision: "8 Client Components out of the entire codebase", why: "Server Components by default. JS bundle stays minimal." },
                { decision: "RLS at the database layer, not the application layer", why: "A compromised route still cannot read or write data it should not" },
                { decision: "pino + requestId on every API route", why: "Client errors correlate to server traces — not guesswork" },
                { decision: "Zod validation before Redis or DB is touched", why: "Malformed input never reaches the infrastructure" },
              ].map((item) => (
                <div
                  key={item.decision}
                  style={{
                    padding: "14px 20px",
                    background: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--color-text)",
                  }}>
                    {item.decision}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    {item.why}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

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

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "center", position: "relative" }} className="cta-grid">
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
                    ? `Contest #${stats?.active_number ?? ""} is live.`
                    : "No contest running right now."}
                </h2>
                <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.65, margin: 0, maxWidth: "480px" }}>
                  {activeId
                    ? "A fresh set of AI-generated artworks. One vote per person. Pick the piece that stops you."
                    : "Check back Monday when the next round drops. Or browse the archive to see past results."}
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
                      color: "var(--color-text)",
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
                    color: "var(--color-text-muted)",
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
                <span style={{ color: "var(--color-text-muted)" }}>Real solutions.</span>
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
      {lastWinner && lastWinnerContestNumber !== null && (
        <LastWinner artwork={lastWinner} contestNumber={lastWinnerContestNumber} />
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
          }} className="profile-cta-grid">
            <div>
              <p style={{
                fontSize: "11px",
                fontFamily: "var(--font-dm-mono)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-purple-light)",
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
                  color: "var(--color-text)",
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
                  color: "var(--color-text-muted)",
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
