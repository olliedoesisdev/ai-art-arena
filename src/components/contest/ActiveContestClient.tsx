"use client";

import * as React from "react";
import { ContestGrid, ContestTimer, WinnerBanner } from "@/components/contest";
import VoterAuthModal from "@/components/auth/VoterAuthModal";
import { createBrowserClient } from "@supabase/ssr";
import type { Artwork } from "@/types";

export interface ActiveContestClientProps {
  contest: {
    id: string;
    week_number?: number;
    year?: number;
    start_date?: string;
    end_date: string;
    status?: string; // Optional since get_active_contest may not return it
    winner_id?: string | null;
  };
  initialArtworks: Artwork[];
}

export const ActiveContestClient: React.FC<ActiveContestClientProps> = ({
  contest,
  initialArtworks,
}) => {
  const [artworks, setArtworks] = React.useState<Artwork[]>(initialArtworks);
  const [votedArtworkId, setVotedArtworkId] = React.useState<string | null>(
    null
  );
  const [isVotingMap, setIsVotingMap] = React.useState<Record<string, boolean>>(
    {}
  );
  const [message, setMessage] = React.useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const findWinnerArtwork = React.useMemo(() => {
    if (!contest.winner_id) return null;
    return artworks.find((a) => a.id === contest.winner_id) ?? null;
  }, [contest.winner_id, artworks]);

  // Fetch user's votes from database
  const fetchUserVotes = React.useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_votes_today', {
          p_user_id: userId,
          p_contest_id: contest.id,
        });

      if (error) {
        console.error('Error fetching user votes:', error);
        return;
      }

      if (data && Array.isArray(data)) {
        // Set the first voted artwork for display
        if (data.length > 0) {
          setVotedArtworkId(data[0].artwork_id);
        }
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  }, [supabase, contest.id]);

  // Check authentication status on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserEmail(user?.email || null);

      // Fetch user's votes if authenticated
      if (user) {
        await fetchUserVotes(user.id);
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserEmail(session?.user?.email || null);

      // Fetch votes when user signs in
      if (session?.user) {
        await fetchUserVotes(session.user.id);
      } else {
        // Clear votes when user signs out
        setVotedArtworkId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchUserVotes]);

  const onVote = async (artworkId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isVotingMap[artworkId]) return;

    setIsVotingMap((m) => ({ ...m, [artworkId]: true }));
    setMessage(null);

    try {
      const res = await fetch(`/api/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId, contestId: contest.id }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        let errorMsg = data?.error || data?.message || "Failed to record vote";

        // Provide user-friendly error messages
        if (errorMsg.includes("already voted")) {
          errorMsg = "You've already voted for this artwork today! Come back tomorrow to vote again.";
        } else if (errorMsg.includes("logged in") || errorMsg.includes("authenticated")) {
          errorMsg = "Please sign in to vote";
        } else if (errorMsg.includes("not active")) {
          errorMsg = "This contest is no longer accepting votes";
        }

        setMessage(errorMsg);
        return;
      }

      // Update local artwork vote count
      const updatedVoteCount =
        typeof data.voteCount === "number" ? data.voteCount : null;

      setArtworks((prev) =>
        prev.map((a) =>
          a.id === artworkId && updatedVoteCount !== null
            ? { ...a, vote_count: updatedVoteCount }
            : a
        )
      );

      setVotedArtworkId(artworkId);
      setMessage("Vote recorded — thank you! You can vote again tomorrow.");
    } catch (error) {
      console.error("Vote error:", error);
      setMessage("Failed to record vote. Try again.");
    } finally {
      setIsVotingMap((m) => ({ ...m, [artworkId]: false }));
      // clear message after a short delay
      window.setTimeout(() => setMessage(null), 3500);
    }
  };

  // Votes are now fetched from database on auth, no longer using localStorage
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Compact Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-3 tracking-tight">
            {contest.week_number
              ? `Week ${contest.week_number} Contest`
              : "AI Art Contest"}
          </h1>

          {/* Compact Info Row */}
          <div className="flex items-center justify-center gap-6 flex-wrap mb-4">
            <ContestTimer endDate={contest.end_date} compact />
            {!isAuthenticated && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition-all hover:scale-105 shadow-lg text-sm"
              >
                Register to Vote
              </button>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-gray-300 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                  {userEmail?.[0].toUpperCase()}
                </div>
                <span className="text-black text-sm font-medium">{userEmail}</span>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                    setUserEmail(null);
                  }}
                  className="ml-2 text-gray-600 hover:text-black text-xs underline"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <p className="text-gray-700 text-sm max-w-2xl mx-auto">
            Vote for your favorite AI-generated artwork • {isAuthenticated ? 'Click any artwork to vote' : 'Sign in to vote'} • Contest ends {new Date(contest.end_date).toLocaleDateString()}
          </p>
        </div>

        {/* Winner Banner */}
        {findWinnerArtwork && (
          <WinnerBanner
            artwork={findWinnerArtwork}
            weekNumber={contest.week_number || 0}
          />
        )}

        {/* Feedback message */}
        {message && (
          <div className="mb-6 rounded-lg bg-white border border-gray-300 p-3 text-sm font-medium text-black text-center shadow-lg">
            {message}
          </div>
        )}

        {/* Artworks Grid */}
        <ContestGrid
          artworks={artworks}
          onVote={onVote}
          votedArtworkId={votedArtworkId}
          canVote={isAuthenticated}
        />

        {/* Archive Link */}
        <div className="text-center mt-16">
          <a
            href="/archive"
            className="inline-block px-8 py-3 bg-white hover:bg-gray-100 text-black rounded-lg transition-all border border-gray-300 hover:scale-105 shadow-sm"
          >
            View Past Contests
          </a>
        </div>
      </div>

      {/* Auth Modal */}
      <VoterAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // Refresh auth state
          supabase.auth.getUser().then(({ data: { user } }) => {
            setIsAuthenticated(!!user);
            setUserEmail(user?.email || null);
          });
        }}
      />
    </div>
  );
};

export default ActiveContestClient;
