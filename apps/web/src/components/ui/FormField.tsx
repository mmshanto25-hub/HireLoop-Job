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
  error?: any;
  required?: boolean;
  className?: string;
  /** Render prop or direct children. If render prop, receives the id and ARIA attributes. */
  children: ReactNode | ((control: FieldControlProps) => ReactNode);
}

/**
 * Wraps any form control with a visible label, optional hint and an error
 * message. The error is linked with aria-describedby and announced politely.
 */
export function FormField({ label, hint, error, required, className, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const errorMessage = typeof error === "string" ? error : error?.message ? String(error.message) : undefined;
  const describedBy =
    [hint ? hintId : null, errorMessage ? errorId : null].filter(Boolean).join(" ") || undefined;

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
      {typeof children === "function"
        ? children({
            id,
            "aria-describedby": describedBy,
            "aria-invalid": Boolean(errorMessage) || undefined,
            "aria-required": required || undefined,
          })
        : children}
      {hint && !errorMessage ? (
        <p id={hintId} className="text-xs text-subtle-foreground">
          {hint}
        </p>
      ) : null}
      <ValidationMessage id={errorId} message={errorMessage} />
    </div>
  );
}

export function ValidationMessage({ id, message }: { id?: string; message?: any }) {
  if (!message) return null;
  const text = typeof message === "string" ? message : message?.message ? String(message.message) : null;
  if (!text) return null;
  return (
    <p id={id} role="alert" className="text-sm text-danger">
      {text}
    </p>
  );
}
