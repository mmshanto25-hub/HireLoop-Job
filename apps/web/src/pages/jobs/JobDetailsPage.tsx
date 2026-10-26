import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Globe2,
  MapPin,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { JobCard } from "@/components/jobs/JobCard";
import { ApplyModal } from "@/components/jobs/ApplyModal";
import { useJob, useSimilarJobs } from "@/features/jobs/hooks";
import { useCurrentUser } from "@/features/auth/hooks";
import { useSavedJobIds, useToggleSaveJob } from "@/features/saved-jobs/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/cn";

export function JobDetailsPage() {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const isSeeker = user?.roles.includes("seeker");
  const { data: job, isPending, isError, error, refetch } = useJob(slugOrId);
  const { data: similarJobs } = useSimilarJobs(slugOrId);

  useDocumentTitle(
    job ? `${job.title} at ${job.companyName}` : "Job Details",
    job ? `${job.title} vacancy in ${job.city || "Remote"}. Apply now on HireLoop.` : undefined,
  );
  const { data: savedIds = [] } = useSavedJobIds(Boolean(isSeeker));
  const toggleSave = useToggleSaveJob();

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isSaved = job ? savedIds.includes(job.id) : false;

  function handleApplyClick() {
    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/login?returnTo=${returnUrl}`);
      return;
    }
    setApplyModalOpen(true);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this ${job?.title} opportunity at ${job?.companyName} on HireLoop`,
        url: window.location.href,
      }).catch(() => undefined);
    } else {
      void navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  const handleSaveToggle = () => {
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!job || !isSeeker) return;
    toggleSave.mutate({ jobId: job.id, isSaved });
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="rounded-2xl border border-border bg-surface p-8">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-5 w-1/4" />
            </div>
          </div>
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <ErrorState
          title="Job not found"
          message={error?.message || "This job is no longer available or was closed."}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const isClosed = job.status === "closed";
  const isPastDeadline = job.deadline && new Date(job.deadline) < new Date();
  const canApply = !isClosed && !isPastDeadline;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Schema.org JobPosting Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            title: job.title,
            description: job.description,
            datePosted: job.publishedAt,
            validThrough: job.deadline,
            employmentType: job.jobType.toUpperCase().replace("-", "_"),
            hiringOrganization: {
              "@type": "Organization",
              name: job.companyName,
            },
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: job.city || "Remote",
                addressCountry: job.country || "Global",
              },
            },
            baseSalary:
              job.salaryMin && job.salaryMax
                ? {
                    "@type": "MonetaryAmount",
                    currency: job.currency || "USD",
                    value: {
                      "@type": "QuantitativeValue",
                      minValue: job.salaryMin,
                      maxValue: job.salaryMax,
                      unitText: "YEAR",
                    },
                  }
                : undefined,
          }),
        }}
      />

      {/* Top Breadcrumb */}
      <div className="border-b border-border bg-surface py-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex items-center justify-between">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to all jobs
          </Link>

          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            {copiedLink ? "Link copied!" : "Share job"}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Main Header Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <Avatar
                src={job.companyLogoUrl}
                name={job.companyName}
                size="xl"
                className="rounded-2xl border border-border bg-surface-muted"
              />
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                  {job.title}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-base text-muted-foreground">
                  <Link
                    to={`/companies/${job.companySlug}`}
                    className="font-medium text-foreground hover:text-brand hover:underline inline-flex items-center gap-1.5"
                  >
                    <Building2 className="h-4 w-4 text-brand" aria-hidden="true" />
                    {job.companyName}
                  </Link>
                  <span>•</span>
                  <span>{job.category}</span>
                </div>
              </div>
            </div>

            {/* Apply & Save Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2">
                {(!user || isSeeker) && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleSaveToggle}
                    disabled={toggleSave.isPending}
                    className={cn(isSaved && "text-brand border-brand")}
                    aria-label={isSaved ? "Saved" : "Save job"}
                  >
                    <Bookmark className={cn("h-4 w-4 mr-1.5", isSaved && "fill-current")} />
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                )}
                <Button
                  size="lg"
                  onClick={handleApplyClick}
                  disabled={!canApply}
                  className="font-semibold shadow-sm flex-1 sm:flex-initial"
                >
                  {isClosed ? "Job Closed" : isPastDeadline ? "Deadline Passed" : "Apply Now"}
                </Button>
              </div>
              {job.deadline && (
                <span className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Key tags strip */}
          <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 border-t border-border pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>
                {job.city && job.country
                  ? `${job.city}, ${job.country}`
                  : job.city || job.country || "Location not specified"}
              </span>
            </div>

            {job.isRemote && (
              <div className="flex items-center gap-1.5 text-brand font-medium">
                <Globe2 className="h-4 w-4" aria-hidden="true" />
                <span>Remote position</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 capitalize">
              <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>{job.jobType}</span>
            </div>

            {(job.salaryMin != null || job.salaryMax != null) && (
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <DollarSign className="h-4 w-4 text-success" aria-hidden="true" />
                <span>
                  {job.currency} {job.salaryMin?.toLocaleString()}
                  {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : ""} /{job.salaryPeriod}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-subtle-foreground ml-auto">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              Posted {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString() : "recently"}
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
              <h2 className="font-heading text-xl font-bold text-foreground">About the Role</h2>
              <div className="mt-4 prose prose-neutral dark:prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>
            </div>

            {job.responsibilities && (
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
                <h2 className="font-heading text-xl font-bold text-foreground">Responsibilities</h2>
                <div className="mt-4 prose prose-neutral dark:prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                  {job.responsibilities}
                </div>
              </div>
            )}

            {job.requirements && (
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Requirements & Qualifications
                </h2>
                <div className="mt-4 prose prose-neutral dark:prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            )}

            {job.benefits && (
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Benefits & Perks
                </h2>
                <div className="mt-4 prose prose-neutral dark:prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                  {job.benefits}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Skills Card */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" aria-hidden="true" />
                Required Skills
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} tone="brand" size="md">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Company Card summary */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <h3 className="font-heading text-base font-semibold text-foreground">Company Overview</h3>
              <div className="mt-4 flex items-center gap-3">
                <Avatar
                  src={job.companyLogoUrl}
                  name={job.companyName}
                  size="md"
                  className="rounded-lg"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{job.companyName}</h4>
                  <Link
                    to={`/companies/${job.companySlug}`}
                    className="text-xs text-brand hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    View company profile
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs Section */}
        {similarJobs && similarJobs.length > 0 && (
          <div className="mt-16 border-t border-border pt-12">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
              Similar Job Opportunities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {similarJobs.map((sim) => (
                <JobCard key={sim.id} job={sim} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real Phase 4 Application Modal */}
      <ApplyModal
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.companyName}
      />
    </div>
  );
}
