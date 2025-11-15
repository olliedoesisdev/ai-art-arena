/**
 * ArchiveCard Component
 * Displays archived contest with winner information
 */

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, ArrowRight } from "lucide-react";
import { Card, CardContent, Badge } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Contest, Artwork } from "@/types";

export interface ArchiveCardProps {
  /** Archived contest */
  contest: Contest;
  /** Winning artwork */
  winner: Artwork;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Archive card linking to contest details
 *
 * @example
 * ```tsx
 * <ArchiveCard
 *   contest={archivedContest}
 *   winner={winningArtwork}
 * />
 * ```
 */
export const ArchiveCard: React.FC<ArchiveCardProps> = ({
  contest,
  winner,
  className,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isImageLoading, setIsImageLoading] = React.useState(true);

  return (
    <Link
      href={`${ROUTES.archive}/${contest.id}`}
      className={cn("group block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        hover
        className="overflow-hidden transition-all duration-300 group-hover:shadow-lg"
      >
        {/* Winner Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* Winner Badge Overlay */}
          <div className="absolute left-3 top-3 z-10">
            <Badge
              variant="warning"
              className="flex items-center gap-1 shadow-lg"
            >
              <Trophy className="h-3 w-3" />
              Winner
            </Badge>
          </div>

          {/* Image Loading State */}
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}

          {/* Winner Image */}
          <Image
            src={winner.image_url}
            alt={winner.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-all duration-500",
              isHovered && "scale-105",
              isImageLoading && "opacity-0"
            )}
            onLoad={() => setIsImageLoading(false)}
            quality={85}
          />

          {/* Hover Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300",
              isHovered && "opacity-100"
            )}
          />
        </div>

        {/* Card Content */}
        <CardContent className="space-y-3 p-4">
          {/* Week Number and Status */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">
              Week {contest.week_number}
            </h3>
            <Badge variant="default">Archived</Badge>
          </div>

          {/* Winner Title */}
          <p className="line-clamp-1 text-base font-semibold text-foreground">
            {winner.title}
          </p>

          {/* Contest Date */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatDate(contest.end_date)}</span>
            <span className="font-semibold text-foreground">
              {winner.vote_count} {winner.vote_count === 1 ? "vote" : "votes"}
            </span>
          </div>

          {/* View Results Link */}
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium text-primary transition-all",
              isHovered && "gap-2"
            )}
          >
            View Results
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

ArchiveCard.displayName = "ArchiveCard";
