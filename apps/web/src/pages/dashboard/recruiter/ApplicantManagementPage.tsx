import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  FormField,
  Modal,
  Skeleton,
  Avatar,
} from "@/components/ui";
import {
  useJobApplicants,
  useUpdateApplicationStatus,
} from "@/features/applications/hooks";
import type { ApplicationStatus, RecruiterApplicantItem } from "@hireloop/shared";
import { cn } from "@/lib/cn";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All Applicants", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Under Review", value: "under_review" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Offered", value: "offered" },
  { label: "Rejected", value: "rejected" },
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

export function ApplicantManagementPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeApplicant, setActiveApplicant] = useState<RecruiterApplicantItem | null>(null);
  const [coverLetterApplicant, setCoverLetterApplicant] = useState<RecruiterApplicantItem | null>(null);

  // Form state for status update modal
  const [targetStatus, setTargetStatus] = useState<"under_review" | "shortlisted" | "rejected" | "offered">("under_review");
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [recruiterNotes, setRecruiterNotes] = useState<string>("");

  const { data, isLoading, isError, error, refetch } = useJobApplicants(
    jobId ?? "",
    selectedStatus,
  );
  const updateStatusMutation = useUpdateApplicationStatus(jobId ?? "");

  const applicants = data?.applicants ?? [];
  const stats = data?.stats;
  const jobTitle = data?.jobTitle ?? "Job Applicants";

  const handleOpenStatusModal = (applicant: RecruiterApplicantItem) => {
    setActiveApplicant(applicant);
    setTargetStatus(
      applicant.status === "applied"
        ? "under_review"
        : (applicant.status as any) || "under_review",
    );
    setInterviewDate(
      applicant.interviewAt ? new Date(applicant.interviewAt).toISOString().slice(0, 16) : "",
    );
    setRecruiterNotes(applicant.recruiterNotes ?? "");
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApplicant) return;

    try {
      await updateStatusMutation.mutateAsync({
        applicationId: activeApplicant.id,
        input: {
          status: targetStatus,
          interviewAt: interviewDate ? new Date(interviewDate) : undefined,
          recruiterNotes: recruiterNotes.trim() || undefined,
        },
      });
      setActiveApplicant(null);
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-4">
          <Link
            to="/dashboard/recruiter/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Manage Jobs
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Applicants: {jobTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review candidate credentials, download resumes, schedule interviews, and update statuses.
            </p>
          </div>
        </div>

        {/* Pipeline Summary Strip */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground">Total Applicants</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground">New Applied</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats.applied}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Under Review</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                {stats.underReview}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-brand">Shortlisted</p>
              <p className="text-2xl font-extrabold text-brand mt-0.5">{stats.shortlisted}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Offered</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.offered}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <p className="text-xs font-semibold text-danger">Rejected</p>
              <p className="text-2xl font-extrabold text-danger mt-0.5">{stats.rejected}</p>
            </div>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="mt-8 flex overflow-x-auto border-b border-border pb-px gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              className={cn(
                "whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-all",
                selectedStatus === tab.value
                  ? "border-brand text-brand font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Applicant List */}
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to load applicants"
              message={error?.message || "An unexpected error occurred."}
              onRetry={() => void refetch()}
            />
          ) : applicants.length === 0 ? (
            <EmptyState
              title="No applicants found"
              description={
                selectedStatus === "all"
                  ? "No candidate has applied to this job yet. Share your job listing to attract top talent."
                  : `No applicants currently under "${selectedStatus.replace("_", " ")}" status.`
              }
            />
          ) : (
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-brand/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3.5">
                      <Avatar
                        src={applicant.seekerAvatarUrl}
                        name={applicant.seekerName}
                        size="md"
                        className="rounded-full border border-border bg-surface-muted"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-foreground">
                            {applicant.seekerName}
                          </h3>
                          <Badge tone={getStatusBadgeTone(applicant.status)} size="sm">
                            {applicant.status.replace("_", " ")}
                          </Badge>
                        </div>

                        {applicant.seekerHeadline && (
                          <p className="text-sm text-foreground/80 font-medium">
                            {applicant.seekerHeadline}
                          </p>
                        )}

                        <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {applicant.seekerEmail}
                          </span>
                          {applicant.seekerLocation && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {applicant.seekerLocation}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Applied {new Date(applicant.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interview Date Callout */}
                    {applicant.interviewAt && (
                      <div className="mt-3.5 inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-900/40 dark:bg-purple-950/30 px-3 py-1.5 text-xs text-purple-700 dark:text-purple-300">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="font-semibold">Interview:</span>
                        <span>{new Date(applicant.interviewAt).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Private Recruiter Note preview */}
                    {applicant.recruiterNotes && (
                      <div className="mt-2 text-xs text-muted-foreground italic flex items-start gap-1.5 bg-surface-muted/60 p-2 rounded-md max-w-xl">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                        <span>Private Note: {applicant.recruiterNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    {/* Cover Letter Button */}
                    {applicant.coverLetter && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCoverLetterApplicant(applicant)}
                      >
                        <FileText className="h-4 w-4 mr-1.5" />
                        Cover Letter
                      </Button>
                    )}

                    {/* Resume Download */}
                    <a
                      href={applicant.resumeDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-surface-muted transition-colors shadow-sm"
                    >
                      <Download className="h-4 w-4 text-brand" />
                      Resume PDF
                    </a>

                    {/* Status Update / Schedule */}
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenStatusModal(applicant)}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cover Letter Modal */}
      {coverLetterApplicant && (
        <Modal
          open={Boolean(coverLetterApplicant)}
          onOpenChange={(open) => !open && setCoverLetterApplicant(null)}
          title={`Cover Letter: ${coverLetterApplicant.seekerName}`}
          description={`Submitted application note for ${jobTitle}.`}
        >
          <div className="py-2 space-y-4">
            <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm whitespace-pre-line text-foreground/90 leading-relaxed max-h-96 overflow-y-auto">
              {coverLetterApplicant.coverLetter}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setCoverLetterApplicant(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Transition & Interview Modal */}
      {activeApplicant && (
        <Modal
          open={Boolean(activeApplicant)}
          onOpenChange={(open) => !open && setActiveApplicant(null)}
          title={`Update Status: ${activeApplicant.seekerName}`}
          description="Transition applicant state and schedule interview dates."
        >
          <form onSubmit={handleStatusSubmit} className="space-y-5 py-2">
            {updateStatusMutation.isError && (
              <div className="rounded-lg border border-danger/20 bg-danger-soft/20 p-3 flex items-start gap-2 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Failed to update status. Please try again.</span>
              </div>
            )}

            <FormField label="Pipeline Status *">
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as any)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted / Interview</option>
                <option value="offered">Job Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </FormField>

            {targetStatus === "shortlisted" && (
              <FormField
                label="Interview Date & Time"
                hint="Candidate will receive an email and in-app calendar notification."
              >
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </FormField>
            )}

            <FormField
              label="Private Recruiter Notes"
              hint="Only visible to your hiring team. Never shown to candidates."
            >
              <textarea
                rows={3}
                maxLength={2000}
                value={recruiterNotes}
                onChange={(e) => setRecruiterNotes(e.target.value)}
                placeholder="Candidate has 5+ years React experience. Strong portfolio..."
                className="w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </FormField>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveApplicant(null)}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={updateStatusMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
