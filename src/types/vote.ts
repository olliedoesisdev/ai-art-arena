/**
 * Vote type definitions
 */

export interface Vote {
  id: string;
  artwork_id: string;
  contest_id: string;
  user_identifier: string;
  voted_at: string;
}

/**
 * Vote status for a user in a specific contest
 */
export interface VoteStatus {
  canVote: boolean;
  hasVotedToday: boolean;
  lastVoteDate: string | null;
  cooldownEndsAt: string | null;
  timeUntilNextVote: number | null; // in milliseconds
}

/**
 * Vote request payload
 */
export interface VoteRequest {
  artworkId: string;
  contestId: string;
}

/**
 * Vote response
 */
export interface VoteResponse {
  success: boolean;
  error?: string;
  vote?: Vote;
  newVoteCount?: number;
}

/**
 * Vote cooldown information
 */
export interface VoteCooldown {
  canVote: boolean;
  cooldownEndsAt: Date | null;
  timeRemaining: number | null;
  lastVotedAt: Date | null;
}

/**
 * Vote button state
 */
export interface VoteButtonState {
  isLoading: boolean;
  isDisabled: boolean;
  cooldownText: string | null;
}

/**
 * User vote history (client-side tracking)
 */
export interface UserVoteHistory {
  contestId: string;
  artworkId: string;
  votedAt: string;
}
