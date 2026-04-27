import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { VoteButton } from "@/components/contest/VoteButton";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contest } = await supabase
    .from("contests")
    .select("week_number")
    .eq("id", id)
    .single();

  return {
    title: contest
      ? `Week ${contest.week_number} - AI Art Arena`
      : "Contest - AI Art Arena",
    description:
      "Vote for your favorite AI-generated artwork in this week's battle!",
  };
}

export default async function ContestPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const session = await auth();

  // Get the contest
  const { data: contest, error: contestError } = await supabase
    .from("contests")
    .select("*")
    .eq("id", id)
    .single();

  // If contest doesn't exist, show 404
  if (contestError || !contest) {
    notFound();
  }

  // AUTO-REDIRECT: If this contest is archived, redirect to the active one
  if (contest.status === "archived") {
    const { data: activeContest } = await supabase
      .from("contests")
      .select("id")
      .eq("status", "active")
      .order("week_number", { ascending: false })
      .limit(1)
      .single();

    if (activeContest) {
      redirect(`/contest/${activeContest.id}`);
    } else {
      // No active contest exists - redirect to homepage
      redirect("/");
    }
  }

  // Get all artworks for this contest, ordered by vote count
  const { data: artworks } = await supabase
    .from("artworks")
    .select("*")
    .eq("contest_id", id)
    .order("vote_count", { ascending: false });

  // Check if user has already voted
  let hasVoted = false;
  let userVote = null;

  if (session?.user) {
    const { data: vote } = await supabase
      .from("votes")
      .select("artwork_id")
      .eq("contest_id", id)
      .eq("user_id", session.user.id)
      .single();

    hasVoted = !!vote;
    userVote = vote?.artwork_id;
  }

  // Calculate time remaining
  const endDate = new Date(contest.end_date);
  const now = new Date();
  const timeRemaining = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(
    0,
    Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))
  );
  const hoursRemaining = Math.max(
    0,
    Math.ceil(timeRemaining / (1000 * 60 * 60))
  );
  const contestEnded = timeRemaining <= 0;

  // Get total votes for this contest
  const { count: totalVotes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("contest_id", id);

  // Find the winning artwork(s)
  const maxVotes =
    artworks && artworks.length > 0
      ? Math.max(...artworks.map((a) => a.vote_count))
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="text-3xl">🎨</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Art Arena
                </h1>
                <p className="text-sm text-gray-600">
                  Week {contest.week_number} Battle
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {session?.user ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {session.user.name || session.user.email}
                  </span>
                  {session.user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href="/signin"
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contest Info Banner */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Total Votes */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {totalVotes || 0}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Votes Cast
              </div>
            </div>

            {/* Artworks Count */}
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {artworks?.length || 0}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Artworks Competing
              </div>
            </div>

            {/* Time Remaining */}
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {contestEnded
                  ? "Ended"
                  : daysRemaining > 0
                  ? `${daysRemaining}d`
                  : `${hoursRemaining}h`}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {contestEnded ? "Contest Closed" : "Time Remaining"}
              </div>
            </div>
          </div>

          {/* Vote Status */}
          {hasVoted && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                You've already voted in this contest!
              </div>
            </div>
          )}

          {/* Contest Ended Message */}
          {contestEnded && !hasVoted && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-semibold">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                This contest has ended
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!hasVoted && !contestEnded && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">🗳️</span>
              How to Vote
            </h2>
            <p className="text-blue-800">
              Click on your favorite artwork below to cast your vote! You can
              only vote once per contest. The artwork with the most votes wins.
            </p>
          </div>
        )}

        {/* Results Header (if voted or ended) */}
        {(hasVoted || contestEnded) && artworks && artworks.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-3xl">🏆</span>
              {contestEnded ? "Final Results" : "Current Standings"}
            </h2>
            <p className="text-gray-700">
              {contestEnded
                ? `Week ${contest.week_number} has concluded! Here are the final results.`
                : "Vote counts are updated in real-time. The winner will be announced when the contest ends."}
            </p>
          </div>
        )}

        {/* Artworks Grid */}
        {artworks && artworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {artworks.map((artwork, index) => {
              const isWinning = artwork.vote_count === maxVotes && maxVotes > 0;
              const isUserVote = userVote === artwork.id;
              const votePercentage =
                totalVotes && totalVotes > 0
                  ? ((artwork.vote_count / totalVotes) * 100).toFixed(1)
                  : "0";

              return (
                <article
                  key={artwork.id}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isUserVote ? "ring-4 ring-green-500" : ""
                  } ${
                    isWinning && (hasVoted || contestEnded)
                      ? "ring-4 ring-yellow-400"
                      : ""
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={artwork.image_url}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3}
                    />

                    {/* Badges */}
                    {isWinning && (hasVoted || contestEnded) && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                        <span className="text-lg">🏆</span>
                        {contestEnded ? "Winner" : "Leading"}
                      </div>
                    )}
                    {isUserVote && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                        <span>✓</span>
                        Your Vote
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {artwork.title}
                    </h3>

                    {artwork.artist_prompt && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        "{artwork.artist_prompt}"
                      </p>
                    )}

                    {/* Vote Count & Percentage */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="text-2xl font-bold text-gray-900">
                          {artwork.vote_count}
                        </span>
                      </div>

                      {(hasVoted || contestEnded) &&
                        totalVotes &&
                        totalVotes > 0 && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-700">
                              {votePercentage}%
                            </div>
                            <div className="text-xs text-gray-500">
                              of votes
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Vote Progress Bar (if voted or ended) */}
                    {(hasVoted || contestEnded) &&
                      totalVotes &&
                      totalVotes > 0 && (
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isWinning
                                  ? "bg-yellow-400"
                                  : isUserVote
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${votePercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                    {/* Vote Button */}
                    {!hasVoted && !contestEnded && (
                      <VoteButton
                        artworkId={artwork.id}
                        contestId={contest.id}
                        isAuthenticated={!!session?.user}
                      />
                    )}

                    {/* Rank Badge (if voted or ended) */}
                    {(hasVoted || contestEnded) && (
                      <div className="mt-4 text-center">
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {index === 0 && "🥇 1st Place"}
                          {index === 1 && "🥈 2nd Place"}
                          {index === 2 && "🥉 3rd Place"}
                          {index > 2 && `#${index + 1}`}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* No Artworks Message */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Artworks Yet
            </h3>
            <p className="text-gray-600">
              The admin hasn't uploaded any artworks for this contest yet. Check
              back soon!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              {contestEnded ? (
                <>Contest ended on {endDate.toLocaleDateString()}</>
              ) : (
                <>
                  Contest ends on {endDate.toLocaleDateString()} at{" "}
                  {endDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              )}
            </p>
            <p className="text-sm text-gray-500">
              AI Art Arena • Week {contest.week_number}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
