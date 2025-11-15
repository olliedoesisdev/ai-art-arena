/**
 * Utility functions central export
 * AI Art Arena - Easy import access to all utilities
 */

// ============================================
// Class Name Utilities
// ============================================
export { cn } from "./cn";

// ============================================
// Date Utilities
// ============================================
export {
  formatDate,
  formatDateTime,
  formatLongDate,
  formatTime,
  formatRelativeTime,
  isExpired,
  getTimeRemaining,
  formatCountdown,
  formatCountdownLong,
  addHoursToDate,
  getHoursBetween,
  isValidDate,
  formatISODate,
  getCurrentTimestamp,
} from "./date";

export type { TimeRemaining } from "./date";

// ============================================
// Voting Utilities
// ============================================
export {
  generateUserIdentifier,
  getVoteCooldownKey,
  setVoteCooldown,
  getVoteCooldown,
  clearVoteCooldown,
  canVoteNow,
  getCooldownTimeRemaining,
  formatCooldownRemaining,
  storeUserVote,
  getUserLastVote,
  clearAllVoteData,
  hasVotedForArtwork,
  getVoteStatus,
  validateVoteRequest,
} from "./voting";
