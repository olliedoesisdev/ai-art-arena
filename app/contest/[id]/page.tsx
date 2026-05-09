import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { Metadata } from "next";
import { ContestHeader } from "@/components/contest/ContestHeader";
import { SITE_URL } from "@/lib/site";
import { StatsStrip } from "@/components/contest/StatsStrip";
import { VoteAlert } from "@/components/contest/VoteAlert";
import { ArtworkCard } from "@/components/contest/ArtworkCard";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contest } = await supabase
    .from("contests")
    .select("week_number")
    .eq("id", id)
    .single();

  const week = contest?.week_number;
  return {
    title: week ? `Vote on AI Art — Week ${week} | AI Art Arena` : "Contest — AI Art Arena",
    description: week
      ? `Vote for the best AI-generated artwork in Week ${week}. One vote per contest, no account needed.`
      : "Vote for your favourite AI-generated artwork.",
    alternates: { canonical: `${SITE_URL}/contest/${id}` },
    openGraph: {
      title: week ? `Vote on AI Art — Week ${week} | AI Art Arena` : "Contest — AI Art Arena",
      description: `Week ${week} is live. Pick your favourite AI artwork.`,
      url: `${SITE_URL}/contest/${id}`,
      siteName: "AI Art Arena",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: week ? `Vote on AI Art — Week ${week} | AI Art Arena` : "Contest — AI Art Arena",
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

export default async function ContestPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const session = await auth();

  const [{ data: contest, error: contestError }, { data: artworks }] = await Promise.all([
    supabase.from("contests").select("*").eq("id", id).single(),
    supabase
      .from("artworks")
      .select("*")
      .eq("contest_id", id)
      .order("display_order"),
  ]);

  if (contestError || !contest) notFound();

  if (contest.status === "archived") {
    const { data: active } = await supabase
      .from("contests")
      .select("id")
      .eq("status", "active")
      .order("week_number", { ascending: false })
      .limit(1)
      .single();
    redirect(active ? `/contest/${active.id}` : "/");
  }

  let hasVoted = false;
  let userVoteArtworkId: string | null = null;

  if (session?.user) {
    const { data: vote } = await supabase
      .from("votes")
      .select("artwork_id")
      .eq("contest_id", id)
      .eq("user_id", session.user.id)
      .single();
    hasVoted = !!vote;
    userVoteArtworkId = vote?.artwork_id ?? null;
  }

  const totalVotes = artworks?.reduce((sum, a) => sum + (a.vote_count ?? 0), 0) ?? 0;
  const maxVotes = artworks && artworks.length > 0 ? Math.max(...artworks.map((a) => a.vote_count)) : 0;
  const contestEnded = new Date(contest.end_date) <= new Date();

  const votedArtwork = userVoteArtworkId
    ? artworks?.find((a) => a.id === userVoteArtworkId)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `AI Art Arena — Week ${contest.week_number}`,
    description: `Vote for the best AI-generated artwork in Week ${contest.week_number}. One vote per contest.`,
    startDate: contest.start_date,
    endDate: contest.end_date,
    eventStatus: contest.status === "active"
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventEnded",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: { "@type": "VirtualLocation", url: `${SITE_URL}/contest/${id}` },
    organizer: { "@type": "Organization", name: "AI Art Arena", url: SITE_URL },
    url: `${SITE_URL}/contest/${id}`,
  };

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="shell">
        <ContestHeader
          weekNumber={contest.week_number}
          endDate={contest.end_date}
          status={contest.status}
        />

        <StatsStrip totalVotes={totalVotes} artworkCount={artworks?.length ?? 0} />

        {/* Vote success alert */}
        {hasVoted && votedArtwork && (
          <VoteAlert artworkTitle={votedArtwork.title} />
        )}

        {/* Already voted — anonymous, no artwork match */}
        {hasVoted && !votedArtwork && (
          <div
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "#06b6d4",
            }}
          >
            <span>✓</span>
            <span>Vote submitted — results update live.</span>
          </div>
        )}

        {/* Contest ended banner */}
        {contestEnded && (
          <div
            style={{
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "32px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "#a78bfa",
            }}
          >
            This contest has ended — results are final.
          </div>
        )}

        {/* Artwork grid */}
        {artworks && artworks.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {artworks.map((artwork, index) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                contestId={contest.id}
                index={index}
                isLeading={artwork.vote_count === maxVotes && maxVotes > 0}
                isUserVote={userVoteArtworkId === artwork.id}
                hasVoted={hasVoted}
                totalVotes={totalVotes}
                contestEnded={contestEnded}
                isAuthenticated={!!session?.user}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "#111119",
              border: "1px solid rgba(139,92,246,0.12)",
              borderRadius: "14px",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "#7878a0" }}>
              No artworks have been uploaded for this contest yet. Check back soon.
            </p>
          </div>
        )}
        {/* Join CTA strip */}
        <div
          style={{
            marginTop: "64px",
            background: "#111119",
            border: "1px solid #1f1f1f",
            borderRadius: "12px",
            padding: "32px 36px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          <div>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.25rem", fontWeight: 800, color: "#eeeeff", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
              Want to compete?
            </h3>
            <p style={{ color: "#7878a0", fontSize: "14px", margin: 0 }}>
              Apply to enter your AI artwork in next week&apos;s contest.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a
              href="/join?track=subscriber"
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid rgba(232,213,183,0.4)",
                borderRadius: "6px",
                color: "#e8d5b7",
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Subscribe
            </a>
            <a
              href="/join?track=artist"
              style={{
                padding: "10px 20px",
                background: "#e8d5b7",
                borderRadius: "6px",
                color: "#0a0a0a",
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Apply as Artist
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
