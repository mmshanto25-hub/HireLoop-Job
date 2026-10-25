import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks";
import { EmptyState } from "@/components/ui";
import { Skeleton } from "@/components/ui";

/** Sends each signed-in user to the dashboard for their role. Admin takes precedence. */
export function DashboardRedirect() {
  const { data: user, isPending } = useCurrentUser();
  if (isPending) return <Skeleton className="m-10 h-40" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.roles.includes("admin")) return <Navigate to="/dashboard/admin" replace />;
  if (user.roles.includes("recruiter")) return <Navigate to="/dashboard/recruiter" replace />;
  return <Navigate to="/dashboard/seeker" replace />;
}

/*
 * Placeholders. Real dashboards arrive in Phase 6 (seeker) and Phase 4 (recruiter)
 * and Phase 7 (admin). The auth and role guards that protect them are already live.
 */
function Placeholder({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
      <div className="mt-6">
        <EmptyState title="Coming soon" description={detail} />
      </div>
    </div>
  );
}

export function SeekerDashboardPlaceholder() {
  return (
    <Placeholder
      title="Your dashboard"
      detail="Applications, saved jobs and your profile will appear here in a later release."
    />
  );
}

export function RecruiterDashboardPlaceholder() {
  return (
    <Placeholder
      title="Recruiter dashboard"
      detail="Company setup and job management arrive in a later release."
    />
  );
}

export function AdminDashboardPlaceholder() {
  return (
    <Placeholder
      title="Admin"
      detail="User management is available through the admin API. The admin console arrives in a later release."
    />
  );
}
