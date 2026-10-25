import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/cn";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
  "children"
> {
  /** Accessible name for the whole group, announced by screen readers. */
  label: string;
  options: RadioOption[];
}

/** Radio group with keyboard arrow navigation provided by Radix. */
export function RadioGroup({ label, options, className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root aria-label={label} className={cn("grid gap-2", className)} {...props}>
      {options.map((option) => {
        const id = `radio-${props.name ?? "group"}-${option.value}`;
        return (
          <div
            key={option.value}
            className="flex items-start gap-3 rounded-md border border-border bg-surface p-3 has-[[data-state=checked]]:border-brand has-[[data-state=checked]]:bg-brand-soft"
          >
            <RadioGroupPrimitive.Item
              id={id}
              value={option.value}
              disabled={option.disabled}
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface data-[state=checked]:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
            >
              <RadioGroupPrimitive.Indicator className="h-2.5 w-2.5 rounded-full bg-brand" />
            </RadioGroupPrimitive.Item>
            <label htmlFor={id} className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{option.label}</span>
              {option.description ? (
                <span className="text-xs text-muted-foreground">{option.description}</span>
              ) : null}
            </label>
          </div>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
