import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
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
import { Modal } from "@/components/ui/Modal";
import { JobCard } from "@/components/jobs/JobCard";
import { useJob, useSimilarJobs } from "@/features/jobs/hooks";
import { useCurrentUser } from "@/features/auth/hooks";

export function JobDetailsPage() {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: job, isPending, isError, error, refetch } = useJob(slugOrId);
  const { data: similarJobs } = useSimilarJobs(slugOrId);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  function handleApplyClick() {
    if (!user) {
      // Redirect to login with return destination
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/login?next=${returnUrl}`);
      return;
    }
    setApplyModalOpen(true);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="h-44 rounded-xl border border-border bg-surface p-8 space-y-4">
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

            {/* Apply CTA */}
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                size="lg"
                onClick={handleApplyClick}
                disabled={!canApply}
                className="w-full sm:w-auto font-semibold shadow-sm"
              >
                {isClosed ? "Job Closed" : isPastDeadline ? "Deadline Passed" : "Apply Now"}
              </Button>
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
                {job.city && job.country ? `${job.city}, ${job.country}` : job.city || job.country || "Location not specified"}
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
            {/* Description */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
              <h2 className="font-heading text-xl font-bold text-foreground">About the Role</h2>
              <div className="mt-4 prose prose-neutral dark:prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>

              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="font-heading text-lg font-semibold text-foreground">Responsibilities</h3>
                  <div className="mt-3 text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                    {job.responsibilities}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && (
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="font-heading text-lg font-semibold text-foreground">Requirements & Qualifications</h3>
                  <div className="mt-3 text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="font-heading text-lg font-semibold text-foreground">Perks & Benefits</h3>
                  <div className="mt-3 text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                    {job.benefits}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Required Skills */}
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
                <Avatar src={job.companyLogoUrl} name={job.companyName} size="md" className="rounded-lg" />
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

      {/* Apply Modal */}
      <Modal
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        title={`Apply for ${job.title}`}
        description={`Submit your application to the hiring team at ${job.companyName}.`}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Applications workflow is connecting in Phase 4. Your profile and uploaded resume will be submitted directly to {job.companyName}.
          </p>
          <div className="rounded-lg border border-brand/20 bg-brand-soft/50 p-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-brand-text">
                <p className="font-semibold">Profile check complete</p>
                <p className="mt-0.5">Signed in as {user?.fullName} ({user?.email})</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setApplyModalOpen(false)}>
              Ready for Phase 4 Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

