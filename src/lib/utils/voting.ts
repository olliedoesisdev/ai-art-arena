/**
 * Voting utility functions for AI Art Arena
 * Handles user identification, cooldown management, and vote tracking
 */

import { STORAGE_KEYS, VOTE_COOLDOWN_HOURS } from "@/lib/constants";
import { addHoursToDate } from "./date";

/**
 * Generate a privacy-preserving user identifier using SHA-256
 * Creates a unique hash from IP address and user agent
 *
 * @param ip - User's IP address
 * @param userAgent - Browser user agent string
 * @returns SHA-256 hash string
 *
 * @example
 * generateUserIdentifier("192.168.1.1", "Mozilla/5.0...") => "a1b2c3d4..."
 */
export async function generateUserIdentifier(
  ip: string,
  userAgent: string
): Promise<string> {
  const fingerprint = `${ip}:${userAgent}`;

  // Use Web Crypto API for SHA-256 hashing
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Fallback for server-side (Node.js)
  if (typeof global !== "undefined") {
    const crypto = await import("crypto");
    return crypto.createHash("sha256").update(fingerprint).digest("hex");
  }

  // Simple fallback if crypto is not available
  console.warn("Crypto API not available, using simple hash");
  return btoa(fingerprint);
}

/**
 * Get the localStorage key for vote cooldown
 *
 * @param contestId - Contest ID
 * @returns LocalStorage key string
 *
 * @example
 * getVoteCooldownKey("contest-123") => "vote_cooldown_contest-123"
 */
export function getVoteCooldownKey(contestId: string): string {
  return STORAGE_KEYS.VOTE_COOLDOWN(contestId);
}

/**
 * Set vote cooldown in localStorage (24 hours from now)
 *
 * @param contestId - Contest ID to set cooldown for
 * @returns The cooldown end date
 *
 * @example
 * setVoteCooldown("contest-123") => Date (24 hours from now)
 */
export function setVoteCooldown(contestId: string): Date {
  if (typeof window === "undefined") {
    throw new Error("setVoteCooldown can only be called in the browser");
  }

  const now = new Date();
  const cooldownEnd = addHoursToDate(now, VOTE_COOLDOWN_HOURS);
  const key = getVoteCooldownKey(contestId);

  try {
    localStorage.setItem(key, cooldownEnd.toISOString());
    return cooldownEnd;
  } catch (error) {
    console.error("Error setting vote cooldown:", error);
    return cooldownEnd;
  }
}

/**
 * Get vote cooldown end date from localStorage
 *
 * @param contestId - Contest ID
 * @returns Cooldown end date or null if not set
 *
 * @example
 * getVoteCooldown("contest-123") => Date or null
 */
export function getVoteCooldown(contestId: string): Date | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = getVoteCooldownKey(contestId);

  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    const cooldownEnd = new Date(stored);
    return isNaN(cooldownEnd.getTime()) ? null : cooldownEnd;
  } catch (error) {
    console.error("Error getting vote cooldown:", error);
    return null;
  }
}

/**
 * Clear vote cooldown from localStorage
 *
 * @param contestId - Contest ID
 *
 * @example
 * clearVoteCooldown("contest-123")
 */
export function clearVoteCooldown(contestId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = getVoteCooldownKey(contestId);

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing vote cooldown:", error);
  }
}

/**
 * Check if user can vote now (cooldown has expired)
 *
 * @param contestId - Contest ID
 * @returns true if user can vote, false if still in cooldown
 *
 * @example
 * canVoteNow("contest-123") => true or false
 */
export function canVoteNow(contestId: string): boolean {
  const cooldownEnd = getVoteCooldown(contestId);

  if (!cooldownEnd) {
    return true; // No cooldown set, can vote
  }

  const now = new Date();
  const canVote = now >= cooldownEnd;

  // Clear expired cooldown
  if (canVote) {
    clearVoteCooldown(contestId);
  }

  return canVote;
}

/**
 * Get time remaining in cooldown (in milliseconds)
 *
 * @param contestId - Contest ID
 * @returns Milliseconds remaining or 0 if can vote
 *
 * @example
 * getCooldownTimeRemaining("contest-123") => 3600000 (1 hour)
 */
