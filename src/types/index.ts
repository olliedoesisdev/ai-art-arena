/**
 * Central export for all type definitions
 * AI Art Arena - Complete Type System
 */

// Database types (Supabase)
export * from "./database";
export type {
  Database,
  ContestRow,
  ContestInsert,
  ContestUpdate,
  ArtworkRow,
  ArtworkInsert,
  ArtworkUpdate,
  VoteRow,
  VoteInsert,
  VoteUpdate,
  ActiveContestResult,
  LeaderboardEntry,
} from "./database";

// Contest types
export * from "./contest";
export type {
  ContestStatus,
  Contest,
  ContestWithArtworks,
  ActiveContestInfo,
  ArchivedContest,
  ContestState,
  TimeRemaining,
} from "./contest";

// Artwork types
export * from "./artwork";
export type {
  Artwork,
  ArtworkWithVoteStatus,
  ArtworkWithWinner,
  ImageDimensions,
  ArtworkCardProps,
  GridPosition,
} from "./artwork";

// Vote types
export * from "./vote";
export type {
  Vote,
  VoteStatus,
  VoteRequest,
  VoteResponse,
  VoteCooldown,
  VoteButtonState,
  UserVoteHistory,
} from "./vote";
