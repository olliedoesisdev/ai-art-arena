/**
 * Date utility functions for AI Art Arena
 * Uses date-fns for date manipulation and formatting
 */

import {
  format,
  formatDistanceToNow,
  isPast,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  addHours,
  parseISO,
  isValid,
} from "date-fns";

import { DATE_FORMATS } from "@/lib/constants";

/**
 * Safely parse a date string or Date object
 */
function safeParseDate(date: string | Date): Date {
  if (date instanceof Date) {
    return date;
  }
  try {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : new Date(date);
  } catch {
    return new Date(date);
  }
}

/**
 * Format a date as "MMM d, yyyy"
 * @example formatDate("2024-11-13") => "Nov 13, 2024"
 */
export function formatDate(date: string | Date): string {
  try {
    const parsedDate = safeParseDate(date);
    return format(parsedDate, DATE_FORMATS.short);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

/**
 * Format a date with time as "MMM d, yyyy h:mm a"
 * @example formatDateTime("2024-11-13T14:30:00") => "Nov 13, 2024 2:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  try {
    const parsedDate = safeParseDate(date);
    return format(parsedDate, DATE_FORMATS.full);
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "Invalid date";
  }
}

/**
 * Format a date as long format "MMMM d, yyyy"
 * @example formatLongDate("2024-11-13") => "November 13, 2024"
 */
export function formatLongDate(date: string | Date): string {
  try {
    const parsedDate = safeParseDate(date);
    return format(parsedDate, DATE_FORMATS.long);
  } catch (error) {
    console.error("Error formatting long date:", error);
    return "Invalid date";
  }
}

/**
 * Format a time only as "h:mm a"
 * @example formatTime("2024-11-13T14:30:00") => "2:30 PM"
 */
export function formatTime(date: string | Date): string {
  try {
    const parsedDate = safeParseDate(date);
    return format(parsedDate, DATE_FORMATS.time);
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid time";
  }
}

/**
 * Format relative time from now
 * @example formatRelativeTime("2024-11-10") => "3 days ago"
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const parsedDate = safeParseDate(date);
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Invalid date";
  }
}

/**
 * Check if a date is in the past
 * @example isExpired("2024-11-10") => true (if current date is after)
 */
export function isExpired(date: string | Date): boolean {
  try {
    const parsedDate = safeParseDate(date);
    return isPast(parsedDate);
  } catch (error) {
    console.error("Error checking if expired:", error);
    return false;
  }
}

/**
 * Time remaining breakdown interface
 */
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // Total milliseconds
  hasEnded: boolean;
}

/**
 * Get detailed time remaining until an end date
 * @example getTimeRemaining("2024-11-16T00:00:00") => { days: 3, hours: 14, minutes: 23, seconds: 45, total: 294225000, hasEnded: false }
 */
export function getTimeRemaining(endDate: string | Date): TimeRemaining {
  try {
    const end = safeParseDate(endDate);
    const now = new Date();

    // Check if ended
    if (isPast(end)) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        hasEnded: true,
      };
    }

    // Calculate differences
    const totalMs = end.getTime() - now.getTime();
    const days = differenceInDays(end, now);
    const hours = differenceInHours(end, now) % 24;
    const minutes = differenceInMinutes(end, now) % 60;
    const seconds = differenceInSeconds(end, now) % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
      total: totalMs,
      hasEnded: false,
    };
  } catch (error) {
    console.error("Error getting time remaining:", error);
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      hasEnded: true,
    };
  }
}

/**
 * Format countdown as compact string
 * @example formatCountdown("2024-11-16T14:30:00") => "3d 14h 23m"
 * @example formatCountdown("2024-11-13T16:30:00") => "2h 45m"
 * @example formatCountdown("2024-11-13T14:05:00") => "5m 30s"
 */
export function formatCountdown(endDate: string | Date): string {
  try {
    const { days, hours, minutes, seconds, hasEnded } = getTimeRemaining(endDate);

    if (hasEnded) {
      return "Ended";
    }

    // Show days, hours, minutes if days > 0
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }

    // Show hours, minutes if hours > 0
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    // Show minutes, seconds if only minutes remain
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }

    // Show only seconds if less than a minute
    return `${seconds}s`;
  } catch (error) {
    console.error("Error formatting countdown:", error);
    return "Invalid date";
  }
}

/**
 * Format countdown with full words
 * @example formatCountdownLong("2024-11-16T14:30:00") => "3 days 14 hours 23 minutes"
 */
export function formatCountdownLong(endDate: string | Date): string {
  try {
    const { days, hours, minutes, hasEnded } = getTimeRemaining(endDate);

    if (hasEnded) {
      return "Contest has ended";
    }

    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    }
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    }
    if (minutes > 0 && days === 0) {
      // Only show minutes if no days
      parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
    }

    return parts.join(" ") || "Less than a minute";
  } catch (error) {
    console.error("Error formatting countdown long:", error);
    return "Invalid date";
  }
}

/**
 * Add hours to a date
 * @example addHoursToDate("2024-11-13T14:00:00", 24) => Date 24 hours later
 */
export function addHoursToDate(date: string | Date, hours: number): Date {
  try {
    const parsedDate = safeParseDate(date);
    return addHours(parsedDate, hours);
  } catch (error) {
    console.error("Error adding hours to date:", error);
    return new Date();
  }
}

/**
 * Get the number of hours between two dates
 * @example getHoursBetween("2024-11-13T14:00:00", "2024-11-14T14:00:00") => 24
 */
export function getHoursBetween(startDate: string | Date, endDate: string | Date): number {
  try {
    const start = safeParseDate(startDate);
    const end = safeParseDate(endDate);
    return differenceInHours(end, start);
  } catch (error) {
    console.error("Error getting hours between:", error);
    return 0;
  }
}

/**
 * Check if a date is valid
 * @example isValidDate("2024-11-13") => true
 * @example isValidDate("invalid") => false
 */
export function isValidDate(date: string | Date): boolean {
  try {
    const parsedDate = safeParseDate(date);
    return isValid(parsedDate);
  } catch {
    return false;
  }
}

/**
 * Format ISO date string for display
 * @example formatISODate("2024-11-13T14:30:00.000Z") => "Nov 13, 2024 2:30 PM"
 */
export function formatISODate(isoString: string): string {
  return formatDateTime(isoString);
}

/**
 * Get current timestamp in ISO format
 * @example getCurrentTimestamp() => "2024-11-13T14:30:00.000Z"
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