export function getCooldownTimeRemaining(contestId: string): number {
  const cooldownEnd = getVoteCooldown(contestId);

  if (!cooldownEnd) {
    return 0;
  }

  const now = new Date();
  const remaining = cooldownEnd.getTime() - now.getTime();

  return Math.max(0, remaining);
}

/**
 * Format cooldown time remaining as human-readable string
 *
 * @param contestId - Contest ID
 * @returns Formatted string like "2h 45m" or "Can vote now"
 *
 * @example
 * formatCooldownRemaining("contest-123") => "2h 45m"
 */
export function formatCooldownRemaining(contestId: string): string {
  const remaining = getCooldownTimeRemaining(contestId);

  if (remaining === 0) {
    return "Can vote now";
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  return `${seconds}s`;
}

/**
 * Store user's vote in localStorage for client-side tracking
 *
 * @param contestId - Contest ID
 * @param artworkId - Artwork ID that was voted for
 *
 * @example
 * storeUserVote("contest-123", "artwork-456")
 */
export function storeUserVote(contestId: string, artworkId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = STORAGE_KEYS.LAST_VOTE_DATE(contestId);
  const voteData = {
    artworkId,
    votedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(voteData));
  } catch (error) {
    console.error("Error storing user vote:", error);
  }
}

/**
 * Get user's last vote for a contest
 *
 * @param contestId - Contest ID
 * @returns Vote data or null if not found
 *
 * @example
 * getUserLastVote("contest-123") => { artworkId: "artwork-456", votedAt: "2024-11-13..." }
 */
export function getUserLastVote(
  contestId: string
): { artworkId: string; votedAt: string } | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = STORAGE_KEYS.LAST_VOTE_DATE(contestId);

  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error("Error getting user last vote:", error);
    return null;
  }
}

/**
 * Clear all voting data from localStorage (useful for testing)
 *
 * @example
 * clearAllVoteData()
 */
export function clearAllVoteData(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("vote_")) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing all vote data:", error);
  }
}

/**
 * Check if user has voted for a specific artwork
 *
 * @param contestId - Contest ID
 * @param artworkId - Artwork ID
 * @returns true if user voted for this artwork
 *
 * @example
 * hasVotedForArtwork("contest-123", "artwork-456") => true or false
 */
export function hasVotedForArtwork(contestId: string, artworkId: string): boolean {
  const lastVote = getUserLastVote(contestId);
  return lastVote?.artworkId === artworkId;
}

/**
 * Get vote status for a contest
 *
 * @param contestId - Contest ID
 * @returns Object with vote status information
 *
 * @example
 * getVoteStatus("contest-123") => { canVote: false, cooldownEnd: Date, timeRemaining: 3600000, lastVote: {...} }
 */
export function getVoteStatus(contestId: string): {
  canVote: boolean;
  cooldownEnd: Date | null;
  timeRemaining: number;
  lastVote: { artworkId: string; votedAt: string } | null;
} {
  return {
    canVote: canVoteNow(contestId),
    cooldownEnd: getVoteCooldown(contestId),
    timeRemaining: getCooldownTimeRemaining(contestId),
    lastVote: getUserLastVote(contestId),
  };
}

/**
 * Validate that a vote request is valid
 *
 * @param contestId - Contest ID
 * @param artworkId - Artwork ID
 * @returns Object with validation result
 *
 * @example
 * validateVoteRequest("contest-123", "artwork-456") => { isValid: true, error: null }
 */
export function validateVoteRequest(
  contestId: string,
  artworkId: string
): { isValid: boolean; error: string | null } {
  if (!contestId || typeof contestId !== "string") {
    return { isValid: false, error: "Invalid contest ID" };
  }

  if (!artworkId || typeof artworkId !== "string") {
    return { isValid: false, error: "Invalid artwork ID" };
  }

  if (!canVoteNow(contestId)) {
    const remaining = formatCooldownRemaining(contestId);
    return {
      isValid: false,
      error: `You can vote again in ${remaining}`,
    };
  }

  return { isValid: true, error: null };
}
