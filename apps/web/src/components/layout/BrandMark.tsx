/** HireLoop logo mark and wordmark. Decorative icon; the link text carries the name. */
export function BrandMark({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="8" className="fill-brand" />
        <path d="M9 22V10h3v4.5h8V10h3v12h-3v-4.5h-8V22z" className="fill-accent-soft" />
      </svg>
      {showWordmark ? (
        <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
          HireLoop
        </span>
      ) : null}
    </span>
  );
}
