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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Manage Jobs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, publish, and track all job postings for {company?.name || "your company"}.
          </p>
        </div>

        {isCompanyApproved ? (
          <Link to="/dashboard/recruiter/jobs/new">
            <Button size="md" className="font-semibold shadow-sm">
              <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Post New Job
            </Button>
          </Link>
        ) : (
          <div className="rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs font-medium text-warning flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Company approval required to post jobs
          </div>
        )}
      </div>

      {actionError && (
        <div className="mb-6 rounded-lg bg-danger-soft border border-danger/30 p-4 text-sm text-danger flex items-center justify-between">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} className="text-xs font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Usage summary stats */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Active Listings</p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Draft Jobs</p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">
            {jobs?.filter((j) => j.status === "draft").length ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Closed Positions</p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">
            {jobs?.filter((j) => j.status === "closed").length ?? 0}
          </p>
        </div>
      </div>

      {/* Jobs list */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        {isPending ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="divide-y divide-border">
            {jobs.map((job) => (
              <div key={job.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading text-base font-semibold text-foreground truncate">
                      {job.title}
                    </h3>
                    <Badge
                      tone={
                        job.status === "active"
                          ? "success"
                          : job.status === "draft"
                          ? "neutral"
                          : "danger"
                      }
                      size="sm"
                      className="capitalize"
                    >
                      {job.status}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{job.category}</span>
                    <span>•</span>
                    <span className="capitalize">{job.jobType}</span>
                    <span>•</span>
                    <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                    {job.publishedAt && (
                      <>
                        <span>•</span>
                        <span>Published {new Date(job.publishedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(jobToDelete)}
        onOpenChange={(open) => !open && setJobToDelete(null)}
        title="Delete Job Listing?"
        description="Are you sure you want to permanently delete this job listing? This action cannot be undone."
        confirmLabel="Delete Listing"
        destructive
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
