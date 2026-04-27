"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // ← Add this import
import type { Artwork } from "@/lib/types";

interface VotingInterfaceProps {
  artworks: Artwork[];
  contestId: string;
}

export function VotingInterface({ artworks, contestId }: VotingInterfaceProps) {
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter(); // ← Add this

  async function handleVote(artworkId: string) {
    if (votedFor || isPending) return;

    // Optimistic update - show voted state immediately
    setVotedFor(artworkId);

    startTransition(async () => {
      try {
        const response = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artwork_id: artworkId,
            contest_id: contestId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to submit vote");
        }

        toast.success("Vote submitted successfully! 🎉");

        // ✅ Force page refresh to show updated vote count
        router.refresh();
      } catch (error) {
        // Rollback on error
        setVotedFor(null);

        const message =
          error instanceof Error ? error.message : "Failed to submit vote";

        toast.error(message);
      }
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {artworks.map((artwork, index) => (
        <div
          key={artwork.id}
          className={`
            group relative space-y-3 
            transition-all duration-300
            ${votedFor === artwork.id ? "scale-105" : ""}
          `}
        >
          {/* Image container with proper aspect ratio */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-lg">
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              priority={index < 2} // LCP optimization for first 2 images
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Vote overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                onClick={() => handleVote(artwork.id)}
                disabled={votedFor !== null || isPending}
                className={`
                  px-6 py-3 rounded-full font-bold text-lg
                  transition-all duration-300 transform
                  ${
                    votedFor === artwork.id
                      ? "bg-green-500 text-white scale-110"
                      : votedFor !== null
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-900 hover:scale-110 active:scale-95"
                  }
                  disabled:cursor-not-allowed
                `}
              >
                {votedFor === artwork.id ? "✓ Voted!" : "Vote"}
              </button>
            </div>

            {/* Voted checkmark badge */}
            {votedFor === artwork.id && (
              <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Artwork info */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-1 text-gray-900">
              {artwork.title}
            </h3>
            <p className="text-sm text-gray-600">
              {artwork.vote_count} {artwork.vote_count === 1 ? "vote" : "votes"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
