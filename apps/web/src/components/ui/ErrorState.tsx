import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Shown when a request fails. Offers a retry when the caller can recover. */
export function ErrorState({
  title = "Something went wrong",
  message = "We could not load this content. Please try again.",
  onRetry,
  retryLabel = "Try again",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger-soft px-6 py-10 text-center"
    >
      <AlertTriangle className="mb-3 h-8 w-8 text-danger" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
