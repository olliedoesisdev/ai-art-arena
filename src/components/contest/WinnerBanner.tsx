/**
 * WinnerBanner Component
 * Displays contest winner with gradient background and trophy
 */

"use client";

import * as React from "react";
import Image from "next/image";
import { Trophy, Sparkles } from "lucide-react";
import { Card, CardContent, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Artwork } from "@/types";

export interface WinnerBannerProps {
  /** Winning artwork */
  artwork: Artwork;
  /** Week number of the contest */
  weekNumber: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Banner showcasing the contest winner with gradient background
 *
 * @example
 * ```tsx
 * <WinnerBanner
 *   artwork={winningArtwork}
 *   weekNumber={5}
 * />
 * ```
 */
export const WinnerBanner: React.FC<WinnerBannerProps> = ({
  artwork,
  weekNumber,
  className,
}) => {
  const [isImageLoading, setIsImageLoading] = React.useState(true);

  return (
    <Card
      className={cn(
        "overflow-hidden border-warning bg-gradient-to-br from-warning/20 via-accent/10 to-warning/20",
        className
      )}
    >
      <CardContent className="p-0">
        {/* Two-column layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Image */}
          <div className="relative aspect-square overflow-hidden bg-muted md:aspect-auto">
            {/* Loading State */}
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-warning border-t-transparent" />
              </div>
            )}

            {/* Winner Image */}
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={cn(
                "object-cover transition-opacity duration-500",
                isImageLoading && "opacity-0"
              )}
              onLoad={() => setIsImageLoading(false)}
              quality={90}
              priority
            />

            {/* Sparkles decoration overlay */}
            <div className="absolute left-4 top-4">
              <Sparkles className="h-8 w-8 text-warning drop-shadow-lg" />
            </div>
            <div className="absolute bottom-4 right-4">
              <Sparkles className="h-6 w-6 text-warning drop-shadow-lg" />
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="flex flex-col justify-center space-y-4 p-8">
            {/* Trophy Badge */}
            <div className="flex items-center gap-2">
              <Trophy className="h-10 w-10 text-warning" />
              <Badge
                variant="warning"
                className="text-base font-semibold px-4 py-1.5"
              >
                Winner
              </Badge>
            </div>

            {/* Week Heading */}
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Week {weekNumber} Winner!
            </h2>

            {/* Artwork Title */}
            <h3 className="text-2xl font-semibold text-foreground">
              {artwork.title}
            </h3>

            {/* Description */}
            {artwork.description && (
              <p className="text-base text-muted-foreground line-clamp-3">
                {artwork.description}
              </p>
            )}

            {/* Artist Name */}
            <p className="text-sm text-muted-foreground">
              Created by{" "}
              <span className="font-semibold text-foreground text-base">
                {artwork.artist_name}
              </span>
            </p>

            {/* Vote Count */}
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-5xl font-bold text-warning tabular-nums">
                {artwork.vote_count}
              </span>
              <span className="text-lg text-muted-foreground">
                {artwork.vote_count === 1 ? "vote" : "votes"}
              </span>
            </div>

            {/* Decorative Sparkles */}
            <div className="flex gap-1 pt-2">
              <Sparkles className="h-5 w-5 text-warning" />
              <Sparkles className="h-4 w-4 text-warning" />
              <Sparkles className="h-5 w-5 text-warning" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

WinnerBanner.displayName = "WinnerBanner";
