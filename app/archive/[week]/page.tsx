import { createPublicClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { CommentSection } from "@/components/comments/CommentSection";
import { JsonLd } from "@/components/layout/JsonLd";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: { week: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const week = params.week;
  const title = `Day ${week} Results — AI Art Arena`;
  const description = `Final results and winner for Day ${week} of the AI Art Arena AI art voting contest.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/archive/${week}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/archive/${week}`,
      siteName: "AI Art Arena",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: `AI Art Arena Day ${week} results` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

export default async function ArchiveWeekPage({ params }: Props) {
  const week = parseInt(params.week, 10);
  if (isNaN(week)) notFound();

  const supabase = createPublicClient();

  const { data: contest, error } = await supabase
    .from("contests")
    .select("id, contest_number, start_date, end_date, status, artworks(id, title, image_url, vote_count, prompt)")
    .eq("contest_number", week)
    .eq("status", "archived")
    .single();

  if (error || !contest) notFound();

  const artworks = (contest.artworks as Array<{
    id: string;
    title: string;
    image_url: string;
    vote_count: number;
    prompt: string | null;
  }>).slice().sort((a, b) => b.vote_count - a.vote_count);

  const totalVotes = artworks.reduce((sum, a) => sum + a.vote_count, 0);
  const winner = artworks[0] ?? null;

  const RANK_COLORS: Record<number, string> = { 0: "var(--color-status-warning)", 1: "var(--color-rank-silver)", 2: "var(--color-rank-bronze)" };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `AI Art Arena — Contest #${contest.contest_number} Results`,
    description: `Final results for Contest #${contest.contest_number} of the AI Art Arena AI art voting contest.`,
    startDate: contest.start_date,
    endDate: contest.end_date,
    eventStatus: "https://schema.org/EventEnded",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: { "@type": "VirtualLocation", url: `${SITE_URL}/archive/${contest.contest_number}` },
    organizer: { "@type": "Organization", name: "AI Art Arena", url: SITE_URL },
    url: `${SITE_URL}/archive/${contest.contest_number}`,
    ...(winner ? { winner: { "@type": "CreativeWork", name: winner.title } } : {}),
  };

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <JsonLd data={jsonLd} />
        {/* Back link */}
        <Link
          href="/archive"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8125rem",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            marginBottom: "32px",
          }}
        >
          ← Archive
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-purple-light)",
              marginBottom: "8px",
            }}
          >
            Archived — {new Date(contest.end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5vw, 3rem)",
              letterSpacing: "-0.03em",
              color: "var(--color-text)",
              marginBottom: "16px",
            }}
          >
            Contest #{contest.contest_number} Results
          </h1>
          <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "1.25rem",
                fontWeight: 500,
                color: "var(--color-text)",
              }}
            >
              {totalVotes.toLocaleString()}
            </span>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>total votes cast</span>
          </div>
        </div>

        {/* Winner spotlight */}
        {winner && (
          <div
            style={{
              display: "flex",
              gap: "28px",
              alignItems: "center",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-status-warning-border)",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "40px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "140px",
                height: "140px",
                flexShrink: 0,
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Image
                src={winner.image_url}
                alt={winner.title}
                fill
                sizes="140px"
                priority
                className="object-cover"
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-status-warning)",
                  background: "var(--color-status-warning-dim)",
                  border: "1px solid var(--color-status-warning-border)",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  marginBottom: "10px",
                }}
              >
                ★ Contest #{contest.contest_number} Champion
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "var(--color-text)",
                  marginBottom: "6px",
                }}
              >
                {winner.title}
              </h2>
              {winner.prompt && (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: "8px" }}>
                  &ldquo;{winner.prompt}&rdquo;
                </p>
              )}
              <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", color: "var(--color-purple-light)" }}>
                {winner.vote_count.toLocaleString()} votes
                {totalVotes > 0 && (
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {" "}({((winner.vote_count / totalVotes) * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* All results */}
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-purple-light)",
            marginBottom: "20px",
          }}
        >
          Final standings
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--color-border-subtle)", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--color-border-subtle)" }}>
          {artworks.map((artwork, index) => {
            const pct = totalVotes > 0 ? ((artwork.vote_count / totalVotes) * 100).toFixed(1) : "0";
            const rankColor = RANK_COLORS[index] ?? "var(--color-text-dim)";
            return (
              <div
                key={artwork.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 20px",
                  background: "var(--color-bg-surface)",
                }}
              >
                {/* Rank */}
                <span
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: rankColor,
                    width: "24px",
                    flexShrink: 0,
                    textAlign: "right",
                  }}
                >
                  #{index + 1}
                </span>

                {/* Thumbnail */}
                <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0, borderRadius: "6px", overflow: "hidden" }}>
                  <Image src={artwork.image_url} alt={artwork.title} fill sizes="48px" className="object-cover" />
                </div>

                {/* Title + bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "6px",
                    }}
                  >
                    {artwork.title}
                  </p>
                  <div style={{ height: "3px", background: "var(--color-bg-surface3)", borderRadius: "100px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: index === 0 ? "var(--color-status-warning)" : "var(--color-purple)",
                        borderRadius: "100px",
                      }}
                    />
                  </div>
                </div>

                {/* Votes */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", color: "var(--color-text)", fontWeight: 500 }}>
                    {artwork.vote_count.toLocaleString()}
                  </span>
                  <span style={{ display: "block", fontFamily: "var(--font-dm-mono)", fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Attribution */}
        <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", margin: "40px 0 0", letterSpacing: "0.04em" }}>
          Built by <a href="/about" style={{ color: "var(--color-purple-light)", textDecoration: "none" }}>Oliver White</a>
        </p>

        {/* Per-artwork comment sections */}
        {artworks.map((artwork) => (
          <div key={artwork.id} style={{ marginTop: "48px" }}>
            <p style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "2px",
            }}>
              {artwork.title}
            </p>
            <div style={{ height: "1px", background: "var(--color-border-subtle)", marginBottom: "0" }} />
            <CommentSection artworkId={artwork.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
