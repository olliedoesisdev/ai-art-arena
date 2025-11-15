/**
 * ArchiveDetails Component
 * Leaderboard display for archived contest results
 */

"use client";

import * as React from "react";
import Image from "next/image";
import { Trophy, Medal, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Artwork } from "@/types";

export interface ArchiveDetailsProps {
  /** Array of artworks sorted by vote_count descending */
  artworks: Artwork[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Leaderboard showing contest results with rankings
 *
 * @example
 * ```tsx
 * <ArchiveDetails
 *   artworks={sortedArtworks}
 * />
 * ```
 */
export const ArchiveDetails: React.FC<ArchiveDetailsProps> = ({
  artworks,
  className,
}) => {
  // Get medal icon for top 3
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-warning" />;
      case 2:
        return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 3:
        return <Award className="h-6 w-6 text-accent" />;
      default:
        return null;
    }
  };

  // Get rank display
  const getRankDisplay = (rank: number) => {
    if (rank <= 3) {
      return getMedalIcon(rank);
    }
    return (
      <span className="text-2xl font-bold text-muted-foreground">
        #{rank}
      </span>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {artworks.map((artwork, index) => {
        const rank = index + 1;
        const isWinner = rank === 1;

        return (
          <Card
            key={artwork.id}
            className={cn(
              "overflow-hidden transition-all duration-300",
              isWinner &&
                "border-warning bg-warning/5 shadow-lg shadow-warning/20"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Rank Number / Medal */}
                <div className="flex w-12 flex-shrink-0 items-center justify-center">
                  {getRankDisplay(rank)}
                </div>

                {/* Artwork Thumbnail */}
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={artwork.image_url}
                    alt={artwork.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                    quality={75}
                  />
                </div>

                {/* Artwork Info */}
                <div className="flex-1 space-y-1">
                  <h3
                    className={cn(
                      "line-clamp-1 text-lg font-semibold",
                      isWinner ? "text-warning" : "text-foreground"
                    )}
                  >
                    {artwork.title}
                  </h3>

                  {artwork.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {artwork.description}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    by{" "}
                    <span className="font-medium text-foreground">
                      {artwork.artist_name}
                    </span>
                  </p>
                </div>

                {/* Vote Count */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={cn(
                      "text-3xl font-bold tabular-nums",
                      isWinner ? "text-warning" : "text-foreground"
                    )}
                  >
                    {artwork.vote_count}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {artwork.vote_count === 1 ? "vote" : "votes"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

ArchiveDetails.displayName = "ArchiveDetails";
