// app/contests/ai-art/[id]/page.tsx [SERVER]
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { Metadata } from "next";
import { ContestHeader } from "@/components/contest/ContestHeader";
import { StatsStrip } from "@/components/contest/StatsStrip";
import { VoteAlert } from "@/components/contest/VoteAlert";
import { ArtworkCard } from "@/components/contest/ArtworkCard";
import { JsonLd } from "@/components/layout/JsonLd";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contest } = await supabase
    .from("contests")
    .select("week_number, theme")
    .eq("id", id)
    .single();

  const title = contest?.theme
    ? `${contest.theme} — AI Art Contest | AI Art Arena`
    : contest?.week_number
    ? `Vote on AI Art — Day ${contest.week_number} | AI Art Arena`
    : "Contest — AI Art Arena";

  const description = contest?.theme
    ? `Vote for the best AI-generated artwork in the "${contest.theme}" contest.`
    : `Vote for the best AI-generated artwork in Day ${contest?.week_number}. One vote per contest.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/contests/ai-art/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/contests/ai-art/${id}`,
      siteName: "AI Art Arena",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena voting contest" }],
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

export default async function AiArtContestPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const session = await auth();

  const [{ data: contest, error: contestError }, { data: artworks }] = await Promise.all([
    supabase.from("contests").select("*").eq("id", id).single(),
    supabase.from("artworks").select("*").eq("contest_id", id).order("display_order"),
  ]);

  if (contestError || !contest) notFound();
  if (contest.contest_type !== "ai_art") notFound();

  if (contest.status === "archived") {
    const { data: active } = await supabase
      .from("contests")
      .select("id")
      .eq("status", "active")
      .eq("contest_type", "ai_art")
      .order("week_number", { ascending: false })
      .limit(1)
      .single();
    redirect(active ? `/contests/ai-art/${active.id}` : "/contests");
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
  const votedArtwork = userVoteArtworkId ? artworks?.find((a) => a.id === userVoteArtworkId) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: contest.theme ? `AI Art Arena — ${contest.theme}` : `AI Art Arena — Day ${contest.week_number}`,
    description: `Vote for the best AI-generated artwork. One vote per contest.`,
    startDate: contest.start_date,
    endDate: contest.end_date,
    eventStatus: contest.status === "active"
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventEnded",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: { "@type": "VirtualLocation", url: `${SITE_URL}/contests/ai-art/${id}` },
    organizer: { "@type": "Organization", name: "AI Art Arena", url: SITE_URL },
    url: `${SITE_URL}/contests/ai-art/${id}`,
  };

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <JsonLd data={jsonLd} />
      <div className="shell">
        <ContestHeader
          contestId={contest.id}
          weekNumber={contest.week_number}
          endDate={contest.end_date}
          status={contest.status}
          contestType="ai_art"
          theme={contest.theme}
          themeDescription={contest.theme_description}
        />

        <StatsStrip totalVotes={totalVotes} artworkCount={artworks?.length ?? 0} startDate={contest.start_date} />

        {hasVoted && votedArtwork && <VoteAlert artworkTitle={votedArtwork.title} />}

        {hasVoted && !votedArtwork && (
          <div
            style={{
              background: "var(--color-card-accent-2-dim)",
              border: "1px solid var(--color-card-accent-2-border)",
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "var(--color-card-accent-2)",
            }}
          >
            <span>✓</span>
            <span>Vote submitted — results update live.</span>
          </div>
        )}

        {contestEnded && (
          <div
            style={{
              background: "var(--color-purple-dim2)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "32px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "var(--color-purple-light)",
            }}
          >
            This contest has ended — results are final.
          </div>
        )}

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
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "14px",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              No artworks have been uploaded for this contest yet. Check back soon.
            </p>
          </div>
        )}

        {/* Join CTA */}
        <div
          style={{
            marginTop: "64px",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-join-border)",
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
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)" }}>
                Built by <a href="/about" style={{ color: "var(--color-purple-light)", textDecoration: "none" }}>Oliver White</a>
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
              Want to compete?
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px", margin: 0 }}>
              Apply to enter your AI artwork in the next contest.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/join?track=subscriber"
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid rgba(232,213,183,0.4)",
                borderRadius: "6px",
                color: "var(--color-join-amber)",
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
            </Link>
            <Link
              href="/join?track=artist"
              style={{
                padding: "10px 20px",
                background: "var(--color-join-amber)",
                borderRadius: "6px",
                color: "var(--color-join-ink)",
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
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
