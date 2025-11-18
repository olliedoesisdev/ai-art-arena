"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { VoteButton } from "@/components/contest/VoteButton";
import type { Artwork } from "@/types";

interface ArtworkVoteClientProps {
  artwork: Artwork;
  contestId: string;
  isActive: boolean;
}

export function ArtworkVoteClient({
  artwork,
  contestId,
  isActive,
}: ArtworkVoteClientProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [currentVotes, setCurrentVotes] = useState(artwork.vote_count);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  // Check authentication and vote status
  useEffect(() => {
    async function checkStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Check if user has voted (from localStorage)
        if (typeof window !== "undefined") {
          const stored = window.localStorage.getItem(`votedArtwork:${contestId}`);
          if (stored === artwork.id) {
            setHasVoted(true);
          }
        }
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase, contestId, artwork.id]);

  // Handle vote using API route (same as ActiveContestClient)
  const handleVote = async (artworkId: string) => {
    if (!isAuthenticated) {
      // Redirect to contest page where they can authenticate
      window.location.href = "/contest";
      return;
    }

    try {
      const res = await fetch(`/api/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId, contestId }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const err = data?.error || data?.message || "Failed to record vote";
        alert(String(err));
        return;
      }

      // Update local vote count
      const updatedVoteCount = typeof data.voteCount === "number" ? data.voteCount : null;
      if (updatedVoteCount !== null) {
        setCurrentVotes(updatedVoteCount);
      }

      setHasVoted(true);

      // Persist vote locally
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`votedArtwork:${contestId}`, artworkId);
      }
    } catch (error) {
      console.error("Vote error:", error);
      alert("Failed to record vote. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-12 bg-slate-800 animate-pulse rounded-lg" />
    );
  }

  return (
    <VoteButton
      artworkId={artwork.id}
      currentVotes={currentVotes}
      onVote={handleVote}
      disabled={!isActive || !isAuthenticated}
      cooldownEndsAt={null}
      hasVoted={hasVoted}
      className="w-full"
    />
  );
}
