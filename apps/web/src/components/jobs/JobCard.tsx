import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Globe2,
  MapPin,
} from "lucide-react";
import type { JobListItem } from "@hireloop/shared";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useSavedJobIds, useToggleSaveJob } from "@/features/saved-jobs/hooks";
import { useCurrentUser } from "@/features/auth/hooks";
import { cn } from "@/lib/cn";

export interface JobCardProps {
  job: JobListItem;
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency = "USD",
  period = "yearly",
): string | null {
  if (min == null && max == null) return null;
  const currSymbol =
    currency === "USD"
      ? "$"
      : currency === "EUR"
      ? "€"
      : currency === "GBP"
      ? "£"
      : `${currency} `;
  const periodLabel = period === "yearly" ? "/yr" : period === "monthly" ? "/mo" : "/hr";

  if (min != null && max != null) {
    if (min === max) {
      return `${currSymbol}${min.toLocaleString()} ${periodLabel}`;
    }
    return `${currSymbol}${min.toLocaleString()} - ${currSymbol}${max.toLocaleString()} ${periodLabel}`;
  }
  if (min != null) return `From ${currSymbol}${min.toLocaleString()} ${periodLabel}`;
  if (max != null) return `Up to ${currSymbol}${max.toLocaleString()} ${periodLabel}`;
  return null;
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const isSeeker = user?.roles.includes("seeker");
  const { data: savedIds = [] } = useSavedJobIds(Boolean(isSeeker));
  const toggleSave = useToggleSaveJob();

  const isSaved = savedIds.includes(job.id);
  const salaryText = formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod);
  const locationText =
    job.city && job.country
      ? `${job.city}, ${job.country}`
      : job.city || job.country || (job.isRemote ? "Remote" : "Location flexible");

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!isSeeker) return;

    toggleSave.mutate({ jobId: job.id, isSaved });
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-card transition-all hover:border-brand/40 hover:shadow-raised">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <Avatar
              src={job.companyLogoUrl}
              name={job.companyName}
              size="md"
              className="rounded-lg border border-border bg-surface-muted"
            />
            <div>
              <Link
                to={`/jobs/${job.slug || job.id}`}
                className="font-heading text-lg font-semibold text-foreground hover:text-brand transition-colors"
              >
                {job.title}
              </Link>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link
                  to={`/companies/${job.companySlug}`}
                  className="font-medium text-foreground/80 hover:text-brand hover:underline inline-flex items-center gap-1"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  {job.companyName}
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {job.isFeatured && (
              <Badge tone="accent" size="sm">
                Featured
              </Badge>
            )}

            {/* Bookmark action */}
            {(!user || isSeeker) && (
              <button
                type="button"
                onClick={handleSaveToggle}
                disabled={toggleSave.isPending}
                className={cn(
                  "rounded-md p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand",
                  isSaved
                    ? "bg-brand-soft text-brand"
                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                )}
                aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}
                title={isSaved ? "Saved" : "Save job"}
              >
                <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {locationText}
          </span>
          {job.isRemote && (
            <span className="inline-flex items-center gap-1 text-brand font-medium">
              <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
              Remote friendly
            </span>
          )}
          <span className="inline-flex items-center gap-1 capitalize">
            <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
            {job.jobType}
          </span>
          {salaryText && (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <DollarSign className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              {salaryText}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3.5">
        <span className="inline-flex items-center gap-1 text-xs text-subtle-foreground">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          {formatRelativeDate(job.publishedAt || job.createdAt)}
        </span>

        <div className="flex items-center gap-2">
          <Badge tone="neutral" size="sm">
            {job.category}
          </Badge>
          <Link
            to={`/jobs/${job.slug || job.id}`}
            className="rounded-md bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-text hover:bg-brand hover:text-brand-foreground transition-colors"
          >
            View job
          </Link>
        </div>
      </div>
    </article>
  );
}
