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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {contest.week_number
              ? `Week ${contest.week_number} Contest`
              : "Active Contest"}
          </h1>
          <p className="text-xl text-slate-400 mb-6">
            Ends {new Date(contest.end_date).toLocaleString()}
          </p>
          <ContestTimer endDate={contest.end_date} />
        </div>

        {/* Winner Banner */}
        {contest.status === "ended" && findWinnerArtwork && (
          <WinnerBanner
            artwork={findWinnerArtwork}
            weekNumber={contest.week_number}
          />
        )}

        {/* Feedback message */}
        {message && (
          <div className="mb-6 rounded-md bg-amber-900/80 p-3 text-sm font-medium text-white">
            {message}
          </div>
        )}

        {/* User Status Bar */}
        {isAuthenticated ? (
          <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                {userEmail?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">Signed in as {userEmail}</p>
                <p className="text-slate-400 text-sm">Ready to vote!</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setIsAuthenticated(false);
                setUserEmail(null);
              }}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-slate-300">
              <span className="text-white font-medium">Sign in to vote</span> — Register with your email to participate
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Sign In / Sign Up
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">How to Vote</h2>
          <ul className="text-slate-300 space-y-2">
            <li>• Register with your email to participate</li>
            <li>• Vote for your favorite AI-generated artwork</li>
            <li>• You can vote once per artwork per contest</li>
            <li>
              • Contest ends {new Date(contest.end_date).toLocaleDateString()}
            </li>
            <li>• The artwork with the most votes wins!</li>
          </ul>
        </div>

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
            className="inline-block px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
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
