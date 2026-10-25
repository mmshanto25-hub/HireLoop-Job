import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  /** Milliseconds to wait after typing before onChange fires. */
  debounceMs?: number;
  className?: string;
}

/**
 * Text search with debounced updates. The input keeps local state so typing
 * stays responsive while the parent (and any API request) updates less often.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  label = "Search",
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => onChange(draft.trim()), debounceMs);
    return () => window.clearTimeout(timer);
  }, [draft, value, onChange, debounceMs]);

  return (
    <div className={cn("relative", className)}>
      <label htmlFor="hl-search" className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
        aria-hidden="true"
      />
      <input
        id="hl-search"
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-border-strong bg-surface pl-9 pr-9 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-2 focus-visible:outline-offset-0"
      />
      {draft ? (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onChange("");
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-subtle-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
