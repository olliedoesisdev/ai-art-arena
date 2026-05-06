"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface VoteButtonProps {
  artworkId: string;
  contestId: string;
  isAuthenticated: boolean;
}

export function VoteButton({ artworkId, contestId, isAuthenticated }: VoteButtonProps) {
  const [isVoting, setIsVoting] = useState(false);
  const router = useRouter();

  async function handleVote() {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    setIsVoting(true);

    try {
      const response = await fetch("/api/v1/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artwork_id: artworkId, contest_id: contestId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Vote submitted!");
        router.refresh();
      } else {
        const messages: Record<number, string> = {
          409: "You've already voted in this contest",
          429: "You can only vote once per day",
          401: "Please sign in to vote",
        };
        toast.error(messages[response.status] ?? data.error ?? "Failed to submit vote");
        setIsVoting(false);
      }
    } catch {
      toast.error("An error occurred while voting");
      setIsVoting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={`/signin?callbackUrl=${encodeURIComponent(`/contest/${contestId}`)}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "10px 20px",
          background: "rgba(139,92,246,0.10)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "8px",
          color: "#a78bfa",
          fontSize: "0.875rem",
          fontWeight: 600,
          textDecoration: "none",
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        Sign in to vote
      </Link>
    );
  }

  return (
    <button
      onClick={handleVote}
      disabled={isVoting}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: "100%",
        padding: "10px 20px",
        background: isVoting ? "rgba(139,92,246,0.5)" : "#8b5cf6",
        border: "none",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "0.875rem",
        fontWeight: 700,
        cursor: isVoting ? "not-allowed" : "pointer",
        transition: "background 0.2s",
      }}
    >
      {isVoting ? "Voting..." : "Vote for this"}
    </button>
  );
}
