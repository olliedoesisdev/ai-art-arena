// Database types
export interface Contest {
  id: string;
  week_number: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: "active" | "archived";
  artwork_count: number;
  created_at: string;
  updated_at: string;
  artworks?: Artwork[];
}

export interface Artwork {
  id: string;
  contest_id: string;
  image_url: string;
  title: string;
  prompt?: string;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  artwork_id: string;
  contest_id: string;
  user_id?: string;
  ip_hash: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface VoteResponse {
  success: boolean;
  message?: string;
  error?: string;
  resetAt?: string;
}
