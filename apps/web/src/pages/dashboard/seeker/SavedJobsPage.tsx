import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  DollarSign,
  Trash2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui";
import { useSavedJobs, useToggleSaveJob } from "@/features/saved-jobs/hooks";
import { ApplyModal } from "@/components/jobs/ApplyModal";
import type { SavedJobItem } from "@hireloop/shared";

export function SavedJobsPage() {
  const { data, isLoading, isError, error, refetch } = useSavedJobs();
  const toggleSave = useToggleSaveJob();

  const [applyingJob, setApplyingJob] = useState<SavedJobItem | null>(null);

  const items = data?.items ?? [];
  const usage = data?.usage;

  const handleRemove = (jobId: string) => {
    toggleSave.mutate({ jobId, isSaved: true });
  };

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Saved Opportunities
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep track of roles you're interested in and apply when you are ready.
            </p>
          </div>

          <Link to="/jobs">
            <Button variant="outline" size="sm">
              <Briefcase className="mr-1.5 h-4 w-4" />
              Explore More Jobs
            </Button>
          </Link>
        </div>

        {/* Plan Usage Card */}
        {usage && (
          <div className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    Saved Jobs Allowance
                  </span>
                  <Badge tone={usage.isAtLimit ? "accent" : "brand"} size="sm">
                    {usage.used} / {usage.limit} used
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {usage.isAtLimit
                    ? "You have reached your limit of 10 saved jobs on the Free plan."
                    : `You can save ${usage.limit - usage.used} more opportunities on your free account.`}
                </p>
              </div>

              {usage.isAtLimit && (
                <Link to="/pricing">
                  <Button variant="outline" size="sm" className="border-brand text-brand">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Upgrade to Save Unlimited
                  </Button>
                </Link>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-3.5 h-2 w-full rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full bg-brand transition-all duration-300"
                style={{
                  width: `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Saved Jobs List */}
        <div className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to load saved jobs"
              message={error?.message || "An unexpected error occurred."}
              onRetry={() => void refetch()}
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="No saved jobs yet"
              description="When you browse jobs, click the bookmark icon on any role to save it here for later."
              action={
                <Link to="/jobs">
                  <Button variant="primary">Browse Open Jobs</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-brand/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/jobs/${item.slug || item.jobId}`}
                            className="font-semibold text-lg text-foreground hover:text-brand transition-colors inline-flex items-center gap-1.5"
                          >
                            {item.title}
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </Link>
                          {item.isExpired ? (
                            <Badge tone="danger" size="sm">Expired</Badge>
                          ) : item.status === "closed" ? (
                            <Badge tone="neutral" size="sm">Closed</Badge>
                          ) : (
                            <Badge tone="success" size="sm">Active</Badge>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80 flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.companyName}
                          </span>
                          {(item.city || item.country) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {[item.city, item.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                          {item.isRemote && (
                            <span className="text-brand font-medium">Remote</span>
                          )}
                          {(item.salaryMin != null || item.salaryMax != null) && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <DollarSign className="h-3.5 w-3.5 text-success" />
                              {item.currency} {item.salaryMin?.toLocaleString()}
                              {item.salaryMax ? ` - ${item.salaryMax.toLocaleString()}` : ""} /{item.salaryPeriod}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-subtle-foreground">
                      <span>Saved {new Date(item.savedAt).toLocaleDateString()}</span>
                      {item.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Deadline: {new Date(item.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(item.jobId)}
                      disabled={toggleSave.isPending}
                      className="text-muted-foreground hover:text-danger hover:border-danger/30"
                      title="Remove from saved jobs"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setApplyingJob(item)}
                      disabled={item.isExpired || item.status === "closed"}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {applyingJob && (
        <ApplyModal
          open={Boolean(applyingJob)}
          onOpenChange={(open) => !open && setApplyingJob(null)}
          jobId={applyingJob.jobId}
          jobTitle={applyingJob.title}
          companyName={applyingJob.companyName}
        />
      )}
    </div>
  );
}
