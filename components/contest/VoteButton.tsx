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

export function VoteButton({
  artworkId,
  contestId,
  isAuthenticated,
}: VoteButtonProps) {
  const [isVoting, setIsVoting] = useState(false);
  const router = useRouter();

  async function handleVote() {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    setIsVoting(true);

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artwork_id: artworkId,
          contest_id: contestId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Vote submitted successfully! 🎉");
        router.refresh();
      } else {
        if (response.status === 401) {
          toast.error("Please sign in to vote");
        } else if (response.status === 409) {
          toast.error("You've already voted in this contest");
        } else if (response.status === 429) {
          toast.error("You can only vote once per day");
        } else {
          toast.error(data.error || "Failed to submit vote");
        }
        setIsVoting(false);
      }
    } catch (error) {
      console.error("Vote error:", error);
      toast.error("An error occurred while voting");
      setIsVoting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={`/signin?callbackUrl=/contest/${contestId}`}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
        Sign In to Vote
      </Link>
    );
  }

  return (
    <button
      onClick={handleVote}
      disabled={isVoting}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
    >
      {isVoting ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Voting...
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          Vote for This
        </>
      )}
    </button>
  );
}
