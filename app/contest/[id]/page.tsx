import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { Metadata } from "next";
import Link from "next/link";
import { ContestHeader } from "@/components/contest/ContestHeader";
import { SITE_URL } from "@/lib/site";
import { StatsStrip } from "@/components/contest/StatsStrip";
import { VoteAlert } from "@/components/contest/VoteAlert";
import { ArtworkCard } from "@/components/contest/ArtworkCard";
import { JsonLd } from "@/components/layout/JsonLd";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contest } = await supabase
    .from("contests")
    .select("contest_number")
    .eq("id", id)
    .single();

  const num = contest?.contest_number;
  return {
    title: num ? `Vote on AI Art — Contest #${num} | AI Art Arena` : "Contest — AI Art Arena",
    description: num
      ? `Vote for the best AI-generated artwork in Contest #${num}. One vote per contest, no account needed.`
      : "Vote for your favourite AI-generated artwork.",
    alternates: { canonical: `${SITE_URL}/contest/${id}` },
    openGraph: {
      title: num ? `Vote on AI Art — Contest #${num} | AI Art Arena` : "Contest — AI Art Arena",
      description: `Contest #${num} is live. Pick your favourite AI artwork.`,
      url: `${SITE_URL}/contest/${id}`,
      siteName: "AI Art Arena",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: `AI Art Arena — Contest #${num} voting` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: num ? `Vote on AI Art — Contest #${num} | AI Art Arena` : "Contest — AI Art Arena",
      description: num
        ? `Contest #${num} is live. Pick your favourite AI-generated artwork — one vote per contest.`
        : "Vote for your favourite AI-generated artwork. One vote per contest.",
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

export default async function ContestPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const session = await auth();

  const [{ data: contest, error: contestError }, { data: artworks }, { data: upcomingContests }] = await Promise.all([
    supabase.from("contests").select("*").eq("id", id).single(),
    supabase
      .from("artworks")
      .select("*")
      .eq("contest_id", id)
      .order("display_order"),
    supabase
      .from("contests")
      .select("id, contest_number, contest_type, theme, theme_description, submissions_open_at, start_date, end_date, status")
      .eq("status", "upcoming")
      .order("contest_number", { ascending: true }),
  ]);

  if (contestError || !contest) notFound();

  if (contest.status === "archived") {
    const { data: active } = await supabase
      .from("contests")
      .select("id")
      .eq("status", "active")
      .order("contest_number", { ascending: false })
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
    name: `AI Art Arena — Contest #${contest.contest_number}`,
    description: `Vote for the best AI-generated artwork in Contest #${contest.contest_number}. One vote per contest.`,
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
      <JsonLd data={jsonLd} />
      <div className="shell">
        <ContestHeader
          contestId={contest.id}
          contestNumber={contest.contest_number}
          endDate={contest.end_date}
          status={contest.status}
          contestType={contest.contest_type ?? "ai_art"}
          theme={contest.theme}
          themeDescription={contest.theme_description}
        />

        <StatsStrip totalVotes={totalVotes} artworkCount={artworks?.length ?? 0} startDate={contest.start_date} />

        {/* Vote success alert */}
        {hasVoted && votedArtwork && (
          <VoteAlert artworkTitle={votedArtwork.title} />
        )}

        {/* Already voted — anonymous, no artwork match */}
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

        {/* Contest ended banner */}
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
        {/* Up Next — upcoming contests */}
        {upcomingContests && upcomingContests.length > 0 && (
          <div style={{ marginTop: "64px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.1)" }} />
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                Up Next
              </span>
              <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.1)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {upcomingContests.map((uc) => {
                const isPhoto = uc.contest_type === "photo";
                const submitHref = isPhoto
                  ? session?.user
                    ? `/contests/photo/${uc.id}/submit`
                    : `/api/auth/signin?callbackUrl=${encodeURIComponent(`/contests/photo/${uc.id}/submit`)}`
                  : null;
                const votingOpens = new Date(uc.start_date);
                const now = new Date();
                const daysUntil = Math.ceil((votingOpens.getTime() - now.getTime()) / 86400000);
                const opensLabel = daysUntil <= 0 ? "Starting soon" : daysUntil === 1 ? "Voting opens tomorrow" : `Voting opens in ${daysUntil} days`;

                return (
                  <div
                    key={uc.id}
                    style={{
                      background: "var(--color-bg-surface)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: "14px",
                      padding: "24px 28px",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)" }}>
                          {isPhoto ? "Photo Contest" : "AI Art Contest"} &middot; #{uc.contest_number}
                        </span>
                        <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--color-status-success)", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "100px", padding: "2px 8px" }}>
                          Submissions open
                        </span>
                      </div>
                      <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.25rem", color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                        {uc.theme ?? `Contest #${uc.contest_number}`}
                      </h2>
                      {uc.theme_description && (
                        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", lineHeight: 1.55, margin: "0 0 8px", maxWidth: "480px" }}>
                          {uc.theme_description}
                        </p>
                      )}
                      <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-dim)", margin: 0 }}>
                        {opensLabel}
                      </p>
                    </div>

                    {isPhoto && submitHref && (
                      <Link
                        href={submitHref}
                        style={{
                          padding: "10px 22px",
                          background: "var(--color-purple-dim)",
                          border: "1px solid rgba(139,92,246,0.35)",
                          borderRadius: "100px",
                          color: "var(--color-purple-light)",
                          fontFamily: "var(--font-dm-mono)",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        Submit your photo →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Join CTA strip */}
        <div style={{ marginTop: "64px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-join-border)",
              borderRadius: "12px",
              padding: "28px 32px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "6px" }}>
                AI Art Contest
              </div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.125rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
                Compete as an AI artist
              </h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "14px", margin: 0 }}>
                Apply to enter your AI-generated artwork in the next contest.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a href="/join?track=subscriber" style={{ padding: "9px 18px", background: "transparent", border: "1px solid rgba(232,213,183,0.4)", borderRadius: "6px", color: "var(--color-join-amber)", fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap" }}>
                Subscribe
              </a>
              <a href="/join?track=artist" style={{ padding: "9px 18px", background: "var(--color-join-amber)", borderRadius: "6px", color: "var(--color-join-ink)", fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap" }}>
                Apply as Artist
              </a>
            </div>
          </div>

          <div
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "12px",
              padding: "28px 32px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "6px" }}>
                Photo Contest
              </div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.125rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
                Enter with your photography
              </h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "14px", margin: 0 }}>
                Sign in and upload your photo directly — no application required.
              </p>
            </div>
            <a href="/contests" style={{ padding: "9px 18px", background: "var(--color-purple-dim)", border: "1px solid rgba(139,92,246,0.35)", borderRadius: "6px", color: "var(--color-purple-light)", fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap" }}>
              View photo contests →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
