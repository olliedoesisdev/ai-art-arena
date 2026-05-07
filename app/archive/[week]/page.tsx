import { createPublicClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 3600;

type Props = { params: { week: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Week ${params.week} Results — AI Art Arena`,
    description: `Final results for Week ${params.week} of the AI Art Arena voting contest.`,
  };
}

export default async function ArchiveWeekPage({ params }: Props) {
  const week = parseInt(params.week, 10);
  if (isNaN(week)) notFound();

  const supabase = createPublicClient();

  const { data: contest, error } = await supabase
    .from("contests")
    .select("id, week_number, start_date, end_date, status, artworks(id, title, image_url, vote_count, prompt)")
    .eq("week_number", week)
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

  const RANK_COLORS: Record<number, string> = { 0: "#fbbf24", 1: "#b0b0c8", 2: "#c07840" };

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        {/* Back link */}
        <Link
          href="/archive"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8125rem",
            color: "#7878a0",
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
              color: "#a78bfa",
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
              color: "#eeeeff",
              marginBottom: "16px",
            }}
          >
            Week {contest.week_number} Results
          </h1>
          <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "1.25rem",
                fontWeight: 500,
                color: "#eeeeff",
              }}
            >
              {totalVotes.toLocaleString()}
            </span>
            <span style={{ fontSize: "0.8125rem", color: "#7878a0" }}>total votes cast</span>
          </div>
        </div>

        {/* Winner spotlight */}
        {winner && (
          <div
            style={{
              display: "flex",
              gap: "28px",
              alignItems: "center",
              background: "#111119",
              border: "1px solid rgba(251,191,36,0.2)",
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
                  color: "#fbbf24",
                  background: "rgba(251,191,36,0.08)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  marginBottom: "10px",
                }}
              >
                ★ Week {contest.week_number} Champion
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "#eeeeff",
                  marginBottom: "6px",
                }}
              >
                {winner.title}
              </h2>
              {winner.prompt && (
                <p style={{ fontSize: "0.8125rem", color: "#7878a0", lineHeight: 1.5, marginBottom: "8px" }}>
                  &ldquo;{winner.prompt}&rdquo;
                </p>
              )}
              <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", color: "#a78bfa" }}>
                {winner.vote_count.toLocaleString()} votes
                {totalVotes > 0 && (
                  <span style={{ color: "#3a3a58" }}>
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
            color: "#a78bfa",
            marginBottom: "20px",
          }}
        >
          Final standings
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(139,92,246,0.12)" }}>
          {artworks.map((artwork, index) => {
            const pct = totalVotes > 0 ? ((artwork.vote_count / totalVotes) * 100).toFixed(1) : "0";
            const rankColor = RANK_COLORS[index] ?? "#3a3a58";
            return (
              <div
                key={artwork.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 20px",
                  background: "#111119",
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
                      color: "#eeeeff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "6px",
                    }}
                  >
                    {artwork.title}
                  </p>
                  <div style={{ height: "3px", background: "#1f1f2a", borderRadius: "100px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: index === 0 ? "#fbbf24" : "#8b5cf6",
                        borderRadius: "100px",
                      }}
                    />
                  </div>
                </div>

                {/* Votes */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", color: "#eeeeff", fontWeight: 500 }}>
                    {artwork.vote_count.toLocaleString()}
                  </span>
                  <span style={{ display: "block", fontFamily: "var(--font-dm-mono)", fontSize: "0.6875rem", color: "#3a3a58" }}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
