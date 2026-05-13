import Link from "next/link";
import { ArtMosaic } from "@/components/home/ArtMosaic";
import { SITE_URL } from "@/lib/site";
import { LastWinner } from "@/components/home/LastWinner";
import { getHomeData } from "@/lib/data/home";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Six artworks drop",
    body: "Every week, six fresh AI-generated images enter the arena — each built from a unique prompt.",
  },
  {
    step: "02",
    title: "You vote once",
    body: "One vote per contest. No account required. Pick the artwork that stops you in your tracks.",
  },
  {
    step: "03",
    title: "Champion is crowned",
    body: "When the timer hits zero, the highest-voted piece wins. Results live forever in the Archive.",
  },
];

export default async function HomePage() {
  const { stats, mosaicArtworks, lastWinner, lastWinnerWeek } = await getHomeData();
  const activeId = stats?.active_id ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI Art Arena",
    url: SITE_URL,
    description: "Vote on stunning AI-generated artwork every week. Discover amazing AI art and help crown the weekly champion.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/archive` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="animate-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section style={{ paddingTop: "100px", paddingBottom: "60px" }}>
        <div className="shell" style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-purple-light)",
              marginBottom: "24px",
            }}
          >
            Weekly AI Art Voting Contest
          </p>

          <h1
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "var(--color-text)",
              margin: "0 auto 24px",
              maxWidth: "820px",
            }}
          >
            The arena where AI art
            <br />
            <span style={{ color: "var(--color-purple)" }}>earns its crown.</span>
          </h1>

          <p
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.65,
              maxWidth: "560px",
              margin: "0 auto 40px",
            }}
          >
            Six AI-generated artworks. One week. Your vote decides the champion.
            No account needed.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            {activeId ? (
              <Link
                href={`/contest/${activeId}`}
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: "var(--color-bg-base)",
                  background: "var(--color-status-warning)",
                  padding: "13px 32px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                }}
              >
                Vote now &mdash; Week {stats?.active_week ?? ""} &rarr;
              </Link>
            ) : (
              <div
                style={{
                  padding: "13px 24px",
                  borderRadius: "100px",
                  background: "var(--color-purple-dim)",
                  border: "1px solid var(--color-border-mid)",
                  fontSize: "0.9375rem",
                  color: "var(--color-text-muted)",
                }}
              >
                No active contest right now. Check back Monday.
              </div>
            )}
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
              Browse Archive
            </Link>
          </div>
        </div>
      </section>

      {/* Art Mosaic */}
      {mosaicArtworks.length > 0 && (
        <ArtMosaic artworks={mosaicArtworks} />
      )}

      {/* Stats strip */}
      {stats && (
        <section style={{ paddingBottom: "80px" }}>
          <div className="shell">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1px",
                background: "var(--color-border-subtle)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              {[
                { label: "Total votes cast", value: stats.total_votes.toLocaleString() },
                { label: "Artworks judged", value: stats.total_artworks.toLocaleString() },
                { label: "Contests run", value: stats.total_contests.toLocaleString() },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "var(--color-bg-surface)",
                    padding: "32px 24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontWeight: 500,
                      fontSize: "2.25rem",
                      color: "var(--color-text)",
                      letterSpacing: "-0.02em",
                      marginBottom: "6px",
                    }}
                  >
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

      {/* How it works */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="shell">
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-purple-light)",
              marginBottom: "16px",
            }}
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              letterSpacing: "-0.03em",
              color: "var(--color-text)",
              marginBottom: "48px",
            }}
          >
            Simple by design.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1px",
              background: "var(--color-border-subtle)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            {HOW_IT_WORKS.map(({ step, title, body }, i) => (
              <div
                key={step}
                className="animate-card"
                style={{ "--card-delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <div style={{ background: "var(--color-bg-surface)", padding: "36px 28px", height: "100%" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      color: "var(--color-purple)",
                      marginBottom: "16px",
                    }}
                  >
                    {step}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: "var(--color-text)",
                      marginBottom: "10px",
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.65 }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Last Winner */}
      {lastWinner && lastWinnerWeek !== null && (
        <LastWinner artwork={lastWinner} weekNumber={lastWinnerWeek} />
      )}

      {/* ── Profile CTA ─────────────────────────────────────────── */}
      <section style={{ paddingBottom: "80px" }}>
        <div className="shell">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "32px",
              alignItems: "center",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "14px",
              padding: "36px 40px",
            }}
          >
            <div>
              <p style={{
                fontSize: "11px",
                fontFamily: "var(--font-dm-mono)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-purple-light)",
                marginBottom: "10px",
              }}>
                Track your votes
              </p>
              <h2 style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 800,
                fontSize: "clamp(1.25rem, 3vw, 1.625rem)",
                letterSpacing: "-0.03em",
                color: "var(--color-text)",
                marginBottom: "8px",
              }}>
                Create a free profile.
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0, maxWidth: "480px" }}>
                Sign in with GitHub or your email to link votes to your profile, see your contest history, and appear in the community.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
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
                  fontSize: "0.75rem",
                  fontWeight: 500,
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

      {/* ── Artist Application CTA ──────────────────────────────── */}
      <section style={{ paddingBottom: "120px" }}>
        <div className="shell">
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(139,92,246,0.04) 60%, transparent 100%)",
              border: "1px solid var(--color-border-mid)",
              borderRadius: "14px",
              padding: "56px 48px",
              textAlign: "center",
            }}
          >
            {/* Orb */}
            <div aria-hidden="true" style={{
              position: "absolute",
              top: "-60px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "500px",
              height: "240px",
              background: "radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <p style={{
              fontSize: "11px",
              fontFamily: "var(--font-dm-mono)",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-purple-light)",
              marginBottom: "16px",
              position: "relative",
            }}>
              For AI artists
            </p>
            <h2 style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              letterSpacing: "-0.04em",
              color: "var(--color-text)",
              margin: "0 0 16px",
              position: "relative",
            }}>
              Want your work in the arena?
            </h2>
            <p style={{
              fontSize: "1rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.65,
              maxWidth: "460px",
              margin: "0 auto 36px",
              position: "relative",
            }}>
              Apply to enter your AI-generated artwork in a future contest. We accept all styles, models, and prompting approaches — the only judge is the crowd.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <Link
                href="/join?track=artist"
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: "var(--color-bg-base)",
                  background: "var(--color-status-warning)",
                  padding: "13px 32px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                }}
              >
                Apply as an artist &rarr;
              </Link>
              <Link
                href="/join?track=subscriber"
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
                Just keep me posted
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
