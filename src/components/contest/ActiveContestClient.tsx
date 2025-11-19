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
    status: string;
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

  // Check authentication status on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserEmail(user?.email || null);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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
        const err = data?.error || data?.message || "Failed to record vote";
        setMessage(String(err));
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
      try {
        // Persist vote locally so UI reflects vote across reloads
        if (typeof window !== "undefined") {
          window.localStorage.setItem(`votedArtwork:${contest.id}`, artworkId);
        }
      } catch (_e) {
        // ignore storage errors
      }
      setMessage("Vote recorded — thank you!");
    } catch (error) {
      console.error("Vote error:", error);
      setMessage("Failed to record vote. Try again.");
    } finally {
      setIsVotingMap((m) => ({ ...m, [artworkId]: false }));
      // clear message after a short delay
      window.setTimeout(() => setMessage(null), 3500);
    }
  };

  // Initialize voted artwork from localStorage
  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(
          `votedArtwork:${contest.id}`
        );
        if (stored) setVotedArtworkId(stored);
      }
    } catch (_e) {
      // ignore
    }
  }, [contest.id]);
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Compact Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-3 tracking-tight">
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all hover:scale-105 shadow-lg text-sm"
              >
                Register to Vote
              </button>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                  {userEmail?.[0].toUpperCase()}
                </div>
                <span className="text-white text-sm font-medium">{userEmail}</span>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                    setUserEmail(null);
                  }}
                  className="ml-2 text-slate-400 hover:text-white text-xs underline"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Vote for your favorite AI-generated artwork • {isAuthenticated ? 'Click any artwork to vote' : 'Sign in to vote'} • Contest ends {new Date(contest.end_date).toLocaleDateString()}
          </p>
        </div>

        {/* Winner Banner */}
        {contest.status === "ended" && findWinnerArtwork && (
          <WinnerBanner
            artwork={findWinnerArtwork}
            weekNumber={contest.week_number || 0}
          />
        )}

        {/* Feedback message */}
        {message && (
          <div className="mb-6 rounded-lg bg-slate-800 border border-slate-700 p-3 text-sm font-medium text-white text-center shadow-lg">
            {message}
          </div>
        )}

        {/* Artworks Grid */}
        <ContestGrid
          artworks={artworks}
          onVote={onVote}
          votedArtworkId={votedArtworkId}
          canVote={contest.status === "active"}
        />

        {/* Archive Link */}
        <div className="text-center mt-16">
          <a
            href="/archive"
            className="inline-block px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-700 hover:scale-105"
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
