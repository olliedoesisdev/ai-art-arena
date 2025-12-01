/**
 * Rate Limiting Utilities
 * In-memory rate limiting using LRU cache
 *
 * For future scaling, this can be swapped with Redis-based rate limiting
 * by implementing the RateLimiter interface
 */

import { LRUCache } from 'lru-cache';

export interface RateLimiterOptions {
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  interval?: number;

  /**
   * Maximum number of unique tokens to track
   * @default 500
   */
  uniqueTokenPerInterval?: number;
}

export interface RateLimiter {
  /**
   * Check if the token has exceeded the rate limit
   *
   * @param limit - Maximum number of requests allowed in the interval
   * @param token - Unique identifier for the requester (IP, user ID, etc.)
   * @returns Promise that resolves if under limit, rejects if rate limited
   */
  check(limit: number, token: string): Promise<void>;

  /**
   * Get the current usage count for a token
   *
   * @param token - Unique identifier for the requester
   * @returns Current number of requests made in the current interval
   */
  getUsage(token: string): number;

  /**
   * Reset the rate limit for a specific token
   *
   * @param token - Unique identifier for the requester
   */
  reset(token: string): void;
}

/**
 * In-memory rate limiter using LRU cache
 */
export class MemoryRateLimiter implements RateLimiter {
  private tokenCache: LRUCache<string, number[]>;
  private interval: number;

  constructor(options: RateLimiterOptions = {}) {
    this.interval = options.interval || 60000; // 1 minute default
    this.tokenCache = new LRUCache({
      max: options.uniqueTokenPerInterval || 500,
      ttl: this.interval,
    });
  }

  async check(limit: number, token: string): Promise<void> {
    const tokenCount = (this.tokenCache.get(token) as number[]) || [0];

    if (tokenCount[0] === 0) {
      this.tokenCache.set(token, tokenCount);
    }

    tokenCount[0] += 1;

    const currentUsage = tokenCount[0];
    const isRateLimited = currentUsage > limit;

    if (isRateLimited) {
      throw new RateLimitError(
        `Rate limit exceeded. Maximum ${limit} requests per ${this.interval / 1000} seconds.`,
        limit,
        currentUsage,
        this.interval
      );
    }
  }

  getUsage(token: string): number {
    const tokenCount = this.tokenCache.get(token) as number[] | undefined;
    return tokenCount ? tokenCount[0] : 0;
  }

  reset(token: string): void {
    this.tokenCache.delete(token);
  }
}

/**
 * Custom error for rate limiting
 */
export class RateLimitError extends Error {
  public readonly limit: number;
  public readonly current: number;
  public readonly interval: number;

  constructor(
    message: string,
    limit: number,
    current: number,
    interval: number
  ) {
    super(message);
    this.name = 'RateLimitError';
    this.limit = limit;
    this.current = current;
    this.interval = interval;
  }
}

/**
 * Create a rate limiter instance
 *
 * @example
 * ```ts
 * const limiter = rateLimit({
 *   interval: 60 * 1000, // 1 minute
 *   uniqueTokenPerInterval: 500,
 * });
 *
 * // In API route
 * try {
 *   await limiter.check(10, ipHash); // 10 requests per minute per IP
 * } catch (error) {
 *   if (error instanceof RateLimitError) {
 *     return NextResponse.json(
 *       { error: error.message },
 *       { status: 429 }
 *     );
 *   }
 * }
 * ```
 */
export function rateLimit(options?: RateLimiterOptions): RateLimiter {
  return new MemoryRateLimiter(options);
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Vote endpoint: 10 requests per minute per IP
   */
  vote: rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 1000,
  }),

  /**
   * API endpoints: 60 requests per minute per IP
   */
  api: rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 1000,
  }),

  /**
   * Auth endpoints: 5 requests per minute per IP
   */
  auth: rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
  }),
};
