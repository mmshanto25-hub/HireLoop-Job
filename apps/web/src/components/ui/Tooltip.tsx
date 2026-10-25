import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

export const TooltipProvider = TooltipPrimitive.Provider;

export interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * Supplementary hint only. Never put essential information in a tooltip,
 * because keyboard and touch users may not reach it.
 */
export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-card"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
