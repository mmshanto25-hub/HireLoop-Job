import { Outlet } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";

/** Shared shell for public pages. Dashboards get their own layout in Phase 6. */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1 outline-none" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} HireLoop. All rights reserved.</p>
          <p>Phase 1 foundation build. Not yet a live service.</p>
        </div>
      </footer>
    </div>
  );
}
