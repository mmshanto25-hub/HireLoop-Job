import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiClientError } from "@/lib/api";

/**
 * Copies field-level errors from the API onto the form. Anything that is not
 * tied to a field is returned as a message for the form's top-level alert.
 */
export function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
): string {
  if (!(err instanceof ApiClientError)) {
    return "Something went wrong. Please try again.";
  }
  for (const detail of err.details ?? []) {
    const field = detail.field as Path<T> | undefined;
    if (field) setError(field, { type: "server", message: detail.message });
  }
  return err.message;
}

/** Keeps only internal, same-origin paths so `next` cannot redirect off the site. */
export function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/dashboard";
  }
  return value;
}
