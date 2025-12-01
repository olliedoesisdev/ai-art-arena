/**
 * Application-wide constants for AI Art Arena
 */

/**
 * Site Configuration
 */
export const SITE_CONFIG = {
  name: "AI Art Arena",
  description: "Weekly AI Art voting contest. Vote for your favorite AI-generated artwork!",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://olliedoesis.dev",
  ogImage: "/images/og-image.jpg",
  keywords: [
    "AI art",
    "art contest",
    "voting",
    "AI-generated art",
    "digital art",
    "weekly contest",
  ] as string[],
  author: "olliedoesis",
  social: {
    twitter: "@olliedoesis",
    github: "https://github.com/olliedoesis",
  },
};

/**
 * Contest Configuration
 */
export const CONTEST_CONFIG = {
  artworks_per_contest: 6,
  duration_days: 7,
  vote_cooldown_hours: 24,
  votes_per_user_per_day: 1,
  min_artworks_to_start: 6,
  max_artworks_per_contest: 6,
  grid_layout: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  timer_update_interval: 1000, // milliseconds
} as const;

/**
 * Page Routes (Public URLs)
 */
export const ROUTES = {
  home: "/",
  contest: "/contest",
  active_contest: "/contest/active",
  archive: "/archive",
  about: "/about",
  contest_by_week: (weekId: string | number) => `/contest/${weekId}`,
  archive_by_week: (weekId: string | number) => `/archive/${weekId}`,
} as const;

/**
 * API Routes (Backend Endpoints)
 */
export const API_ROUTES = {
  vote: "/api/vote",
  active_contest: "/api/contests/active",
  archived_contests: "/api/contests/archived",
  contest_by_id: (id: string) => `/api/contests/${id}`,
  cron_archive: "/api/cron/archive-contest",
} as const;

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  long: "MMMM d, yyyy",
  short: "MMM d, yyyy",
  time: "h:mm a",
  full: "MMMM d, yyyy 'at' h:mm a",
  iso: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

/**
 * Contest Status Values
 */
export const CONTEST_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  VOTE_COOLDOWN: (contestId: string) => `vote_cooldown_${contestId}`,
  LAST_VOTE_DATE: (contestId: string) => `last_vote_${contestId}`,
  USER_PREFERENCES: "user_preferences",
  THEME: "theme",
} as const;

/**
 * Image Configuration
 */
export const IMAGE_CONFIG = {
  PLACEHOLDER_URL: "/images/placeholders/default.jpg",
  SIZES: {
    THUMBNAIL: { width: 384, height: 384 },
    MEDIUM: { width: 768, height: 768 },
    LARGE: { width: 1200, height: 1200 },
  },
  QUALITY: {
    THUMBNAIL: 75,
    MEDIUM: 85,
    LARGE: 90,
  },
  FORMATS: ["image/avif", "image/webp", "image/jpeg"] as const,
} as const;

/**
 * Animation Durations (in milliseconds)
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  VOTE_COOLDOWN: "You can vote again in",
  ALREADY_VOTED: "You have already voted for this artwork today. Come back tomorrow to vote again!",
  CONTEST_ENDED: "This contest has ended",
  CONTEST_NOT_FOUND: "Contest not found",
  ARTWORK_NOT_FOUND: "Artwork not found",
  INVALID_VOTE: "Invalid vote submission",
  NETWORK_ERROR: "Network error. Please try again.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
  UNAUTHORIZED: "You must be logged in to vote",
  RATE_LIMITED: "Too many requests. Please try again later.",
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  VOTE_RECORDED: "Your vote has been recorded!",
  VOTE_UPDATED: "Vote count updated successfully",
  CONTEST_ARCHIVED: "Contest archived successfully",
  CONTEST_CREATED: "New contest created successfully",
} as const;

/**
 * Feature Flags
 * Control major features via environment variables
 */
export const FEATURES = {
  VOTING: process.env.NEXT_PUBLIC_FEATURE_VOTING !== 'false',
  ARCHIVE: process.env.NEXT_PUBLIC_FEATURE_ARCHIVE !== 'false',
  ANALYTICS: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS !== 'false',
  BLOG: process.env.NEXT_PUBLIC_FEATURE_BLOG !== 'false',
  REAL_TIME_UPDATES: process.env.NEXT_PUBLIC_FEATURE_REALTIME === 'true',
  AUTHENTICATION: process.env.NEXT_PUBLIC_FEATURE_AUTH !== 'false',
} as const;

