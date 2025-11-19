/**
 * ArtworkCard Component
 * Displays artwork with voting functionality, hover overlay, and navigation
 */

"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trophy, Eye, Sparkles } from "lucide-react";
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
 * Truncate text to specified length with ellipsis
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

/**
 * Artwork card with image, details, hover overlay, and voting
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
  const router = useRouter();
  const [isHovered, setIsHovered] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isImageLoading, setIsImageLoading] = React.useState(true);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on vote button or view full size button
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }

    // Mobile: first tap shows details, second tap navigates
    if (window.innerWidth < 768) {
      if (!showDetails) {
        setShowDetails(true);
        return;
      }
    }

    // Navigate to individual artwork page
    router.push(`/contest/artwork/${artwork.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(`/contest/artwork/${artwork.id}`);
    }
  };

  const handleViewFullSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  // Close mobile details overlay when not hovering
  React.useEffect(() => {
    if (!isHovered && window.innerWidth >= 768) {
      setShowDetails(false);
    }
  }, [isHovered]);

  const displayOverlay = isHovered || showDetails;

  return (
    <>
      <Card
        hover
        className={cn(
          "overflow-hidden transition-all duration-300 cursor-pointer bg-white shadow-xl hover:shadow-2xl border border-slate-300 hover:border-slate-400",
          className
        )}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View ${artwork.title} by ${artwork.artist_name}`}
      >
        {/* Image Container */}
        <div
          className="relative aspect-[4/3] overflow-hidden bg-slate-100"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Winner Badge */}
          {showWinner && (
            <div className="absolute left-3 top-3 z-20">
              <Badge variant="warning" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Winner
              </Badge>
            </div>
          )}

          {/* Clickable Indicator */}
          <div className="absolute right-3 top-3 z-20">
            <div className={cn(
              "rounded-full bg-white/90 p-2 shadow-lg transition-all duration-300",
              displayOverlay ? "scale-110 bg-blue-600" : "scale-100"
            )}>
              <Sparkles className={cn(
                "h-4 w-4 transition-colors duration-300",
                displayOverlay ? "text-white" : "text-blue-600"
              )} />
            </div>
          </div>

          {/* Image Loading State */}
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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
              displayOverlay && "scale-105 brightness-90",
              isImageLoading && "opacity-0"
            )}
            onLoad={handleImageLoad}
            quality={85}
            priority={false}
          />

          {/* Hover Overlay - Details */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-900/60 p-4 opacity-0 transition-opacity duration-300",
              displayOverlay && "opacity-100"
            )}
          >
            {/* Top Section - Spacer */}
            <div />

            {/* Bottom Section - Details */}
            <div className="space-y-3">
              {/* Title */}
              <h3 className="text-lg font-bold text-white line-clamp-2">
                {artwork.title}
              </h3>

              {/* Artist */}
              <p className="text-sm text-blue-400 font-medium">
                by {artwork.artist_name}
              </p>

              {/* Prompt */}
              {artwork.prompt && (
                <p className="text-sm text-white/90 line-clamp-3">
                  {truncateText(artwork.prompt, 150)}
                </p>
              )}

              {/* Vote Count */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/70 font-medium">
                  {artwork.vote_count} {artwork.vote_count === 1 ? 'vote' : 'votes'}
                </p>

                {/* View Full Size Button */}
                <button
                  onClick={handleViewFullSize}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all hover:bg-white/20 hover:scale-105"
                  aria-label="View full size image"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Full Size
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="space-y-2 p-5 bg-white">
          {/* Title */}
          <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
            {artwork.title}
          </h3>

          {/* Artist */}
          <p className="text-sm text-slate-600">
            by <span className="font-semibold text-blue-600">{artwork.artist_name}</span>
          </p>

          {/* Description */}
          {artwork.description && (
            <p className="line-clamp-2 text-sm text-slate-500">
              {artwork.description}
            </p>
          )}
        </CardContent>

        {/* Card Footer - Vote Button */}
        <CardFooter className="border-t border-slate-200 p-4 bg-white">
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
          {artwork.prompt && (
            <div className="mt-3 rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Prompt</p>
              <p className="text-sm text-foreground">{artwork.prompt}</p>
            </div>
          )}
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
