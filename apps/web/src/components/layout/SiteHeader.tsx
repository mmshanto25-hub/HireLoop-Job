import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { Button, Drawer } from "@/components/ui";
import { ThemeToggle } from "./ThemeToggle";
import { BrandMark } from "./BrandMark";
import { NotificationDropdown } from "./NotificationDropdown";

const NAV_LINKS = [
  { to: "/jobs", label: "Find jobs" },
  { to: "/companies", label: "Companies" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/design-system", label: "Design system" },
];

export function SiteHeader() {
  const { data: user, isPending } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function signOut() {
    await logout.mutateAsync().catch(() => undefined);
    setMobileMenuOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 rounded-md" aria-label="HireLoop home">
          <BrandMark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-soft text-brand-text"
                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && <NotificationDropdown />}
          <ThemeToggle />
          {isPending ? null : user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted sm:inline-flex"
              >
                Dashboard
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                disabled={logout.isPending}
                className="hidden sm:inline-flex"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Navigation"
        description="Browse HireLoop services and account options."
        side="right"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                    isActive
                      ? "bg-brand-soft text-brand-text"
                      : "text-foreground hover:bg-surface-muted",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="px-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="text-sm font-medium text-foreground">{user.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold capitalize text-brand-text">
                    {user.roles.join(", ")}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover"
                >
                  Go to Dashboard
                </Link>
                {user.roles.includes("seeker") && (
                  <>
                    <Link
                      to="/dashboard/seeker/applications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md border border-border px-4 py-2 text-center text-sm font-medium text-foreground hover:bg-surface-muted"
                    >
                      My Applications
                    </Link>
                    <Link
                      to="/dashboard/seeker/saved"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md border border-border px-4 py-2 text-center text-sm font-medium text-foreground hover:bg-surface-muted"
                    >
                      Saved Jobs
                    </Link>
                    <Link
                      to="/dashboard/seeker/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md border border-border px-4 py-2 text-center text-sm font-medium text-foreground hover:bg-surface-muted"
                    >
                      Profile & Settings
                    </Link>
                  </>
                )}
                {user.roles.includes("recruiter") && (
                  <>
                    <Link
                      to="/dashboard/recruiter/jobs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md border border-border px-4 py-2 text-center text-sm font-medium text-foreground hover:bg-surface-muted"
                    >
                      Manage Jobs
                    </Link>
                    <Link
                      to="/dashboard/recruiter/company"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md border border-border px-4 py-2 text-center text-sm font-medium text-foreground hover:bg-surface-muted"
                    >
                      Manage Company
                    </Link>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={signOut}
                  disabled={logout.isPending}
                  className="w-full"
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover"
                >
                  Create free account
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground hover:bg-surface-muted"
                >
                  Log in
                </Link>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
}
