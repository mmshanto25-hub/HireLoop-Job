import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Modal, Button, FormField } from "@/components/ui";
import { useCurrentUser } from "@/features/auth/hooks";
import { useProfile, useUploadResume } from "@/features/profiles/hooks";
import { useApplyToJob } from "@/features/applications/hooks";
import { ApiClientError } from "@/lib/api";

export interface ApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export function ApplyModal({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  companyName,
}: ApplyModalProps) {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const uploadResume = useUploadResume();
  const applyMutation = useApplyToJob();

  const [coverLetter, setCoverLetter] = useState("");
  const [selectedResumeKey, setSelectedResumeKey] = useState<string | null>(null);
  const [useUploadedResume, setUseUploadedResume] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Default resume key to profile's existing resume
  const existingResumeKey = profile?.seekerProfile?.resumeObjectKey ?? null;
  const activeResumeKey = useUploadedResume ? selectedResumeKey : (existingResumeKey || selectedResumeKey);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    if (file.type !== "application/pdf") {
      setUploadError("Only genuine PDF documents are accepted.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Resume file size cannot exceed 5 MB.");
      return;
    }

    try {
      const res = await uploadResume.mutateAsync(file);
      setSelectedResumeKey(res.resumeObjectKey);
      setUseUploadedResume(true);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to upload resume file";
      setUploadError(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResumeKey) {
      setUploadError("Please provide a resume before submitting your application.");
      return;
    }

    try {
      await applyMutation.mutateAsync({
        jobId,
        input: {
          resumeObjectKey: activeResumeKey,
          coverLetter: coverLetter.trim() || undefined,
        },
      });
      setIsSuccess(true);
    } catch {
      // Error is caught by mutation hook and exposed via applyMutation.error
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (isSuccess) {
      // Reset state on close after success
      setIsSuccess(false);
      setCoverLetter("");
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title={isSuccess ? "Application Submitted!" : `Apply for ${jobTitle}`}
      description={
        isSuccess
          ? `Your application has been received by ${companyName}.`
          : `Send your credentials and resume directly to ${companyName}.`
      }
    >
      {!user ? (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Sign in to apply</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You need a free HireLoop Job Seeker account to submit applications and track responses.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to={`/login?returnTo=${encodeURIComponent(`/jobs/${jobId}`)}`}>
              <Button variant="primary">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline">Create Free Account</Button>
            </Link>
          </div>
        </div>
      ) : isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Application successfully sent</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The recruiting team at <span className="font-semibold text-foreground">{companyName}</span> has received your application. You can view updates, interview invites, and status changes in your applications tracker.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                handleClose();
                navigate("/dashboard/seeker/applications");
              }}
            >
              Go to My Applications
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Continue Browsing Jobs
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {applyMutation.isError && (
            <div className="rounded-lg border border-danger/20 bg-danger-soft/20 p-3.5 flex items-start gap-2.5 text-sm text-danger">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>
                {applyMutation.error instanceof ApiClientError
                  ? applyMutation.error.message
                  : "Failed to submit application. Please check your network and try again."}
              </span>
            </div>
          )}

          {/* Applicant Info Summary */}
          <div className="rounded-lg border border-border bg-surface-muted/50 p-3.5 flex items-center justify-between text-sm">
            <div>
              <p className="font-semibold text-foreground">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <span className="text-xs font-medium text-brand bg-brand-soft px-2.5 py-1 rounded-full">
              Job Seeker
            </span>
          </div>

          {/* Resume Selection / Upload */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground flex items-center justify-between">
              <span>Resume (PDF) *</span>
              {existingResumeKey && (
                <button
                  type="button"
                  onClick={() => setUseUploadedResume(!useUploadedResume)}
                  className="text-xs text-brand hover:underline font-medium"
                >
                  {useUploadedResume ? "Use profile resume" : "Upload different resume"}
                </button>
              )}
            </label>

            {isProfileLoading ? (
              <div className="h-14 rounded-lg border border-border bg-surface-muted animate-pulse" />
            ) : existingResumeKey && !useUploadedResume ? (
              <div className="flex items-center justify-between rounded-lg border border-brand/30 bg-brand-soft/20 p-3.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-brand" />
                  <div>
                    <p className="font-medium text-foreground">Using your saved profile resume</p>
                    <p className="text-xs text-muted-foreground">PDF Document verified</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand bg-brand-soft px-2 py-0.5 rounded">
                  Ready
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-5 hover:bg-surface-muted/40 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center justify-center text-center">
                    {uploadResume.isPending ? (
                      <Loader2 className="h-8 w-8 text-brand animate-spin mb-2" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    )}
                    <span className="text-sm font-semibold text-foreground">
                      {uploadResume.isPending
                        ? "Uploading resume..."
                        : selectedResumeKey
                        ? "Resume uploaded! Click to replace"
                        : "Click to upload your resume"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      PDF documents only (max 5 MB)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    disabled={uploadResume.isPending}
                    onChange={handleFileUpload}
                  />
                </label>
                {selectedResumeKey && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Custom resume uploaded for this application
                  </p>
                )}
              </div>
            )}

            {uploadError && (
              <p className="text-xs font-medium text-danger">{uploadError}</p>
            )}
          </div>

          {/* Cover Letter */}
          <FormField
            label="Cover Letter / Note to Hiring Manager (Optional)"
            hint="Highlight why you are an exceptional match for this opportunity."
          >
            <textarea
              rows={4}
              maxLength={4000}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Dear Hiring Team, I am excited to apply for this role because..."
              className="w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </FormField>
          <div className="text-right -mt-4">
            <span className="text-xs text-muted-foreground">
              {coverLetter.length} / 4,000 characters
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={applyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!activeResumeKey || applyMutation.isPending}
              loading={applyMutation.isPending}
            >
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
