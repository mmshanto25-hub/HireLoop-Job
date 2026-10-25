import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const controlBase =
  "w-full rounded-md border bg-surface text-foreground placeholder:text-subtle-foreground " +
  "transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-offset-0 " +
  "disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(controlBase, "h-10 px-3 text-sm border-border-strong", className)}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        controlBase,
        "min-h-24 px-3 py-2 text-sm leading-relaxed border-border-strong",
        className,
      )}
      {...props}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(controlBase, "h-10 px-3 pr-8 text-sm border-border-strong", className)}
        {...props}
      >
        {children}
      </select>
    );
  },
);
