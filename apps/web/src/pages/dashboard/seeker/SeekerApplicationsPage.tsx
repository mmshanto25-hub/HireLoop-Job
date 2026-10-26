import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  DollarSign,
  AlertCircle,
  FileText,
  XCircle,
} from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  ConfirmDialog,
  Modal,
} from "@/components/ui";
import {
  useMyApplications,
  useWithdrawApplication,
} from "@/features/applications/hooks";
import type { ApplicationStatus, SeekerApplicationItem } from "@hireloop/shared";
import { cn } from "@/lib/cn";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All Applications", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Under Review", value: "under_review" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Offered", value: "offered" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

function getStatusBadgeTone(status: ApplicationStatus): "brand" | "accent" | "success" | "danger" | "neutral" {
  switch (status) {
    case "applied":
      return "brand";
    case "under_review":
      return "accent";
    case "shortlisted":
      return "brand";
    case "offered":
      return "success";
    case "rejected":
      return "danger";
    case "withdrawn":
    default:
      return "neutral";
  }
}

export function SeekerApplicationsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  const [viewingApp, setViewingApp] = useState<SeekerApplicationItem | null>(null);

  const { data, isLoading, isError, error, refetch } = useMyApplications(selectedStatus);
  const withdrawMutation = useWithdrawApplication();

  const applications = data?.items ?? [];
  const stats = data?.stats;

  const handleConfirmWithdraw = async () => {
    if (!withdrawTargetId) return;
    try {
      await withdrawMutation.mutateAsync(withdrawTargetId);
      setWithdrawTargetId(null);
    } catch {
      // Error handled by TanStack Query
    }
  };

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              My Applications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your submitted job applications, interview schedules, and recruiter decisions.
            </p>
          </div>

          <Link to="/jobs">
            <Button variant="outline" size="sm">
              <Briefcase className="mr-1.5 h-4 w-4" />
              Explore More Jobs
            </Button>
          </Link>
        </div>

        {/* Stats Strip */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground">Total</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-brand">Under Review</p>
              <p className="text-2xl font-extrabold text-brand mt-0.5">{stats.underReview}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Shortlisted</p>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                {stats.shortlisted}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Offered</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.offered}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground">Submitted</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats.applied}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-danger">Rejected</p>
              <p className="text-2xl font-extrabold text-danger mt-0.5">{stats.rejected}</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mt-8 flex overflow-x-auto border-b border-border pb-px gap-1">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? stats?.total
                : tab.value === "applied"
                ? stats?.applied
                : tab.value === "under_review"
                ? stats?.underReview
                : tab.value === "shortlisted"
                ? stats?.shortlisted
                : tab.value === "offered"
                ? stats?.offered
                : tab.value === "rejected"
                ? stats?.rejected
                : stats?.withdrawn;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedStatus(tab.value)}
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5",
                  selectedStatus === tab.value
                    ? "border-brand text-brand font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                )}
              >
                <span>{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.2 text-[10px] font-bold",
                      selectedStatus === tab.value
                        ? "bg-brand text-brand-foreground"
                        : "bg-surface-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Applications List */}
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to load applications"
              message={error?.message || "An unexpected error occurred."}
              onRetry={() => void refetch()}
            />
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications found"
              description={
                selectedStatus === "all"
                  ? "You have not submitted any job applications yet. Discover roles and take the next step in your career."
                  : `No applications with status "${selectedStatus.replace("_", " ")}".`
              }
              action={
                <Link to="/jobs">
                  <Button variant="primary">Browse Open Jobs</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-brand/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between sm:justify-start gap-3">
                      <div>
                        <Link
                          to={`/jobs/${app.jobSlug || app.jobId}`}
                          className="font-semibold text-lg text-foreground hover:text-brand transition-colors inline-flex items-center gap-1.5"
                        >
                          {app.jobTitle}
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80 flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {app.companyName}
                          </span>
                          {app.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {app.location}
                            </span>
                          )}
                          {app.isRemote && (
                            <span className="text-brand font-medium">Remote</span>
                          )}
                          {(app.salaryMin != null || app.salaryMax != null) && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <DollarSign className="h-3.5 w-3.5 text-success" />
                              {app.currency} {app.salaryMin?.toLocaleString()}
                              {app.salaryMax ? ` - ${app.salaryMax.toLocaleString()}` : ""} /{app.salaryPeriod}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interview scheduled callout */}
                    {app.interviewAt && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-950/30 px-3 py-1.5 text-xs text-purple-700 dark:text-purple-300">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="font-semibold">Interview Scheduled:</span>
                        <span>{new Date(app.interviewAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <div className="text-left sm:text-right">
                      <Badge tone={getStatusBadgeTone(app.status)} size="md">
                        {app.status.replace("_", " ")}
                      </Badge>
                      <p className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1 sm:justify-end">
                        <Clock className="h-3 w-3" />
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.coverLetter && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingApp(app)}
                          title="View submitted cover letter"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Note
                        </Button>
                      )}

                      {app.status === "applied" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWithdrawTargetId(app.id)}
                          className="text-danger hover:bg-danger-soft/20"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(withdrawTargetId)}
        onOpenChange={(open) => !open && setWithdrawTargetId(null)}
        title="Withdraw Application"
        description="Are you sure you want to withdraw this application? The hiring team will be notified, and you may not be able to reapply if the job posting has closed."
        confirmLabel="Withdraw Application"
        destructive
        loading={withdrawMutation.isPending}
        onConfirm={handleConfirmWithdraw}
      />

      {/* Cover Letter Modal */}
      {viewingApp && (
        <Modal
          open={Boolean(viewingApp)}
          onOpenChange={(open) => !open && setViewingApp(null)}
          title={`Note to ${viewingApp.companyName}`}
          description={`Submitted with your application for ${viewingApp.jobTitle}.`}
        >
          <div className="py-2 space-y-4">
            <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm whitespace-pre-line text-foreground/90">
              {viewingApp.coverLetter}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setViewingApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
