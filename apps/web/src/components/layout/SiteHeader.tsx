import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { useSiteContent } from "@/features/cms/hooks";
import { Button, Drawer, Avatar } from "@/components/ui";
import { ThemeToggle } from "./ThemeToggle";
import { BrandMark } from "./BrandMark";
import { NotificationDropdown } from "./NotificationDropdown";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { transitions } from "@/lib/motion";

export function SiteHeader() {
  const { data: user, isPending } = useCurrentUser();
  const { content } = useSiteContent();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function signOut() {
    await logout.mutateAsync().catch(() => undefined);
    setMobileMenuOpen(false);
    navigate("/", { replace: true });
  }

  // Active navigation links sorted by order
  const activeNavLinks = (content.header.navLinks || [])
    .filter((l) => l.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      <AnnouncementBanner settings={content.announcement} />

      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75 transition-shadow">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md focus:outline-none"
            aria-label={`${content.general.siteName} home`}
          >
            <BrandMark
              siteName={content.general.siteName}
              logoUrl={content.general.logoUrl}
            />
          </Link>

          {/* Desktop Navigation with Animated Active Pill */}
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {activeNavLinks.map((link) => {
              const isCurrent = !link.isExternal && (
                location.pathname === link.path ||
                (link.path !== "/" && location.pathname.startsWith(link.path))
              );

              return link.isExternal ? (
                <a
                  key={link.id || link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.id || link.path}
                  to={link.path}
                  className={cn(
                    "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isCurrent ? "text-brand-text font-semibold" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isCurrent && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-md bg-brand-soft"
                      transition={transitions.springSmooth}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user && <NotificationDropdown />}
            <ThemeToggle />
            {isPending ? null : user ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden rounded-md px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-muted sm:inline-flex items-center gap-2 transition-colors"
                >
                  <Avatar name={user.fullName || "User"} src={user.avatarUrl} size="sm" />
                  <span>Dashboard</span>
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
                  className="hidden rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted sm:inline-flex transition-colors"
                >
                  Log in
                </Link>
                {content.header.primaryCta.visible ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to={content.header.primaryCta.path}
                      className="hidden sm:inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover transition-colors"
                    >
                      {content.header.primaryCta.label}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/signup"
                      className="hidden sm:inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover transition-colors"
                    >
                      Sign up
                    </Link>
                  </motion.div>
                )}
              </>
            )}

            {/* Mobile menu trigger */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground md:hidden cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <Drawer
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          title="Navigation"
          description={`Browse ${content.general.siteName} services and account options.`}
          side="right"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              {activeNavLinks.map((link) =>
                link.isExternal ? (
                  <a
                    key={link.id || link.path}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-surface-muted"
                  >
                    {link.label}
                  </a>
                ) : (
                  <NavLink
                    key={link.id || link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                        isActive
                          ? "bg-brand-soft text-brand-text font-semibold"
                          : "text-foreground hover:bg-surface-muted",
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ),
              )}
            </div>

            <div className="border-t border-border pt-4">
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="px-3 flex items-center gap-3">
                    <Avatar name={user.fullName || "User"} src={user.avatarUrl} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{user.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold capitalize text-brand-text">
                        {user.roles.join(", ")}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover"
                  >
                    Go to Dashboard
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      void signOut();
                    }}
                    className="w-full"
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md border border-border px-4 py-2.5 text-center text-sm font-semibold text-foreground hover:bg-surface-muted"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Drawer>
      </header>
    </>
  );
}
