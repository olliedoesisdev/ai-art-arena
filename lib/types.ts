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

export interface Comment {
  id: string;
  artwork_id: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  is_admin_reply: boolean;
  is_approved: boolean;
  created_at: string;
}

// author_email intentionally omitted — never passed to the client

export type ReactionEmoji = "like" | "love" | "laugh" | "wow";
export type ReactionCounts = Record<ReactionEmoji, number>;

export interface CommentThread {
  comment: Comment;
  replies: Comment[];
  reactions: ReactionCounts;
  replyReactions: ReactionCounts[];
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

export type ArtistApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "waitlisted";

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export interface ArtistApplication {
  id: string;
  name: string;
  email: string;
  location: string | null;
  artist_bio: string;
  art_style: string;
  primary_tools: string[];
  years_using_ai: string;
  portfolio_url: string | null;
  social_handle: string | null;
  submission_title: string;
  submission_prompt: string;
  submission_image_url: string;
  submission_image_path: string;
  status: ArtistApplicationStatus;
  admin_notes: string | null;
  applied_at: string;
  reviewed_at: string | null;
  approved_for_contest_id: string | null;
}
