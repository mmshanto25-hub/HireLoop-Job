import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Archive,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  MoreVertical,
  Play,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useRecruiterJobs,
  usePublishJob,
  useCloseJob,
  useReopenJob,
  useDeleteJob,
} from "@/features/jobs/hooks";
import { useMyCompany } from "@/features/companies/hooks";

export function ManageJobsPage() {
  const { data: jobs, isPending, refetch } = useRecruiterJobs();
  const { data: company } = useMyCompany();

  const publishMutation = usePublishJob();
  const closeMutation = useCloseJob();
  const reopenMutation = useReopenJob();
  const deleteMutation = useDeleteJob();

  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isCompanyApproved = company?.status === "approved";
  const activeCount = jobs?.filter((j) => j.status === "active").length ?? 0;

  async function handlePublish(id: string) {
    setActionError(null);
    try {
      await publishMutation.mutateAsync(id);
    } catch (err: any) {
      setActionError(err.message || "Failed to publish job");
    }
  }

  async function handleClose(id: string) {
    setActionError(null);
    try {
      await closeMutation.mutateAsync(id);
    } catch (err: any) {
      setActionError(err.message || "Failed to close job");
    }
  }

  async function handleReopen(id: string) {
    setActionError(null);
    try {
      await reopenMutation.mutateAsync(id);
    } catch (err: any) {
      setActionError(err.message || "Failed to reopen job");
    }
  }

  async function handleDeleteConfirm() {
    if (!jobToDelete) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(jobToDelete);
      setJobToDelete(null);
    } catch (err: any) {
      setActionError(err.message || "Failed to delete job");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Job Listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your open, draft, and closed positions.
          </p>
        </div>

        <Link to="/dashboard/recruiter/jobs/new">
          <Button disabled={!isCompanyApproved} title={!isCompanyApproved ? "Company approval required" : undefined}>
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Company Verification Banner */}
      {!isCompanyApproved && (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                Company approval required to publish jobs
              </h3>
              <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                You can create drafts, but your company profile must be approved by an administrator before listings can be published publicly.
              </p>
              <div className="mt-2">
                <Link
                  to="/dashboard/recruiter/company"
                  className="font-medium text-amber-800 dark:text-amber-200 underline hover:no-underline"
                >
                  View company status &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action error banner */}
      {actionError && (
        <div className="mt-4 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Plan quota info */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Briefcase className="h-5 w-5 text-brand" aria-hidden="true" />
          <div className="text-sm">
            <span className="font-semibold text-foreground">Active Listings: </span>
            <span className="text-muted-foreground">{activeCount} / 3 on Free tier</span>
          </div>
        </div>

        <Link
          to="/pricing"
          className="text-xs font-semibold text-brand hover:underline"
        >
          Upgrade for higher limits &rarr;
        </Link>
      </div>

      {/* Jobs List */}
      <div className="mt-6 rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        {isPending ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="divide-y divide-border">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-surface-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-base text-foreground">
                      {job.title}
                    </span>
                    <Badge
                      tone={
                        job.status === "active"
                          ? "success"
                          : job.status === "closed"
                          ? "neutral"
                          : "accent"
                      }
                      size="sm"
                    >
                      {job.status}
                    </Badge>
                    {job.isFeatured && (
                      <Badge tone="brand" size="sm">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{job.category}</span>
                    <span>•</span>
                    <span className="capitalize">{job.jobType}</span>
                    <span>•</span>
                    <span>
                      {job.city || job.country
                        ? `${job.city || ""}, ${job.country || ""}`
                        : "Remote"}
                    </span>
                    {job.publishedAt && (
                      <>
                        <span>•</span>
                        <span>
                          Published {new Date(job.publishedAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/dashboard/recruiter/jobs/${job.id}/applicants`}>
                    <Button size="sm" variant="outline">
                      <Users className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Applicants
                    </Button>
                  </Link>

                  {job.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(job.id)}
                      disabled={!isCompanyApproved || publishMutation.isPending}
                    >
                      <Play className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Publish
                    </Button>
                  )}

                  {job.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClose(job.id)}
                      disabled={closeMutation.isPending}
                    >
                      <Archive className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Close
                    </Button>
                  )}

                  {job.status === "closed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReopen(job.id)}
                      disabled={!isCompanyApproved || reopenMutation.isPending}
                    >
                      <Play className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Reopen
                    </Button>
                  )}

                  <Link to={`/dashboard/recruiter/jobs/${job.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </Link>

                  <Link to={`/jobs/${job.slug || job.id}`} target="_blank">
                    <Button size="sm" variant="ghost" title="View Public Post">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setJobToDelete(job.id)}
                    className="p-2 text-muted-foreground hover:text-danger rounded-md hover:bg-danger-soft transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12">
            <EmptyState
              title="No jobs created yet"
              description="Post your first open position to start attracting top qualified talent."
              action={
                isCompanyApproved ? (
                  <Link to="/dashboard/recruiter/jobs/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      Create Job Listing
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard/recruiter/company">
                    <Button variant="outline">Complete Company Registration</Button>
                  </Link>
                )
              }
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(jobToDelete)}
        onOpenChange={(open) => !open && setJobToDelete(null)}
        title="Delete Job Listing"
        description="Are you sure you want to permanently delete this job listing? This action cannot be undone."
        confirmLabel="Delete Job"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
