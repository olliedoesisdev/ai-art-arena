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

export interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  website_url: string | null;
  avatar_url: string | null;
  is_public: boolean;
  joined_at: string;
}

export interface VoteHistoryItem {
  vote_id: string;
  user_id: string;
  voted_at: string;
  artwork_id: string;
  artwork_title: string;
  artwork_image_url: string;
  artwork_vote_count: number;
  contest_id: string;
  contest_week: number;
  contest_status: "active" | "archived";
}

export interface CommentHistoryItem {
  comment_id: string;
  user_id: string;
  author_name: string;
  comment_body: string;
  commented_at: string;
  contest_id: string;
  contest_week: number;
  contest_status: "active" | "archived";
}

export type ActivityType = "vote" | "comment";

export interface ActivityFeedItem {
  activity_id: string;
  user_id: string;
  activity_at: string;
  activity_type: ActivityType;
  artwork_id: string | null;
  artwork_title: string | null;
  artwork_image_url: string | null;
  artwork_vote_count: number | null;
  contest_id: string;
  contest_week: number;
  contest_status: "active" | "archived";
  comment_body: string | null;
}

export interface ProfilePageData {
  profile: UserProfile;
  activityFeed: ActivityFeedItem[];
  totalVotes: number;
  totalComments: number;
  isOwnProfile: boolean;
}

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
