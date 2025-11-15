/**
 * Contest type definitions
 */

export type ContestStatus = "active" | "archived";

export interface Contest {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  status: ContestStatus;
  winner_artwork_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContestWithArtworks extends Contest {
  artworks: Artwork[];
}

/**
 * Active contest information with real-time data
 */
export interface ActiveContestInfo {
  contest: Contest;
  artworks: Artwork[];
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  };
  hasEnded: boolean;
  totalVotes: number;
}

export interface ArchivedContest extends Contest {
  status: "archived";
  winner_artwork_id: string;
  winner?: Artwork;
}

/**
 * Artwork type (imported here to avoid circular dependency issues)
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

/**
 * Client-side contest state
 */
export interface ContestState {
  contest: Contest | null;
  artworks: Artwork[];
  isLoading: boolean;
  error: string | null;
  timeRemaining: number | null;
}

/**
 * Contest time remaining breakdown
 */
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  hasEnded: boolean;
}
