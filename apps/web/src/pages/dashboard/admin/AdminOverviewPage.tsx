import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Briefcase,
  DollarSign,
  Check,
  X,
} from "lucide-react";
import { useAdminOverview, useReviewCompany } from "@/features/admin/hooks";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

export function AdminOverviewPage() {
  const { data: overview, isLoading, error } = useAdminOverview();
  const reviewMutation = useReviewCompany();

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

  if (error || !overview) {
    return (
      <div className="rounded-2xl border border-danger-soft bg-danger-soft/20 p-6 text-center text-danger">
        <p className="font-semibold">Failed to load platform overview metrics.</p>
        <p className="mt-1 text-sm">Please refresh the page to try again.</p>
      </div>
    );
  }

  const maxReg = Math.max(...overview.registrationTrends.map((t) => t.count), 1);
  const maxCategory = Math.max(...overview.jobsByCategory.map((c) => c.count), 1);

  const getRoleTone = (r: string): BadgeTone => {
    if (r === "admin") return "danger";
    if (r === "recruiter") return "info";
    return "success";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Platform Administration
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor platform metrics, moderate companies, oversee users, and manage listings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/admin/users">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-1.5" />
              Manage Users
            </Button>
          </Link>
          <Link to="/dashboard/admin/companies">
            <Button size="sm">
              <Building2 className="h-4 w-4 mr-1.5" />
              Review Companies ({overview.pendingCompanies})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Registered Users"
          value={overview.totalUsers.toLocaleString()}
          hint={`${overview.totalSeekers} seekers • ${overview.totalRecruiters} recruiters`}
          icon={Users}
        />
        <StatCard
          label="Registered Companies"
          value={overview.totalCompanies.toLocaleString()}
          hint={`${overview.pendingCompanies} awaiting review`}
          icon={Building2}
        />
        <StatCard
          label="Total Job Listings"
          value={overview.totalJobs.toLocaleString()}
          hint={`${overview.activeJobs} active • ${overview.totalApplications} applies`}
          icon={Briefcase}
        />
        <StatCard
          label="Platform Revenue"
          value={`$${(overview.revenueSummary.totalRevenueCents / 100).toFixed(0)}`}
          hint={`${overview.revenueSummary.activeSubscriptions} active subscriptions`}
          icon={DollarSign}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-1">
              User Registrations (Last 30 Days)
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              New user signup velocity across the platform
            </p>

            <div className="flex items-end gap-1.5 h-44 w-full pt-4">
              {overview.registrationTrends.map((t) => {
                const heightPct = Math.round((t.count / maxReg) * 100);
                return (
                  <div
                    key={t.date}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    <div className="absolute -top-7 hidden group-hover:block bg-surface-raised border border-border text-[10px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10">
                      {t.date}: <strong>{t.count}</strong>
                    </div>
                    <div
                      className="w-full bg-brand/40 hover:bg-brand rounded-t transition-all"
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

        {/* Jobs by Category */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-1">
            Active Jobs by Category
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Distribution of active listings across market sectors
          </p>

          <div className="space-y-3.5">
            {overview.jobsByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No active jobs yet.</p>
            ) : (
              overview.jobsByCategory.map((cat) => {
                const pct = Math.round((cat.count / maxCategory) * 100);
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-foreground">{cat.category}</span>
                      <span className="text-muted-foreground">{cat.count} listings</span>
                    </div>
                    <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Moderation Queue & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Companies Queue */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Company Review Queue
              </h2>
              <p className="text-xs text-muted-foreground">
                Organizations waiting for moderation approval
              </p>
            </div>
            <Link to="/dashboard/admin/companies">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {overview.pendingCompaniesQueue.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No pending companies waiting for review. 🎉
            </div>
          ) : (
            <div className="divide-y divide-border">
              {overview.pendingCompaniesQueue.map((comp) => (
                <div key={comp.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{comp.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {comp.industry} • Submitted {new Date(comp.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 hover:bg-emerald-500/10 h-8 px-2.5"
                      onClick={() => reviewMutation.mutate({ companyId: comp.id, status: "approved" })}
                      disabled={reviewMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 h-8 px-2.5"
                      onClick={() => reviewMutation.mutate({ companyId: comp.id, status: "rejected", rejectionReason: "Information could not be verified." })}
                      disabled={reviewMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Recently Registered Users
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest signups across all roles
              </p>
            </div>
            <Link to="/dashboard/admin/users">
              <Button variant="outline" size="sm">
                Manage Users
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-border">
            {overview.recentUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{u.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {u.roles.map((r) => (
                    <Badge
                      key={r}
                      tone={getRoleTone(r)}
                      size="sm"
                    >
                      {r}
                    </Badge>
                  ))}
                  <Badge tone={u.status === "active" ? "success" : "neutral"} size="sm">
                    {u.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

