import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DropdownItem {
  label: string;
  onSelect: () => void;
  icon?: LucideIcon;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  label: string;
  items: DropdownItem[];
  align?: "start" | "center" | "end";
}

/** Keyboard-navigable menu. Radix provides arrow-key movement and typeahead. */
export function Dropdown({ trigger, label, items, align = "end" }: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild aria-label={label}>
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={8}
          className="z-50 min-w-48 rounded-lg border border-border bg-surface-raised p-1.5 shadow-raised"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenu.Item
                key={item.label}
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm outline-none",
                  "data-[highlighted]:bg-surface-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
                  item.destructive ? "text-danger" : "text-foreground",
                )}
              >
                {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                {item.label}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
