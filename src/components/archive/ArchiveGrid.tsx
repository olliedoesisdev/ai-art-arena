/**
 * ArchiveGrid Component
 * Responsive grid layout for archived contests
 */

"use client";

import * as React from "react";
import { ArchiveCard } from "./ArchiveCard";
import type { Contest, Artwork } from "@/types";

export interface ArchiveGridProps {
  /** Array of archived contests with winners */
  contests: Array<{
    contest: Contest;
    winner: Artwork;
  }>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Grid layout for archived contests
 * 1 column mobile, 2 columns tablet, 3 columns desktop
 *
 * @example
 * ```tsx
 * <ArchiveGrid
 *   contests={archivedContests}
 * />
 * ```
 */
export const ArchiveGrid: React.FC<ArchiveGridProps> = ({
  contests,
  className,
}) => {
  // Empty state
  if (!contests || contests.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No archived contests yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Past contest winners will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${className || ""}`}
    >
      {contests.map(({ contest, winner }) => (
        <ArchiveCard
          key={contest.id}
          contest={contest}
          winner={winner}
        />
      ))}
    </div>
  );
};

ArchiveGrid.displayName = "ArchiveGrid";
