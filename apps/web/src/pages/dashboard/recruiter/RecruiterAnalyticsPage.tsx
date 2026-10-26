import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  Eye,
  Percent,
  Timer,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { useRecruiterAnalytics } from "@/features/dashboard/hooks";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function RecruiterAnalyticsPage() {
  const { data: analytics, isLoading, error } = useRecruiterAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-20 rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="rounded-2xl border border-danger-soft bg-danger-soft/20 p-6 text-center text-danger">
        <p className="font-semibold">Failed to load recruitment analytics.</p>
        <p className="mt-1 text-sm">Please refresh the page to try again.</p>
      </div>
    );
  }

  const { metrics, statusFunnel, jobPerformance, timeline } = analytics;
  const maxTimeline = Math.max(...timeline.map((t) => t.count), 1);
  const totalFunnel = statusFunnel.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/recruiter" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Recruitment Analytics
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Monitor candidate acquisition velocity, funnel drop-off, and listing performance.
          </p>
        </div>
        <Link to="/dashboard/recruiter/jobs">
          <Button variant="outline" size="sm">
            <Briefcase className="h-4 w-4 mr-1.5" />
            Manage Jobs
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Listing Impressions"
          value={metrics.totalViews.toLocaleString()}
          hint="Total job page views"
          icon={Eye}
        />
        <StatCard
          label="Total Candidates"
          value={metrics.totalApplicants.toLocaleString()}
          hint="Applications received"
          icon={Users}
        />
        <StatCard
          label="Application Rate"
          value={`${metrics.conversionRate}%`}
          hint="Views converted to applies"
          icon={Percent}
        />
        <StatCard
          label="Avg Time-to-Hire"
          value={metrics.avgTimeToHireDays > 0 ? `${metrics.avgTimeToHireDays}d` : "N/A"}
          hint="Applied to final offer"
          icon={Timer}
        />
      </div>

      {/* Funnel & Timeline Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Funnel */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-1">
            Candidate Pipeline Funnel
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Stage-by-stage distribution of all received applications
          </p>

          <div className="space-y-4">
            {statusFunnel.map((item) => {
              const pct = totalFunnel > 0 ? Math.round((item.count / totalFunnel) * 100) : 0;
              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">
                      {item.count} candidates ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 30-Day Timeline */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-1">
              Application Timeline (30 Days)
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Daily incoming application volume trend
            </p>

            <div className="flex items-end gap-1.5 h-44 w-full pt-4">
              {timeline.map((t) => {
                const heightPct = Math.round((t.count / maxTimeline) * 100);
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

      {/* Per-Job Performance Table */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-1">
          Job Listing Performance Breakdown
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Detailed metrics per posted position
        </p>

        {jobPerformance.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No active or archived jobs to report on yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold">Job Title</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Views</th>
                  <th className="pb-3 font-semibold text-right">Applies</th>
                  <th className="pb-3 font-semibold text-right">Conversion</th>
                  <th className="pb-3 font-semibold text-right">Shortlisted</th>
                  <th className="pb-3 font-semibold text-right">Offered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobPerformance.map((job) => (
                  <tr key={job.jobId} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3 font-medium text-foreground">
                      <Link
                        to={`/dashboard/recruiter/jobs/${job.jobId}/applicants`}
                        className="hover:text-brand transition-colors"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="py-3">
                      <Badge tone={job.status === "active" ? "success" : "neutral"} size="sm">
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{job.views}</td>
                    <td className="py-3 text-right font-medium text-foreground">{job.applications}</td>
                    <td className="py-3 text-right text-brand font-semibold">{job.conversionRate}%</td>
                    <td className="py-3 text-right text-purple-600 dark:text-purple-400 font-medium">
                      {job.shortlisted}
                    </td>
                    <td className="py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {job.offered}
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

