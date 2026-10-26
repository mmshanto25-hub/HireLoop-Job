import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  Building2,
  PlusCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks";
import { useRecruiterDashboard } from "@/features/dashboard/hooks";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

export function RecruiterOverviewPage() {
  const { data: user } = useCurrentUser();
  const { data: overview, isLoading, error } = useRecruiterDashboard();

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
        <p className="font-semibold">Failed to load recruiter metrics.</p>
        <p className="mt-1 text-sm">Please refresh the page to try again.</p>
      </div>
    );
  }

  const maxTrend = Math.max(...overview.applicantTrends.map((t) => t.count), 1);

  const getCompanyTone = (st: string): BadgeTone => {
    if (st === "approved") return "success";
    if (st === "pending") return "warning";
    return "danger";
  };

  const getApplicantTone = (st: string): BadgeTone => {
    switch (st) {
      case "offered":
        return "success";
      case "shortlisted":
        return "brand";
      case "under_review":
        return "warning";
      case "applied":
        return "info";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Recruiter Hub
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your verified organization, published job openings, and candidate hiring pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/recruiter/jobs/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Post Job
            </Button>
          </Link>
          <Link to="/dashboard/recruiter/analytics">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-1.5" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Job Posts"
          value={overview.totalJobs}
          hint="All created listings"
          icon={Briefcase}
        />
        <StatCard
          label="Active Listings"
          value={overview.activeJobs}
          hint="Publicly accepting applications"
          icon={CheckCircle2}
        />
        <StatCard
          label="Total Applicants"
          value={overview.totalApplicants}
          hint="Received across all jobs"
          icon={Users}
        />
        <StatCard
          label="Closed Openings"
          value={overview.closedJobs}
          hint="Archived or filled roles"
          icon={Clock}
        />
      </div>

      {/* Middle row: Company Profile Status + 30-Day Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Status Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand" />
                Organization
              </h2>
              {overview.company ? (
                <Badge tone={getCompanyTone(overview.company.status)} size="sm">
                  {overview.company.status}
                </Badge>
              ) : (
                <Badge tone="neutral" size="sm">Not Configured</Badge>
              )}
            </div>

            {overview.company ? (
              <div className="space-y-3">
                <p className="font-semibold text-foreground text-base">{overview.company.name}</p>
                <p className="text-xs text-muted-foreground">
                  {overview.company.status === "approved"
                    ? "Your employer profile is verified. Candidates can discover your open listings."
                    : overview.company.status === "pending"
                      ? "Your profile is pending admin approval. You can draft jobs while verification finishes."
                      : "Company verification was rejected. Please review feedback and update details."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">No company profile yet</p>
                <p className="text-xs text-muted-foreground">
                  You must register an employer profile before published jobs become visible publicly.
                </p>
              </div>
            )}
          </div>

          <div className="pt-6">
            <Link to="/dashboard/recruiter/company">
              <Button variant="outline" size="sm" className="w-full">
                {overview.company ? "Manage Company Profile" : "Register Company"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 30-Day Applicant Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                30-Day Applicant Velocity
              </h2>
              <p className="text-xs text-muted-foreground">
                Daily candidate submissions over the past month
              </p>
            </div>
            <Link to="/dashboard/recruiter/analytics">
              <Button variant="outline" size="sm">
                Deep Analytics
              </Button>
            </Link>
          </div>

          {/* Accessible Bar Chart using SVG */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-end gap-1.5 h-36 w-full pt-4">
              {overview.applicantTrends.map((t) => {
                const heightPct = Math.round((t.count / maxTrend) * 100);
                return (
                  <div
                    key={t.date}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    <div className="absolute -top-7 hidden group-hover:block bg-surface-raised border border-border text-[10px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10">
                      {t.date}: <strong>{t.count}</strong>
                    </div>
                    <div
                      className="w-full bg-brand/30 hover:bg-brand rounded-t transition-all"
                      style={{ height: `${Math.max(heightPct, 6)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-1">
              <span>30 days ago</span>
              <span>15 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Candidate Applications */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Recent Candidate Applications
            </h2>
            <p className="text-xs text-muted-foreground">
              Candidates who recently applied to your open listings
            </p>
          </div>
          <Link to="/dashboard/recruiter/jobs">
            <Button variant="outline" size="sm">
              View All Openings
            </Button>
          </Link>
        </div>

        {overview.recentApplicants.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No candidate submissions yet. Publish active listings to attract job seekers.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold">Candidate</th>
                  <th className="pb-3 font-semibold">Job Title</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Applied At</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {overview.recentApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3 font-medium text-foreground">
                      <div>{app.seekerName}</div>
                      <div className="text-xs text-muted-foreground">{app.seekerEmail}</div>
                    </td>
                    <td className="py-3 text-muted-foreground">{app.jobTitle}</td>
                    <td className="py-3">
                      <Badge tone={getApplicantTone(app.status)} size="sm">
                        {app.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/dashboard/recruiter/jobs/${app.jobId}/applicants`}>
                        <Button size="sm" variant="outline">
                          Review
                          <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

