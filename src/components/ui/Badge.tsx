/**
 * Badge Component
 * Small, rounded pill for labels and status indicators
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Badge visual variant */
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  /** Additional CSS classes */
  className?: string;
  /** Badge content */
  children: React.ReactNode;
}

/**
 * Badge component for labels and status indicators
 *
 * @example
 * ```tsx
 * <Badge variant="primary">New</Badge>
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="destructive">Ended</Badge>
 * ```
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    const variants = {
      default: "bg-muted text-muted-foreground hover:bg-muted/80",
      primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
      success: "bg-success text-success-foreground hover:bg-success/80",
      warning: "bg-warning text-warning-foreground hover:bg-warning/80",
      destructive: "bg-error text-error-foreground hover:bg-error/80",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
