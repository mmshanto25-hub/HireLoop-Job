import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "@hireloop/shared";
import { useCurrentUser } from "@/features/auth/hooks";
import { Skeleton } from "@/components/ui";

function LoadingGate() {
  return (
    <div
      className="mx-auto max-w-5xl space-y-4 px-4 py-10"
      aria-busy="true"
      aria-label="Checking your session"
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

/**
 * Route guard. Signed-out visitors go to /login and come back to this page
 * afterwards (via the next parameter). The API still enforces every check;
 * this only controls what the browser shows.
 */
export function RequireAuth() {
  const { data: user, isPending } = useCurrentUser();
  const location = useLocation();

  if (isPending) return <LoadingGate />;
  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return <Outlet />;
}

/** Must be nested inside RequireAuth. Forbidden users are sent to their own dashboard. */
export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { data: user } = useCurrentUser();
  if (!user) return null;
  if (!roles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
