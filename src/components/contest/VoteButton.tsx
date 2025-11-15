/**
 * VoteButton Component
 * Interactive vote button with multiple states
 */

"use client";

import * as React from "react";
import { ThumbsUp, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface VoteButtonProps {
  /** Artwork ID to vote for */
  artworkId: string;
  /** Current vote count */
  currentVotes: number;
  /** Vote handler callback */
  onVote: (artworkId: string) => Promise<void> | void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Cooldown end date (if in cooldown) */
  cooldownEndsAt?: Date | null;
  /** Whether user has already voted for this artwork */
  hasVoted?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Show vote count */
  showVoteCount?: boolean;
  /** Button size */
  size?: "sm" | "md" | "lg";
}

/**
 * Vote button with three states: can vote, has voted, cooldown
 *
 * @example
 * ```tsx
 * <VoteButton
 *   artworkId="artwork-123"
 *   currentVotes={42}
 *   onVote={handleVote}
 *   hasVoted={false}
 * />
 * ```
 */
export const VoteButton: React.FC<VoteButtonProps> = ({
  artworkId,
  currentVotes,
  onVote,
  disabled = false,
  cooldownEndsAt = null,
  hasVoted = false,
  className,
  showVoteCount = true,
  size = "md",
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [localVotes, setLocalVotes] = React.useState(currentVotes);
  const [timeRemaining, setTimeRemaining] = React.useState<string | null>(null);
  const [isInCooldown, setIsInCooldown] = React.useState(false);

  // Sync local votes with prop changes
  React.useEffect(() => {
    setLocalVotes(currentVotes);
  }, [currentVotes]);

  // Handle cooldown countdown
  React.useEffect(() => {
    if (!cooldownEndsAt) {
      setIsInCooldown(false);
      setTimeRemaining(null);
      return;
    }

    const updateCooldown = () => {
      const now = new Date();
      const end = new Date(cooldownEndsAt);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setIsInCooldown(false);
        setTimeRemaining(null);
        return;
      }

      setIsInCooldown(true);

      // Format time remaining
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    // Initial update
    updateCooldown();

    // Update every second
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [cooldownEndsAt]);

  const handleVote = async () => {
    if (disabled || isLoading || hasVoted || isInCooldown) {
      return;
    }

    setIsLoading(true);

    try {
      // Optimistic update
      setLocalVotes((prev) => prev + 1);

      // Call the vote handler
      await onVote(artworkId);
    } catch (error) {
      // Revert optimistic update on error
      setLocalVotes(currentVotes);
      console.error("Vote failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button state
  const getButtonState = () => {
    if (hasVoted) {
      return {
        variant: "secondary" as const,
        icon: Check,
        text: "Voted",
        clickable: false,
      };
    }

    if (isInCooldown && timeRemaining) {
      return {
        variant: "outline" as const,
        icon: Clock,
        text: `Vote in ${timeRemaining}`,
        clickable: false,
      };
    }

    return {
      variant: "primary" as const,
      icon: ThumbsUp,
      text: "Vote",
      clickable: true,
    };
  };

  const state = getButtonState();
  const Icon = state.icon;
  const isDisabled = disabled || !state.clickable || isLoading;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={state.variant}
        size={size}
        onClick={handleVote}
        disabled={isDisabled}
        isLoading={isLoading}
        className={cn(
          "min-w-[100px] transition-all",
          hasVoted && "cursor-default",
          isInCooldown && "cursor-not-allowed"
        )}
      >
        {!isLoading && <Icon className="mr-2 h-4 w-4" />}
        {state.text}
      </Button>

      {showVoteCount && (
        <div className="flex flex-col items-center">
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              hasVoted && "text-primary"
            )}
          >
            {localVotes}
          </span>
          <span className="text-xs text-muted-foreground">
            {localVotes === 1 ? "vote" : "votes"}
          </span>
        </div>
      )}
    </div>
  );
};

VoteButton.displayName = "VoteButton";
