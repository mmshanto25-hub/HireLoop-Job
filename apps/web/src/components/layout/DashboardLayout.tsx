import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  FileCheck2,
  Bookmark,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  PlusCircle,
} from "lucide-react";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { BrandMark } from "./BrandMark";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function DashboardLayout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isAdmin = user?.roles?.includes("admin");
  const isRecruiter = user?.roles?.includes("recruiter");
  const isSeeker = user?.roles?.includes("seeker");

  const primaryRole = isAdmin ? "admin" : isRecruiter ? "recruiter" : "seeker";

  const seekerLinks = [
    { to: "/dashboard/seeker", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/seeker/applications", label: "Applications", icon: FileCheck2 },
    { to: "/dashboard/seeker/saved", label: "Saved Jobs", icon: Bookmark },
    { to: "/jobs", label: "Browse Jobs", icon: Briefcase },
    { to: "/dashboard/seeker/settings", label: "Profile & Resume", icon: Settings },
  ];

  const recruiterLinks = [
    { to: "/dashboard/recruiter", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/recruiter/jobs", label: "Job Listings", icon: Briefcase },
    { to: "/dashboard/recruiter/jobs/new", label: "Post a Job", icon: PlusCircle },
    { to: "/dashboard/recruiter/company", label: "Company Profile", icon: Building2 },
    { to: "/dashboard/recruiter/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/dashboard/recruiter/settings", label: "Settings", icon: Settings },
  ];

  const adminLinks = [
    { to: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/admin/users", label: "Users", icon: Users },
    { to: "/dashboard/admin/companies", label: "Companies", icon: Building2 },
    { to: "/dashboard/admin/jobs", label: "Job Moderation", icon: Briefcase },
    { to: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
  ];

  const currentNavLinks = isAdmin ? adminLinks : isRecruiter ? recruiterLinks : seekerLinks;

  const handleSignOut = async () => {
    await logout.mutateAsync();
    navigate("/login");
  };

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-surface transition-all duration-300 z-30 shrink-0",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <BrandMark showWordmark={!isCollapsed} />
          </Link>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar name={user?.fullName || "User"} size="md" />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{user?.fullName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge tone={isAdmin ? "danger" : isRecruiter ? "info" : "success"} size="sm">
                    {primaryRole}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {!isCollapsed ? "Dashboard" : "Menu"}
          </div>
          {currentNavLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                    isCollapsed && "justify-center px-2",
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {!isCollapsed ? "Platform" : "Links"}
          </div>
          <NavLink
            to="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors",
              isCollapsed && "justify-center px-2",
            )}
            title={isCollapsed ? "Public Home" : undefined}
          >
            <Home className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Public Home</span>}
          </NavLink>
        </nav>

        {/* Sidebar footer sign-out */}
        <div className="p-3 border-t border-border">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={logout.isPending}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
              isCollapsed && "justify-center px-2",
            )}
            title={isCollapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-surface border-r border-border p-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <BrandMark />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 border-b border-border flex items-center gap-3">
              <Avatar name={user?.fullName || "User"} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user?.fullName}</p>
                <Badge tone={isAdmin ? "danger" : isRecruiter ? "info" : "success"} size="sm">
                  {primaryRole}
                </Badge>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
              {currentNavLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand text-brand-foreground"
                          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              <div className="pt-4 border-t border-border mt-4">
                <NavLink
                  to="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                >
                  <Home className="h-4 w-4 shrink-0" />
                  <span>Public Home</span>
                </NavLink>
              </div>
            </nav>

            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="font-heading font-semibold text-foreground capitalize hidden sm:block">
              {primaryRole} Workspace
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <ThemeToggle />
            <Link
              to="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground hidden sm:block"
            >
              View Site
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
