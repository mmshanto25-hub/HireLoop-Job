import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: "left" | "right";
  children?: ReactNode;
  footer?: ReactNode;
}

/**
 * Side panel built on the same dialog primitive as Modal, so focus handling
 * and Escape-to-close behave identically. Used for mobile navigation and filters.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  children,
  footer,
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          className={cn(
            "fixed top-0 z-50 flex h-dvh w-[min(22rem,90vw)] flex-col border-border bg-surface-raised shadow-raised focus:outline-none",
            side === "right" ? "right-0 border-l" : "left-0 border-r",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close
              className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
          {footer ? <div className="border-t border-border p-5">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
