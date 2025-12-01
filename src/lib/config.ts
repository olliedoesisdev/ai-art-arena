// ===========================================
// AI ART ARENA - CONFIGURATION
// ===========================================

// ===========================================
// CONTEST SETTINGS
// ===========================================

export const CONTEST_CONFIG = {
  /** Minimum artworks allowed per contest */
  MIN_ARTWORKS: parseInt(process.env.NEXT_PUBLIC_MIN_ARTWORKS || '1', 10),
  
  /** Maximum artworks allowed per contest */
  MAX_ARTWORKS: parseInt(process.env.NEXT_PUBLIC_MAX_ARTWORKS || '12', 10),
  
  /** Default number of artworks per contest */
  DEFAULT_ARTWORKS: parseInt(process.env.NEXT_PUBLIC_DEFAULT_ARTWORKS || '6', 10),
  
  /** Contest duration in days */
  DURATION_DAYS: parseInt(process.env.NEXT_PUBLIC_CONTEST_DURATION_DAYS || '7', 10),
  
  /** Hours between votes (cooldown) */
  VOTE_COOLDOWN_HOURS: parseInt(process.env.NEXT_PUBLIC_VOTE_COOLDOWN_HOURS || '24', 10),
  
  /** Calculated: cooldown in milliseconds */
  get VOTE_COOLDOWN_MS() {
    return this.VOTE_COOLDOWN_HOURS * 60 * 60 * 1000;
  },
  
  /** Calculated: contest duration in milliseconds */
  get DURATION_MS() {
    return this.DURATION_DAYS * 24 * 60 * 60 * 1000;
  },
} as const;

// ===========================================
// GRID LAYOUT SETTINGS
// ===========================================

export const GRID_CONFIG = {
  /** Grid layouts based on artwork count */
  LAYOUTS: {
    1: { cols: 1, rows: 1, className: 'grid-cols-1' },
    2: { cols: 2, rows: 1, className: 'grid-cols-2' },
    3: { cols: 3, rows: 1, className: 'grid-cols-3' },
    4: { cols: 2, rows: 2, className: 'grid-cols-2' },
    5: { cols: 3, rows: 2, className: 'grid-cols-3' }, // 3+2 layout
    6: { cols: 3, rows: 2, className: 'grid-cols-3' },
    7: { cols: 4, rows: 2, className: 'grid-cols-4' }, // 4+3 layout
    8: { cols: 4, rows: 2, className: 'grid-cols-4' },
    9: { cols: 3, rows: 3, className: 'grid-cols-3' },
    10: { cols: 5, rows: 2, className: 'grid-cols-5' },
    11: { cols: 4, rows: 3, className: 'grid-cols-4' },
    12: { cols: 4, rows: 3, className: 'grid-cols-4' },
  } as Record<number, { cols: number; rows: number; className: string }>,
  
  /** Get optimal layout for artwork count */
  getLayout(count: number) {
    return this.LAYOUTS[count] || this.LAYOUTS[6];
  },
  
  /** Responsive breakpoints */
  BREAKPOINTS: {
    sm: 'sm:grid-cols-2',
    md: 'md:grid-cols-3',
    lg: 'lg:grid-cols-3',
  },
} as const;

// ===========================================
// CACHING & PERFORMANCE
// ===========================================

export const CACHE_CONFIG = {
  /** How often to revalidate active contest data (seconds) */
  REVALIDATE_SECONDS: parseInt(
    process.env.NEXT_PUBLIC_CACHE_REVALIDATE_SECONDS || '30',
    10
  ),
  
  /** SWR dedupe interval (ms) */
  DEDUPE_INTERVAL: 2000,
  
  /** Archive data cache time (doesn't change, cache longer) */
  ARCHIVE_CACHE_SECONDS: 3600, // 1 hour
  
  /** Real-time updates enabled */
  REALTIME_ENABLED: process.env.NEXT_PUBLIC_REALTIME_ENABLED !== 'false',
} as const;

// ===========================================
// RATE LIMITING
// ===========================================

export const RATE_LIMIT_CONFIG = {
  /** Max votes per IP per minute */
  VOTES_PER_MINUTE: parseInt(
    process.env.RATE_LIMIT_VOTES_PER_MINUTE || '10',
    10
  ),
  
  /** Max API requests per IP per minute */
  REQUESTS_PER_MINUTE: parseInt(
    process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60',
    10
  ),
  
  /** Window size in seconds */
  WINDOW_SECONDS: 60,
} as const;

// ===========================================
// FEATURE FLAGS
// ===========================================

export const FEATURES = {
  ANALYTICS: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false',
  ARCHIVE: process.env.NEXT_PUBLIC_ARCHIVE_ENABLED !== 'false',
  VOTING: process.env.NEXT_PUBLIC_VOTING_ENABLED !== 'false',
  AUTO_ARCHIVE: process.env.ARCHIVE_AUTO_ENABLED !== 'false',
} as const;

// ===========================================
// SITE METADATA
// ===========================================

export const SITE_CONFIG = {
  URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://olliedoesis.dev',
  NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'AI Art Arena',
  DESCRIPTION: 'Weekly AI art voting contest',
  
  /** Social/SEO defaults */
  OG_IMAGE: '/og-image.png',
  TWITTER_HANDLE: '@olliedoesis',
} as const;

// ===========================================
// PAGINATION
// ===========================================

export const PAGINATION_CONFIG = {
  /** Default items per page */
  DEFAULT_PAGE_SIZE: 12,
  
  /** Maximum items per page (prevent abuse) */
  MAX_PAGE_SIZE: 50,
  
  /** Archive grid items per page */
  ARCHIVE_PAGE_SIZE: 12,
} as const;

// ===========================================
// VALIDATION HELPERS
// ===========================================

export const VALIDATORS = {
  /** Check if artwork count is valid */
  isValidArtworkCount(count: number): boolean {
    return (
      count >= CONTEST_CONFIG.MIN_ARTWORKS &&
      count <= CONTEST_CONFIG.MAX_ARTWORKS
    );
  },
  
  /** Check if position is valid for given artwork count */
  isValidPosition(position: number, totalArtworks: number): boolean {
    return position >= 1 && position <= totalArtworks;
  },
  
  /** Sanitize page size */
  sanitizePageSize(size: number): number {
    return Math.min(
      Math.max(1, size),
      PAGINATION_CONFIG.MAX_PAGE_SIZE
    );
  },
} as const;

// ===========================================
// TYPE EXPORTS
// ===========================================

export type ContestConfig = typeof CONTEST_CONFIG;
export type GridConfig = typeof GRID_CONFIG;
export type CacheConfig = typeof CACHE_CONFIG;
export type Features = typeof FEATURES;
