import Link from "next/link";
import { createPublicClient as createClient } from "@/lib/supabase/server";
import { ArtMosaic } from "@/components/home/ArtMosaic";
import { LastWinner } from "@/components/home/LastWinner";

export const revalidate = 60;

async function getHomeData() {
  const supabase = createClient();

  const [statsResult, mosaicResult, lastWinnerResult] = await Promise.all([
    supabase.rpc("get_homepage_stats"),

    supabase
      .from("artworks")
      .select("id, title, image_url, contest_id, contests!inner(status)")
      .eq("contests.status", "active")
      .limit(6),

    // Use limit(1) + maybeSingle() so no error when no archived contests exist
    supabase
      .from("contests")
      .select("id, week_number, artworks(id, title, image_url, vote_count, contest_id)")
      .eq("status", "archived")
      .order("week_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const stats =
    statsResult.data && statsResult.data.length > 0
      ? (statsResult.data[0] as {
          total_votes: number;
          total_artworks: number;
          total_contests: number;
          active_id: string | null;
          active_week: number | null;
        })
      : null;

  const mosaicArtworks = (mosaicResult.data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    image_url: a.image_url,
  }));

  const lastWinnerContest = lastWinnerResult.data;
  let lastWinner: {
    id: string;
    title: string;
    image_url: string;
    vote_count: number;
    contest_id: string;
  } | null = null;
  let lastWinnerWeek: number | null = null;

  if (lastWinnerContest) {
    const artworks = lastWinnerContest.artworks as Array<{
      id: string;
      title: string;
      image_url: string;
      vote_count: number;
      contest_id: string;
    }>;
    const winner = artworks?.sort((a, b) => b.vote_count - a.vote_count)[0] ?? null;
    if (winner) {
      lastWinner = winner;
      lastWinnerWeek = lastWinnerContest.week_number;
    }
  }

  return { stats, mosaicArtworks, lastWinner, lastWinnerWeek };
}

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

  return (
    <div className="animate-page">
      {/* Hero */}
      <section style={{ paddingTop: "100px", paddingBottom: "60px" }}>
        <div className="shell" style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#a78bfa",
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
              color: "#eeeeff",
              margin: "0 auto 24px",
              maxWidth: "820px",
            }}
          >
            The arena where AI art
            <br />
            <span style={{ color: "#8b5cf6" }}>earns its crown.</span>
          </h1>

          <p
            style={{
              fontSize: "1.0625rem",
              color: "#7878a0",
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
                  color: "#08080e",
                  background: "#fbbf24",
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
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  fontSize: "0.9375rem",
                  color: "#7878a0",
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
                color: "#a78bfa",
                background: "rgba(139,92,246,0.10)",
                border: "1px solid rgba(139,92,246,0.25)",
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
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.12)",
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
                    background: "#111119",
                    padding: "32px 24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontWeight: 500,
                      fontSize: "2.25rem",
                      color: "#eeeeff",
                      letterSpacing: "-0.02em",
                      marginBottom: "6px",
                    }}
                  >
                    {value}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#7878a0", fontWeight: 500 }}>
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
              color: "#a78bfa",
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
              color: "#eeeeff",
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
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.12)",
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
                <div style={{ background: "#111119", padding: "36px 28px", height: "100%" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      color: "#8b5cf6",
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
                      color: "#eeeeff",
                      marginBottom: "10px",
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#7878a0", lineHeight: 1.65 }}>
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
    </div>
  );
}
