/**
 * ArtworkCard Component
 * Displays artwork with voting functionality and winner badge
 */

"use client";

import * as React from "react";
import Image from "next/image";
import { Trophy, Eye } from "lucide-react";
import { Card, CardContent, CardFooter, Badge, Modal } from "@/components/ui";
import { VoteButton } from "./VoteButton";
import { cn } from "@/lib/utils";
import type { Artwork } from "@/types";

export interface ArtworkCardProps {
  /** Artwork to display */
  artwork: Artwork;
  /** Vote handler */
  onVote: (artworkId: string) => Promise<void> | void;
  /** Whether user can vote */
  canVote?: boolean;
  /** Cooldown end time */
  cooldownEndsAt?: Date | null;
  /** Whether user voted for this artwork */
  hasVoted?: boolean;
  /** Show winner badge */
  showWinner?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Artwork card with image, details, and voting
 *
 * @example
 * ```tsx
 * <ArtworkCard
 *   artwork={artwork}
 *   onVote={handleVote}
 *   hasVoted={votedArtworkId === artwork.id}
 *   showWinner={artwork.isWinner}
 * />
 * ```
 */
export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  onVote,
  canVote = true,
  cooldownEndsAt = null,
  hasVoted = false,
  showWinner = false,
  className,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isImageLoading, setIsImageLoading] = React.useState(true);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <>
      <Card
        hover
        className={cn("overflow-hidden transition-all duration-300", className)}
      >
        {/* Image Container */}
        <div
          className="relative aspect-square overflow-hidden bg-muted"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Winner Badge */}
          {showWinner && (
            <div className="absolute left-3 top-3 z-10">
              <Badge variant="warning" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Winner
              </Badge>
            </div>
          )}

          {/* Image Loading State */}
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}

          {/* Artwork Image */}
          <Image
            src={artwork.image_url}
            alt={artwork.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-all duration-500",
              isHovered && "scale-105",
              isImageLoading && "opacity-0"
            )}
            onLoad={handleImageLoad}
            quality={85}
            priority={false}
          />

          {/* Hover Overlay - View Full Size */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300",
              isHovered && "opacity-100"
            )}
          >
            <button
              onClick={handleImageClick}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-foreground shadow-lg transition-transform hover:scale-105"
            >
              <Eye className="h-4 w-4" />
              View Full Size
            </button>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="space-y-2 p-4">
          {/* Title */}
          <h3 className="line-clamp-1 text-lg font-semibold text-foreground">
            {artwork.title}
          </h3>

          {/* Description */}
          {artwork.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {artwork.description}
            </p>
          )}

          {/* Artist */}
          <p className="text-xs text-muted-foreground">
            by <span className="font-medium text-foreground">{artwork.artist_name}</span>
          </p>
        </CardContent>

        {/* Card Footer - Vote Button */}
        <CardFooter className="border-t border-border p-4">
          <VoteButton
            artworkId={artwork.id}
            currentVotes={artwork.vote_count}
            onVote={onVote}
            disabled={!canVote}
            cooldownEndsAt={cooldownEndsAt}
            hasVoted={hasVoted}
            className="w-full"
          />
        </CardFooter>
      </Card>

      {/* Full Size Image Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
        title={artwork.title}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={artwork.image_url}
            alt={artwork.title}
            fill
            sizes="90vw"
            className="object-contain"
            quality={95}
            priority
          />
        </div>

        {/* Modal Details */}
        <div className="mt-4 space-y-2">
          {artwork.description && (
            <p className="text-sm text-muted-foreground">{artwork.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            by <span className="font-medium text-foreground">{artwork.artist_name}</span>
          </p>
          {showWinner && (
            <Badge variant="warning" className="inline-flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Contest Winner
            </Badge>
          )}
        </div>
      </Modal>
    </>
  );
};

ArtworkCard.displayName = "ArtworkCard";
