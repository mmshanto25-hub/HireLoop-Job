import { Link } from "react-router-dom";
import {
  Bookmark,
  Briefcase,
  FileCheck2,
  Calendar,
  Award,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks";
import { useSeekerDashboard } from "@/features/dashboard/hooks";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

export function SeekerOverviewPage() {
  const { data: user } = useCurrentUser();
  const { data: overview, isLoading, error } = useSeekerDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rounded-2xl border border-danger-soft bg-danger-soft/20 p-6 text-center text-danger">
        <p className="font-semibold">Failed to load dashboard metrics.</p>
        <p className="mt-1 text-sm">Please refresh the page to try again.</p>
      </div>
    );
  }

  const statusBadgeTone = (st: string): BadgeTone => {
    switch (st) {
      case "applied":
        return "info";
      case "under_review":
        return "warning";
      case "shortlisted":
        return "brand";
      case "offered":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your job search progress, active applications, and personalized recommendations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/jobs">
            <Button size="sm">
              <Briefcase className="h-4 w-4 mr-1.5" />
              Explore Jobs
            </Button>
          </Link>
          <Link to="/dashboard/seeker/settings">
            <Button variant="outline" size="sm">
              Edit Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Applications Sent"
          value={overview.applicationsCount}
          hint="Total submissions"
          icon={FileCheck2}
        />
        <StatCard
          label="Saved Jobs"
          value={overview.savedJobsCount}
          hint="Opportunities bookmarked"
          icon={Bookmark}
        />
        <StatCard
          label="Interviews"
          value={overview.interviewsCount}
          hint="Scheduled meetings"
          icon={Calendar}
        />
        <StatCard
          label="Offers Received"
          value={overview.offersCount}
          hint="Hiring offers"
          icon={Award}
        />
      </div>

      {/* Middle row: Profile completeness + Application Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completeness Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Profile Strength
              </h2>
              <span className="font-heading text-lg font-bold text-brand">
                {overview.profileCompleteness}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-muted rounded-full h-3 overflow-hidden mb-4">
              <div
                className="bg-brand h-full rounded-full transition-all duration-500"
                style={{ width: `${overview.profileCompleteness}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {overview.profileCompleteness >= 80
                ? "Your profile is primed for recruiters! Keep your skills and resume up-to-date."
                : "Complete your headline, bio, key skills, and upload a PDF resume to increase recruiter contact by up to 3x."}
            </p>
          </div>

          <div className="pt-6">
            <Link to="/dashboard/seeker/settings">
              <Button variant="outline" size="sm" className="w-full">
                Complete Profile
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Application Status Pipeline */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Application Pipeline
            </h2>
            <Link
              to="/dashboard/seeker/applications"
              className="text-xs font-semibold text-brand hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {[
              { key: "applied", label: "Applied", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
              { key: "under_review", label: "In Review", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
              { key: "shortlisted", label: "Shortlisted", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
              { key: "offered", label: "Offered", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
              { key: "rejected", label: "Closed", color: "bg-surface-muted text-muted-foreground border-border" },
            ].map((st) => (
              <div
                key={st.key}
                className={`p-3 rounded-xl border text-center ${st.color}`}
              >
                <div className="text-2xl font-bold font-heading">
                  {overview.statusCounts[st.key] ?? 0}
                </div>
                <div className="text-xs font-medium mt-1">{st.label}</div>
              </div>
            ))}
          </div>

          {/* Recent application items */}
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Recent Submissions
            </h3>
            {overview.recentApplications.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                You haven't submitted any job applications yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {overview.recentApplications.map((app) => (
                  <div key={app.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{app.jobTitle}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.companyName} • {app.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge tone={statusBadgeTone(app.status)} size="sm">
                        {app.status.replace("_", " ")}
                      </Badge>
                      <Link
                        to="/dashboard/seeker/applications"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="View application"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Recommended for You
            </h2>
            <p className="text-xs text-muted-foreground">
              Positions matching your skills and profile preferences
            </p>
          </div>
          <Link to="/jobs">
            <Button variant="outline" size="sm">
              Browse All
            </Button>
          </Link>
        </div>

        {overview.recommendedJobs.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No matching recommendations found at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overview.recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-border p-4 hover:border-brand/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-base font-semibold text-foreground hover:text-brand transition-colors">
                        <Link to={`/jobs/${job.slug}`}>{job.title}</Link>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {job.companyName} • {job.location}
                      </p>
                    </div>
                    <Badge tone="neutral" size="sm">
                      {job.jobType}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge tone="brand" size="sm">
                      {job.category}
                    </Badge>
                    {job.salaryMin && job.salaryMax ? (
                      <span className="text-xs text-muted-foreground">
                        ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}/yr
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Active vacancy</span>
                  <Link to={`/jobs/${job.slug}`}>
                    <Button size="sm">View details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

