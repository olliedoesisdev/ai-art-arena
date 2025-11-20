/**
 * ContestTimer Component
 * Live countdown timer for contest end date
 */

"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui";
import { getTimeRemaining } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CONTEST_CONFIG } from "@/lib/constants";

export interface ContestTimerProps {
  /** Contest end date (ISO string or Date) */
  endDate: string | Date;
  /** Callback when timer expires */
  onExpire?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show as compact format */
  compact?: boolean;
}

/**
 * Live countdown timer with automatic updates
 *
 * @example
 * ```tsx
 * <ContestTimer
 *   endDate={contest.end_date}
 *   onExpire={() => console.log("Contest ended!")}
 * />
 * ```
 */
export const ContestTimer: React.FC<ContestTimerProps> = ({
  endDate,
  onExpire,
  className,
  compact = false,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(() => getTimeRemaining(endDate));
  const [hasExpired, setHasExpired] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Initial check
    const initial = getTimeRemaining(endDate);
    setTimeLeft(initial);
    setHasExpired(initial.hasEnded);

    if (initial.hasEnded) {
      onExpire?.();
      return;
    }

    // Update every second
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(endDate);
      setTimeLeft(remaining);

      if (remaining.hasEnded && !hasExpired) {
        setHasExpired(true);
        onExpire?.();
        clearInterval(interval);
      }
    }, CONTEST_CONFIG.timer_update_interval);

    return () => clearInterval(interval);
  }, [endDate, onExpire, hasExpired]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Show "Contest Ended" badge when expired
  if (hasExpired || timeLeft.hasEnded) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Badge variant="destructive">Contest Ended</Badge>
      </div>
    );
  }

  // Check if less than 24 hours remaining
  const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Format time units with leading zeros
  const formatUnit = (value: number): string => {
    return value.toString().padStart(2, "0");
  };

  if (compact) {
    // Compact format: "3d 14h 23m"
    const parts: string[] = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    if (timeLeft.hours > 0 || timeLeft.days > 0) parts.push(`${timeLeft.hours}h`);
    parts.push(`${timeLeft.minutes}m`);

    return (
      <div className={cn("flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-gray-300 shadow-sm", className)}>
        <Clock className={cn("h-4 w-4", isUrgent ? "text-orange-600" : "text-gray-600")} />
        <span
          className={cn(
            "text-sm font-bold",
            isUrgent ? "text-orange-600" : "text-black"
          )}
        >
          {parts.join(" ")} left
        </span>
      </div>
    );
  }

  // Full format with time units
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Clock
        className={cn("h-5 w-5", isUrgent ? "text-error" : "text-muted-foreground")}
      />
      <div className="flex items-center gap-2">
        {/* Days */}
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "text-2xl font-bold tabular-nums",
                isUrgent ? "text-error" : "text-foreground"
              )}
            >
              {formatUnit(timeLeft.days)}
            </span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        )}

        {/* Separator */}
        {timeLeft.days > 0 && (
          <span
            className={cn(
              "text-2xl font-bold",
              isUrgent ? "text-error" : "text-muted-foreground"
            )}
          >
            :
          </span>
        )}

        {/* Hours */}
        <div className="flex flex-col items-center">
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              isUrgent ? "text-error" : "text-foreground"
            )}
          >
            {formatUnit(timeLeft.hours)}
          </span>
          <span className="text-xs text-muted-foreground">hours</span>
        </div>

        {/* Separator */}
        <span
          className={cn(
            "text-2xl font-bold",
            isUrgent ? "text-error" : "text-muted-foreground"
          )}
        >
          :
        </span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              isUrgent ? "text-error" : "text-foreground"
            )}
          >
            {formatUnit(timeLeft.minutes)}
          </span>
          <span className="text-xs text-muted-foreground">mins</span>
        </div>

        {/* Separator */}
        <span
          className={cn(
            "text-2xl font-bold",
            isUrgent ? "text-error" : "text-muted-foreground"
          )}
        >
          :
        </span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              isUrgent ? "text-error" : "text-foreground"
            )}
          >
            {formatUnit(timeLeft.seconds)}
          </span>
          <span className="text-xs text-muted-foreground">secs</span>
        </div>
      </div>
    </div>
  );
};

ContestTimer.displayName = "ContestTimer";
