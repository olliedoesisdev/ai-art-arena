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
import { CommentSection } from "@/components/comments/CommentSection";
import { SignInNudge } from "@/components/contest/SignInNudge";
import { ContestNotifyBanner } from "@/components/contest/ContestNotifyBanner";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contest } = await supabase
    .from("contests")
    .select("contest_number, theme")
    .eq("id", id)
    .single();

  const title = contest?.theme
    ? `${contest.theme} — AI Art Contest | AI Art Arena`
    : contest?.contest_number
    ? `Vote on AI Art — Contest #${contest.contest_number} | AI Art Arena`
    : "Contest — AI Art Arena";

  const description = contest?.theme
    ? `Vote for the best AI-generated artwork in the "${contest.theme}" contest.`
    : `Vote for the best AI-generated artwork in Contest #${contest?.contest_number}. One vote per contest.`;

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
    supabase.from("artworks").select("*, submitter:submitted_by(id, display_name, avatar_url)").eq("contest_id", id).order("display_order"),
  ]);

  if (contestError || !contest) notFound();
  if (contest.contest_type !== "ai_art") notFound();

  if (contest.status === "archived") {
    const { data: active } = await supabase
      .from("contests")
      .select("id")
      .eq("status", "active")
      .eq("contest_type", "ai_art")
      .order("contest_number", { ascending: false })
      .limit(1)
      .single();
    redirect(active ? `/contests/ai-art/${active.id}` : "/contests");
  }

  let userVotesOnContest = 0;
  let userVotesPerArtwork: Record<string, number> = {};

  if (session?.user) {
    const { data: votes } = await supabase
      .from("votes")
      .select("artwork_id")
      .eq("contest_id", id)
      .eq("user_id", session.user.id);
    if (votes) {
      userVotesOnContest = votes.length;
      for (const v of votes) {
        userVotesPerArtwork[v.artwork_id] = (userVotesPerArtwork[v.artwork_id] ?? 0) + 1;
      }
    }
  }

  const totalVotes = artworks?.reduce((sum, a) => sum + (a.vote_count ?? 0), 0) ?? 0;
  const maxVotes = artworks && artworks.length > 0 ? Math.max(...artworks.map((a) => a.vote_count)) : 0;
  const contestEnded = new Date(contest.end_date) <= new Date();
  const mostVotedArtworkId = Object.entries(userVotesPerArtwork).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const votedArtwork = mostVotedArtworkId ? artworks?.find((a) => a.id === mostVotedArtworkId) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: contest.theme ? `AI Art Arena — ${contest.theme}` : `AI Art Arena — Contest #${contest.contest_number}`,
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
          contestNumber={contest.contest_number}
          endDate={contest.end_date}
          status={contest.status}
          contestType="ai_art"
          theme={contest.theme}
          themeDescription={contest.theme_description}
        />

        <StatsStrip totalVotes={totalVotes} artworkCount={artworks?.length ?? 0} startDate={contest.start_date} />

        {!session?.user && contest.status === "active" && (
          <SignInNudge callbackPath={`/contests/ai-art/${contest.id}`} />
        )}

        {userVotesOnContest > 0 && votedArtwork && <VoteAlert artworkTitle={votedArtwork.title} />}

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
                userVotesOnArtwork={userVotesPerArtwork[artwork.id] ?? 0}
                userVotesOnContest={userVotesOnContest}
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

        {artworks && artworks.length > 0 && (
          <div style={{ marginTop: "64px", display: "flex", flexDirection: "column", gap: "48px" }}>
            {artworks.map((artwork) => (
              <div key={artwork.id}>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "16px" }}>
                  Comments on &ldquo;{artwork.title}&rdquo;
                </p>
                <CommentSection artworkId={artwork.id} />
              </div>
            ))}
          </div>
        )}

        <ContestNotifyBanner />

        {/* CTA strip */}
        <div style={{ marginTop: "64px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {contest.status === "upcoming" ? (
            /* Submissions open — direct submit CTA */
            <div
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border-mid)",
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
                  Submissions open
                </div>
                <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.125rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
                  Enter this contest
                </h2>
                <p style={{ color: "var(--color-text-muted)", fontSize: "14px", margin: 0 }}>
                  Upload your AI-generated artwork for review. Approved entries go live when voting opens.
                </p>
              </div>
              <Link
                href={`/contests/ai-art/${contest.id}/submit`}
                style={{
                  padding: "9px 20px",
                  background: "var(--color-purple)",
                  borderRadius: "6px",
                  color: "#fff",
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Submit artwork &rarr;
              </Link>
            </div>
          ) : (
            /* Active/closed — show photo contest crosslink */
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
              <Link
                href="/contests"
                style={{
                  padding: "9px 18px",
                  background: "var(--color-purple-dim)",
                  border: "1px solid rgba(139,92,246,0.35)",
                  borderRadius: "6px",
                  color: "var(--color-purple-light)",
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                View photo contests &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
