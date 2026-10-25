import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@hireloop/shared";
import { Button } from "./Button";

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

/** Previous/next pagination with a status line that screen readers can follow. */
export function Pagination({ meta, onPageChange, disabled = false }: PaginationProps) {
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {from}–{to} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={disabled || !meta.hasPreviousPage}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Button>
        <span className="px-2 text-sm font-medium text-foreground">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={disabled || !meta.hasNextPage}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
