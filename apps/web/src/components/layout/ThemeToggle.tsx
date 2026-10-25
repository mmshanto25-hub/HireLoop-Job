import { Monitor, Moon, Sun } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";
import { useThemeStore, type ThemePreference } from "@/stores/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Lets the user choose light, dark or system theme. The choice persists across visits. */
export function ThemeToggle() {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const current = OPTIONS.find((option) => option.value === preference) ?? OPTIONS[2]!;
  const Icon = current.icon;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        aria-label={`Theme: ${current.label}. Change theme`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-40 rounded-lg border border-border bg-surface-raised p-1.5 shadow-raised"
        >
          <DropdownMenu.Label className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-subtle-foreground">
            Theme
          </DropdownMenu.Label>
          {OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            const selected = option.value === preference;
            return (
              <DropdownMenu.Item
                key={option.value}
                onSelect={() => setPreference(option.value)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-surface-muted",
                  selected ? "font-semibold text-brand-text" : "text-foreground",
                )}
              >
                <OptionIcon className="h-4 w-4" aria-hidden="true" />
                {option.label}
                {selected ? <span className="sr-only">(selected)</span> : null}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
