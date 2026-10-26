import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> {
  label?: string;
}

/** Accessible checkbox built on Radix. The visible label is rendered if provided. */
export function Checkbox({ label, id, className, ...props }: CheckboxProps) {
  const inputId = id ?? (label ? `checkbox-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <CheckboxPrimitive.Root
        id={inputId}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface",
          "transition-colors data-[state=checked]:border-brand data-[state=checked]:bg-brand",
          "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50",
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <Check className="h-3.5 w-3.5 text-brand-foreground" aria-hidden="true" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label ? (
        <label htmlFor={inputId} className="text-sm text-foreground select-none cursor-pointer">
          {label}
        </label>
      ) : null}
    </div>
  );
}