/**
 * Grid Configuration
 * Dynamic grid layouts based on artwork count
 */
export const GRID_CONFIG = {
  layouts: {
    1: { mobile: 1, tablet: 1, desktop: 1 },
    2: { mobile: 1, tablet: 2, desktop: 2 },
    3: { mobile: 1, tablet: 2, desktop: 3 },
    4: { mobile: 1, tablet: 2, desktop: 2 },
    5: { mobile: 1, tablet: 2, desktop: 3 },
    6: { mobile: 1, tablet: 2, desktop: 3 },
    7: { mobile: 1, tablet: 2, desktop: 3 },
    8: { mobile: 1, tablet: 2, desktop: 4 },
    9: { mobile: 1, tablet: 2, desktop: 3 },
    10: { mobile: 1, tablet: 2, desktop: 4 },
    11: { mobile: 1, tablet: 2, desktop: 4 },
    12: { mobile: 1, tablet: 2, desktop: 4 },
  },
  /**
   * Get responsive grid classes based on artwork count
   */
  getGridClasses: (count: number): string => {
    if (count === 0) return 'grid grid-cols-1';
    if (count === 1) return 'grid grid-cols-1 place-items-center';
    if (count === 2) return 'grid grid-cols-1 md:grid-cols-2 place-items-center';
    if (count <= 4) return 'grid grid-cols-1 md:grid-cols-2';
    if (count <= 6) return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (count <= 9) return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  },
} as const;

/**
 * Cache Configuration
 * Revalidation times in seconds
 */
export const CACHE_CONFIG = {
  REVALIDATE_CONTEST: 60, // Active contest - 1 minute
  REVALIDATE_ARCHIVE: 3600, // Archive list - 1 hour
  REVALIDATE_ARCHIVED_CONTEST: 86400, // Single archived contest - 24 hours
  REVALIDATE_BLOG: 300, // Blog posts - 5 minutes
  REVALIDATE_STATIC: 604800, // Static content - 1 week
} as const;

/**
 * Configuration Validators
 * Runtime validation for configuration values
 */
export const CONFIG_VALIDATORS = {
  /**
   * Validate artwork count is within acceptable range
   */
  isValidArtworkCount: (count: number): boolean => {
    return (
      Number.isInteger(count) &&
      count >= CONTEST_CONFIG.min_artworks_to_start &&
      count <= CONTEST_CONFIG.max_artworks_per_contest
    );
  },

  /**
   * Validate contest duration in hours
   */
  isValidDuration: (hours: number): boolean => {
    return Number.isInteger(hours) && hours > 0 && hours <= 168; // Max 1 week
  },

  /**
   * Validate vote cooldown period in hours
   */
  isValidCooldown: (hours: number): boolean => {
    return Number.isInteger(hours) && hours >= 1 && hours <= 72; // 1-72 hours
  },

  /**
   * Validate timer update interval in milliseconds
   */
  isValidTimerInterval: (ms: number): boolean => {
    return Number.isInteger(ms) && ms >= 100 && ms <= 5000;
  },
} as const;

/**
 * Backwards Compatibility Exports
 * (Keep old names for existing code)
 */
export const APP_NAME = SITE_CONFIG.name;
export const APP_DESCRIPTION = SITE_CONFIG.description;
export const APP_URL = SITE_CONFIG.url;
export const CONTEST_DURATION_DAYS = CONTEST_CONFIG.duration_days;
export const ARTWORKS_PER_CONTEST = CONTEST_CONFIG.artworks_per_contest;
export const VOTE_COOLDOWN_HOURS = CONTEST_CONFIG.vote_cooldown_hours;
export const VOTES_PER_USER_PER_DAY = CONTEST_CONFIG.votes_per_user_per_day;
export const PAGE_ROUTES = ROUTES; // Alias for consistency

/**
 * Type exports for constant values
 */
export type ContestStatusType = typeof CONTEST_STATUS[keyof typeof CONTEST_STATUS];
export type RouteKey = keyof typeof ROUTES;
export type ApiRouteKey = keyof typeof API_ROUTES;
export type FeatureFlags = typeof FEATURES;
export type FeatureKey = keyof FeatureFlags;
