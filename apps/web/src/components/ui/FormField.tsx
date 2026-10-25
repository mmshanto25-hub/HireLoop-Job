import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

export interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Render prop: the control receives the id and ARIA attributes it needs. */
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Wraps any form control with a visible label, optional hint and an error
 * message. The error is linked with aria-describedby and announced politely.
 */
export function FormField({ label, hint, error, required, className, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        ) : null}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-subtle-foreground">
          {hint}
        </p>
      ) : null}
      <ValidationMessage id={errorId} message={error} />
    </div>
  );
}

export function ValidationMessage({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-danger">
      {message}
    </p>
  );
}
