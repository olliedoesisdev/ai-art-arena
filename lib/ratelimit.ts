import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

// Authenticated users: 1 vote per 24 hours, keyed by email hash.
// One vote per contest — the daily cadence makes per-identity global scope
// equivalent to per-identity-per-contest since only one contest is active.
export const voteRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "24 h"),
  analytics: true,
  prefix: "vote:authed",
});

// Anonymous users: up to 5 votes per IP per 24 hours.
// Scoped per IP hash only — authenticated users bypass this limiter entirely.
export const anonVoteRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "24 h"),
  analytics: true,
  prefix: "vote:anon",
});

// Build a rate limit key for a vote attempt.
// Authenticated: keyed by email hash (stronger signal than IP).
// Anonymous: keyed by IP hash.
// Raw PII never stored in Redis — always hashed with VOTE_HASH_SALT.
export function buildVoteRateLimitKey(
  email: string | null | undefined,
  ipHash: string,
): string {
  const salt = process.env.VOTE_HASH_SALT;
  if (!salt) throw new Error("VOTE_HASH_SALT env var is required");

  if (email) {
    const emailHash = crypto
      .createHash("sha256")
      .update("email:" + email.toLowerCase().trim() + salt)
      .digest("hex")
      .slice(0, 32);
    return `email:${emailHash}`;
  }

  // ipHash is already hashed by hashIP() in lib/utils.ts
  return `ip:${ipHash}`;
}

// Hash an email address for storage in the votes table.
// Uses the same salt as buildVoteRateLimitKey so both layers are consistent.
export function hashEmail(email: string): string {
  const salt = process.env.VOTE_HASH_SALT;
  if (!salt) throw new Error("VOTE_HASH_SALT env var is required");
  return crypto
    .createHash("sha256")
    .update(email.toLowerCase().trim() + salt)
    .digest("hex")
    .slice(0, 32);
}

// 100 admin requests per minute
export const adminRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "admin",
});

// 10 admin uploads per hour
export const adminUploadRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "admin_upload",
});

// 5 auth actions (signup, magic-link) per IP per 15 minutes
export const authRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "auth",
});

// 3 password reset requests per IP per hour
export const resetRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix: "reset",
});
