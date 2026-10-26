import { Link, Navigate } from "react-router-dom";
import { Briefcase, Building2, Plus, Settings, User } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

/** Sends each signed-in user to the dashboard for their role. Admin takes precedence. */
export function DashboardRedirect() {
  const { data: user, isPending } = useCurrentUser();
  if (isPending) return <Skeleton className="m-10 h-40" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.roles.includes("admin")) return <Navigate to="/dashboard/admin" replace />;
  if (user.roles.includes("recruiter")) return <Navigate to="/dashboard/recruiter" replace />;
  return <Navigate to="/dashboard/seeker" replace />;
}

export function SeekerDashboardPlaceholder() {
  const { data: user } = useCurrentUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Welcome back, {user?.fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, resume, and explore new job opportunities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/seeker/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Settings & Resume
            </Button>
          </Link>
          <Link to="/jobs">
            <Button size="sm">
              <Briefcase className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Find Jobs
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
              <User className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Candidate Profile
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Keep your skills, bio, and PDF resume updated to receive matched job recommendations.
          </p>
          <Link to="/dashboard/seeker/settings">
            <Button variant="outline" size="sm" className="w-full">
              Edit Candidate Profile
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Briefcase className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Search Open Roles
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Filter through verified tech opportunities with transparent compensation bands.
          </p>
          <Link to="/jobs">
            <Button size="sm" className="w-full">
              Browse Open Positions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RecruiterDashboardPlaceholder() {
  const { data: user } = useCurrentUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Recruiter Hub
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your verified organization and publish job listings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/recruiter/company">
            <Button variant="outline" size="sm">
              <Building2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Company Setup
            </Button>
          </Link>
          <Link to="/dashboard/recruiter/jobs/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Post Job
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Company Registration
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Submit your company name, industry, headquarters, and branding logo for verification.
          </p>
          <Link to="/dashboard/recruiter/company">
            <Button variant="outline" size="sm" className="w-full">
              Manage Company Profile
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Briefcase className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Job Listings
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Draft, publish, edit, or close job openings. Track incoming candidates.
          </p>
          <Link to="/dashboard/recruiter/jobs">
            <Button size="sm" className="w-full">
              Manage Job Listings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardPlaceholder() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Admin Moderation</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Platform user management and company review workflows. Full dashboard views expand in Phase 6.
      </p>
    </div>
  );
}
