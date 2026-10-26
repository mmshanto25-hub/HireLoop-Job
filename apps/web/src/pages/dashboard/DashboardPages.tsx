import { Link, Navigate } from "react-router-dom";
import {
  Bookmark,
  Briefcase,
  Building2,
  FileCheck2,
  Plus,
  Settings,
  User,
  Users,
} from "lucide-react";
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
            Manage your applications, saved opportunities, and career profile.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/seeker/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Settings
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
                <FileCheck2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                My Applications
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Track status updates, recruiter responses, and interview schedules in real time.
            </p>
          </div>
          <Link to="/dashboard/seeker/applications">
            <Button variant="outline" size="sm" className="w-full">
              View Applications
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Bookmark className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Saved Jobs
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Review bookmarked positions and submit your application when you're ready.
            </p>
          </div>
          <Link to="/dashboard/seeker/saved">
            <Button variant="outline" size="sm" className="w-full">
              View Saved Jobs
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-foreground">
                <User className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Profile & Resume
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Keep your headline, skills, and PDF resume up to date for instant 1-click applies.
            </p>
          </div>
          <Link to="/dashboard/seeker/settings">
            <Button variant="outline" size="sm" className="w-full">
              Edit Profile
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
            Manage your verified organization, job listings, and candidate applications.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
                <Briefcase className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Job Listings
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Draft, publish, edit, or close job openings. Monitor active listings quota.
            </p>
          </div>
          <Link to="/dashboard/recruiter/jobs">
            <Button size="sm" className="w-full">
              Manage Job Listings
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Company Profile
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Submit your company name, industry, headquarters, and branding logo for verification.
            </p>
          </div>
          <Link to="/dashboard/recruiter/company">
            <Button variant="outline" size="sm" className="w-full">
              Manage Company Profile
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Users className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Candidate Pipeline
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Review submitted applications, download resumes, and schedule candidate interviews.
            </p>
          </div>
          <Link to="/dashboard/recruiter/jobs">
            <Button variant="outline" size="sm" className="w-full">
              Review Applicants
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
