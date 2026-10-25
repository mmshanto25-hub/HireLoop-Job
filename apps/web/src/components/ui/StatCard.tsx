import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./Skeleton";

export interface StatCardProps {
  label: string;
  value: string | number | undefined;
  icon?: LucideIcon;
  hint?: string;
  loading?: boolean;
  className?: string;
}

/**
 * A single headline metric. `value` must come from persisted data; pass
 * undefined while loading so no placeholder number is ever shown.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  loading = false,
  className,
}: StatCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-5 shadow-card", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-soft text-brand-text">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {loading || value === undefined ? (
        <Skeleton className="mt-3 h-8 w-24" />
      ) : (
        <p className="mt-2 font-heading text-3xl font-semibold text-foreground tabular-nums">
          {value}
        </p>
      )}
      {hint ? <p className="mt-1 text-xs text-subtle-foreground">{hint}</p> : null}
    </div>
  );
}
