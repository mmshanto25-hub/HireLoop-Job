import { Link, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { Button } from "@/components/ui";
import { ThemeToggle } from "./ThemeToggle";
import { BrandMark } from "./BrandMark";

const NAV_LINKS = [
  { to: "/jobs", label: "Find jobs" },
  { to: "/companies", label: "Companies" },
  { to: "/pricing", label: "Pricing" },
  { to: "/design-system", label: "Design system" },
];

export function SiteHeader() {
  const { data: user, isPending } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();

  async function signOut() {
    await logout.mutateAsync().catch(() => undefined);
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
          <ThemeToggle />
          {isPending ? null : user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted sm:inline-flex"
              >
                Dashboard
              </Link>
              <Button variant="outline" size="sm" onClick={signOut} disabled={logout.isPending}>
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
                className="inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
