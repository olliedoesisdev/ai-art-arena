"use client";

import * as React from "react";
import { ContestGrid, ContestTimer, WinnerBanner } from "@/components/contest";
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

  const findWinnerArtwork = React.useMemo(() => {
    if (!contest.winner_id) return null;
    return artworks.find((a) => a.id === contest.winner_id) ?? null;
  }, [contest.winner_id, artworks]);

  const onVote = async (artworkId: string) => {
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

        {/* Instructions */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">How to Vote</h2>
          <ul className="text-slate-300 space-y-2">
            <li>• Vote for your favorite AI-generated artwork</li>
            <li>• You can vote once per day for each artwork</li>
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
    </div>
  );
};

export default ActiveContestClient;
