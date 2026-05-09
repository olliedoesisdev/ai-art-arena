import { createPublicClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { CommentSection } from "@/components/comments/CommentSection";
import { LiveVoteCount } from "@/components/contest/LiveVoteCount";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("artworks")
    .select("title, prompt, contests(week_number)")
    .eq("id", id)
    .single();

  if (!data) return { title: "Artwork — AI Art Arena" };

  const contestsRaw = data.contests;
  const weekRow = Array.isArray(contestsRaw) ? contestsRaw[0] : contestsRaw;
  const week = (weekRow as { week_number: number } | null)?.week_number;
  return {
    title: `${data.title} — AI Art Arena`,
    description: data.prompt ?? `AI-generated artwork from Week ${week} of AI Art Arena.`,
    alternates: { canonical: `${SITE_URL}/artwork/${id}` },
    openGraph: {
      title: data.title,
      description: data.prompt ?? `AI-generated artwork from Week ${week}.`,
      url: `${SITE_URL}/artwork/${id}`,
      siteName: "AI Art Arena",
      type: "website",
    },
  };
}

export default async function ArtworkPage({ params }: Props) {
  const { id } = await params;
  const supabase = createPublicClient();

  const { data: artwork } = await supabase
    .from("artworks")
    .select("id, title, image_url, prompt, vote_count, contest_id, created_at, contests(id, week_number, status, end_date)")
    .eq("id", id)
    .single();

  if (!artwork) notFound();

  const contest = Array.isArray(artwork.contests)
    ? artwork.contests[0]
    : artwork.contests as { id: string; week_number: number; status: string; end_date: string } | null;

  const contestEnded = contest ? new Date(contest.end_date) <= new Date() : true;
  const contestHref = contest ? `/contest/${contest.id}` : "/archive";

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">

        {/* Back link */}
        <Link
          href={contestHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8125rem",
            color: "#7878a0",
            textDecoration: "none",
            marginBottom: "32px",
            fontFamily: "var(--font-dm-mono)",
          }}
        >
          ← {contest ? `Week ${contest.week_number}` : "Back"}
        </Link>

        {/* Main layout: image left, details right */}
        <div className="grid-artwork-detail">

          {/* Image */}
          <div
            style={{
              position: "relative",
              aspectRatio: "1",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(139,92,246,0.15)",
            }}
          >
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
              priority
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Week badge */}
            {contest && (
              <p style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#a78bfa",
                margin: 0,
              }}>
                Week {contest.week_number} &mdash; {contestEnded ? "Final results" : "Voting open"}
              </p>
            )}

            {/* Title */}
            <h1 style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              letterSpacing: "-0.03em",
              color: "#eeeeff",
              margin: 0,
              lineHeight: 1.1,
            }}>
              {artwork.title}
            </h1>

            {/* Vote count */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "100px",
                padding: "8px 18px",
                alignSelf: "flex-start",
              }}
            >
              <span style={{
                fontFamily: "var(--font-dm-mono)",
                fontWeight: 500,
                fontSize: "1.25rem",
                color: "#eeeeff",
              }}>
                <LiveVoteCount artworkId={artwork.id} initialCount={artwork.vote_count} />
              </span>
              <span style={{ fontSize: "0.8125rem", color: "#7878a0" }}>
                {artwork.vote_count === 1 ? "vote" : "votes"}
              </span>
            </div>

            {/* Prompt */}
            {artwork.prompt && (
              <div
                style={{
                  background: "#111119",
                  border: "1px solid rgba(139,92,246,0.12)",
                  borderRadius: "12px",
                  padding: "20px 24px",
                }}
              >
                <p style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#3a3a58",
                  marginBottom: "10px",
                }}>
                  Prompt
                </p>
                <p style={{
                  fontSize: "0.9375rem",
                  color: "#7878a0",
                  lineHeight: 1.7,
                  fontFamily: "var(--font-dm-mono)",
                  margin: 0,
                }}>
                  {artwork.prompt}
                </p>
              </div>
            )}

            {/* Vote CTA */}
            {!contestEnded && contest && (
              <Link
                href={contestHref}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 28px",
                  background: "#8b5cf6",
                  borderRadius: "100px",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  textDecoration: "none",
                  alignSelf: "flex-start",
                  letterSpacing: "0.01em",
                }}
              >
                Vote in Week {contest.week_number} &rarr;
              </Link>
            )}
          </div>
        </div>

        {/* Comment section */}
        <div style={{ marginTop: "64px" }}>
          <CommentSection artworkId={artwork.id} />
        </div>
      </div>
    </div>
  );
}
