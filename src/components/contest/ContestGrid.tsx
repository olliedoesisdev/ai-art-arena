/**
 * ContestGrid Component
 * Responsive grid layout for contest artworks
 */

"use client";

import * as React from "react";
import { ArtworkCard } from "./ArtworkCard";
import { ContestGridSkeleton } from "@/components/ui";
import type { Artwork } from "@/types";

export interface ContestGridProps {
  /** Array of artworks to display */
  artworks: Artwork[];
  /** Vote handler callback */
  onVote: (artworkId: string) => Promise<void> | void;
  /** Whether user can vote */
  canVote?: boolean;
  /** Cooldown end time */
  cooldownEndsAt?: Date | null;
  /** ID of artwork user voted for (deprecated: use votedArtworkIds) */
  votedArtworkId?: string | null;
  /** Set of artwork IDs user voted for */
  votedArtworkIds?: Set<string>;
  /** Loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Grid layout for contest artworks with responsive columns
 * 1 column mobile, 2 columns tablet, 3 columns desktop
 *
 * @example
 * ```tsx
 * <ContestGrid
 *   artworks={artworks}
 *   onVote={handleVote}
 *   votedArtworkId={votedId}
 *   isLoading={false}
 * />
 * ```
 */
export const ContestGrid: React.FC<ContestGridProps> = ({
  artworks,
  onVote,
  canVote = true,
  cooldownEndsAt = null,
  votedArtworkId = null,
  votedArtworkIds = new Set(),
  isLoading = false,
  className,
}) => {
  // Show skeleton while loading
  if (isLoading) {
    return <ContestGridSkeleton count={6} />;
  }

  // Empty state
  if (!artworks || artworks.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No artworks available
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon for the next contest!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${className || ""}`}
    >
      {artworks.map((artwork) => {
        // Check if user voted for this artwork (prefer votedArtworkIds, fallback to votedArtworkId)
        const hasVoted = votedArtworkIds.has(artwork.id) || votedArtworkId === artwork.id;

        return (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onVote={onVote}
            canVote={canVote}
            cooldownEndsAt={cooldownEndsAt}
            hasVoted={hasVoted}
            showWinner={false}
          />
        );
      })}
    </div>
  );
};

ContestGrid.displayName = "ContestGrid";
