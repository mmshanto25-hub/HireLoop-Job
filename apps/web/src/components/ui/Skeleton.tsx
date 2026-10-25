import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Placeholder block used while data loads. Hidden from assistive technology. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-surface-muted", className)}
      {...props}
    />
  );
}

/** Loading state for a list of cards; announced once as a busy region. */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">Loading</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}
