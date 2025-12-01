/**
 * Redis-based Rate Limiting
 * Production-ready rate limiting with Upstash Redis
 * Falls back to in-memory rate limiting in development
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only create Redis instance if env vars are present (production)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Create rate limiter for voting
 * - Production: Redis-backed (distributed, scales horizontally)
 * - Development: Falls back to in-memory limiter
 */
export const voteRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 votes per minute
      analytics: true,
      prefix: 'ratelimit:vote',
    })
  : null;

/**
 * Create rate limiter for general API routes
 */
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '60 s'), // 60 requests per minute
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null;

/**
 * Create rate limiter for auth endpoints
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 attempts per minute
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null;

/**
 * Check rate limit and throw if exceeded
 * Automatically falls back to in-memory limiter in development
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  fallbackLimiter?: { check: (limit: number, token: string) => Promise<void> }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (limiter) {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    return { success, limit, remaining, reset };
  }

  // Fallback to in-memory limiter in development
  if (fallbackLimiter) {
    try {
      await fallbackLimiter.check(10, identifier);
      return { success: true, limit: 10, remaining: 0, reset: Date.now() + 60000 };
    } catch {
      return { success: false, limit: 10, remaining: 0, reset: Date.now() + 60000 };
    }
  }

  // If no limiter available, allow the request (development only)
  return { success: true, limit: 0, remaining: 0, reset: 0 };
}
