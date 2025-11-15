/**
 * Artwork type definitions
 */

export interface Artwork {
  id: string;
  contest_id: string;
  title: string;
  description: string | null;
  image_url: string;
  prompt: string | null;
  artist_name: string | null;
  vote_count: number;
  position: number;
  created_at: string;
}

export interface ArtworkWithVoteStatus extends Artwork {
  hasUserVoted: boolean;
  isWinner?: boolean;
}

/**
 * Artwork with winner status and metadata
 */
export interface ArtworkWithWinner extends Artwork {
  isWinner: true;
  winningWeek: number;
  winningDate: string;
  finalVoteCount: number;
}

/**
 * Image dimensions for responsive loading
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Artwork card display props
 */
export interface ArtworkCardProps {
  artwork: Artwork;
  onVote?: (artworkId: string) => Promise<void>;
  canVote?: boolean;
  isLoading?: boolean;
  showVoteCount?: boolean;
  showPrompt?: boolean;
  className?: string;
}

/**
 * Grid position for artwork layout
 */
export interface GridPosition {
  row: number;
  col: number;
  position: number;
}
