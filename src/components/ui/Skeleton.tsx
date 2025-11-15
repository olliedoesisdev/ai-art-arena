/**
 * Skeleton Component
 * Loading placeholders for content
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Generic skeleton loading placeholder
 *
 * @example
 * ```tsx
 * <Skeleton className="h-12 w-12 rounded-full" />
 * <Skeleton className="h-4 w-[250px]" />
 * ```
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

export interface ArtworkSkeletonProps {
  /** Additional CSS classes for container */
  className?: string;
}

/**
 * Skeleton placeholder for artwork card
 * Matches ArtworkCard component structure
 *
 * @example
 * ```tsx
 * <ArtworkSkeleton />
 * ```
 */
const ArtworkSkeleton = React.forwardRef<HTMLDivElement, ArtworkSkeletonProps>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-border bg-card p-4 shadow-sm",
          className
        )}
      >
        {/* Image skeleton */}
        <Skeleton className="aspect-square w-full rounded-md" />

        {/* Title skeleton */}
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Vote count skeleton */}
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    );
  }
);
ArtworkSkeleton.displayName = "ArtworkSkeleton";

export interface ContestGridSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Additional CSS classes for grid container */
  className?: string;
}

/**
 * Skeleton placeholder for contest grid with 6 artworks
 * Matches ContestGrid component structure
 *
 * @example
 * ```tsx
 * <ContestGridSkeleton />
 * <ContestGridSkeleton count={3} />
 * ```
 */
const ContestGridSkeleton = React.forwardRef<HTMLDivElement, ContestGridSkeletonProps>(
  ({ count = 6, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
          className
        )}
      >
        {Array.from({ length: count }).map((_, i) => (
          <ArtworkSkeleton key={i} />
        ))}
      </div>
    );
  }
);
ContestGridSkeleton.displayName = "ContestGridSkeleton";

export interface TextSkeletonProps {
  /** Number of lines */
  lines?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton placeholder for text blocks
 *
 * @example
 * ```tsx
 * <TextSkeleton lines={3} />
 * ```
 */
const TextSkeleton = React.forwardRef<HTMLDivElement, TextSkeletonProps>(
  ({ lines = 3, className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    );
  }
);
TextSkeleton.displayName = "TextSkeleton";

export interface ImageSkeletonProps {
  /** Aspect ratio (e.g., "square", "video", "portrait") */
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton placeholder for images with common aspect ratios
 *
 * @example
 * ```tsx
 * <ImageSkeleton aspectRatio="square" />
 * <ImageSkeleton aspectRatio="video" />
 * ```
 */
const ImageSkeleton = React.forwardRef<HTMLDivElement, ImageSkeletonProps>(
  ({ aspectRatio = "square", className }, ref) => {
    const aspectRatios = {
      square: "aspect-square",
      video: "aspect-video",
      portrait: "aspect-[3/4]",
      landscape: "aspect-[4/3]",
    };

    return (
      <Skeleton
        ref={ref}
        className={cn("w-full rounded-md", aspectRatios[aspectRatio], className)}
      />
    );
  }
);
ImageSkeleton.displayName = "ImageSkeleton";

export {
  Skeleton,
  ArtworkSkeleton,
  ContestGridSkeleton,
  TextSkeleton,
  ImageSkeleton,
};
