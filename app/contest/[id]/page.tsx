import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { Metadata } from "next";
import { ContestHeader } from "@/components/contest/ContestHeader";
import { StatsStrip } from "@/components/contest/StatsStrip";
import { VoteAlert } from "@/components/contest/VoteAlert";
import { ArtworkCard } from "@/components/contest/ArtworkCard";

export const revalidate = 60;

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const supabase = await createClient();
  const { data: contest } = await supabase
    .from("contests")
    .select("week_number")
    .eq("id", id)
    .single();

  return {
    title: contest ? `Week ${contest.week_number} — AI Art Arena` : "Contest — AI Art Arena",
    description: "Vote for your favorite AI-generated artwork in this week's contest.",
  };
}

export default async function ContestPage({ params }: Props) {
  const { id } = params;
  const supabase = await createClient();
  const session = await auth();

  const [{ data: contest, error: contestError }, { data: artworks }] = await Promise.all([
    supabase.from("contests").select("*").eq("id", id).single(),
    supabase
      .from("artworks")
      .select("*")
      .eq("contest_id", id)
      .order("vote_count", { ascending: false }),
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
  const contestEnded = new Date(contest.end_date).getTime() <= Date.now();

  const votedArtwork = userVoteArtworkId
    ? artworks?.find((a) => a.id === userVoteArtworkId)
    : null;

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
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

        {/* Already voted — no artwork match (anonymous) */}
        {hasVoted && !votedArtwork && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 20px",
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: "8px",
              marginBottom: "32px",
              fontSize: "0.875rem",
              color: "#34d399",
              fontWeight: 500,
            }}
          >
            ✓ You&apos;ve already voted in this contest
          </div>
        )}

        {/* Contest ended banner */}
        {contestEnded && (
          <div
            style={{
              padding: "14px 20px",
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "8px",
              marginBottom: "32px",
              fontSize: "0.875rem",
              color: "#a78bfa",
              fontWeight: 500,
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
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
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
      </div>
    </div>
  );
}
