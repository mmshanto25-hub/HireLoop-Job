import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { ApiClientError } from "@/lib/api";
import { applyThemeToDocument, resolveTheme, useThemeStore } from "@/stores/theme";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Do not retry client errors (4xx); they will not succeed on retry.
        retry: (failureCount, error) => {
          if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

/** Keeps <html> in sync with the saved preference, including live OS changes in "system" mode. */
function ThemeSync() {
  const preference = useThemeStore((state) => state.preference);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => applyThemeToDocument(resolveTheme(preference, media.matches));
    apply();
    if (preference !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <TooltipProvider delayDuration={300}>
        <BrowserRouter>{children}</BrowserRouter>
      </TooltipProvider>
      <Toaster position="top-right" closeButton richColors={false} />
    </QueryClientProvider>
  );
}
