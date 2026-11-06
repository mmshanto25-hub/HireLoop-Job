import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Briefcase,
  Phone,
  Globe,
  Bell,
  Sparkles,
} from "lucide-react";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/features/profiles/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Checkbox } from "@/components/ui/Checkbox";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export function RecruiterProfilePage() {
  const { data: profileData, isPending } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const recruiter = profileData?.recruiterProfile;

  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [newApplications, setNewApplications] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (profileData) {
      setFullName(profileData.fullName || "");
      setJobTitle(recruiter?.jobTitle || "");
      setPhone(recruiter?.phone || "");
      setLinkedin(recruiter?.socialLinks?.linkedin || "");
      setTwitter(recruiter?.socialLinks?.twitter || "");
      setNewApplications(recruiter?.notificationPreferences?.newApplications ?? true);
      setApplicationUpdates(recruiter?.notificationPreferences?.applicationUpdates ?? true);
      setMarketing(recruiter?.notificationPreferences?.marketing ?? false);
    }
  }, [profileData, recruiter]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setErrorMessage("Please upload a PNG, JPEG or WebP image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("File size exceeds 2 MB");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await uploadAvatarMutation.mutateAsync(file);
      setSuccessMessage("Recruiter avatar photo updated successfully!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload avatar image");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Please enter a valid full name (minimum 2 characters)");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateProfileMutation.mutateAsync({
        fullName: trimmedName,
        jobTitle: jobTitle.trim() || null,
        phone: phone.trim() || null,
        socialLinks: {
          linkedin: linkedin.trim() || null,
          twitter: twitter.trim() || null,
        },
        notificationPreferences: {
          newApplications,
          applicationUpdates,
          marketing,
        },
      });
      setSuccessMessage("Recruiter profile updated successfully!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update recruiter profile");
    }
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-56 bg-surface-muted rounded animate-pulse" />
        <div className="h-64 bg-surface rounded-2xl border border-border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge tone="info" size="sm" className="font-semibold uppercase tracking-wider">
            Verified Employer
          </Badge>
          <span className="text-xs text-muted-foreground">Recruiter Workspace</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl mt-2">
          Recruiter Profile & Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal hiring identity, avatar photo, and contact information visible to candidates.
        </p>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Profile Photo & Identity Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
        <h2 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3 mb-6 flex items-center justify-between">
          <span>Profile Photo</span>
          <span className="text-xs font-normal text-muted-foreground">Shown to applicants on company job listings</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar
            src={profileData?.avatarUrl}
            name={profileData?.fullName || "Recruiter"}
            size="xl"
            className="h-24 w-24 text-2xl border-2 border-brand/30 shadow-md ring-4 ring-brand/10"
          />

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <p className="text-base font-semibold text-foreground">
                {profileData?.fullName || "Recruiter"}
              </p>
              <p className="text-xs text-muted-foreground">
                {jobTitle || "Talent Acquisition Specialist"} • {profileData?.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <label className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover cursor-pointer transition-colors disabled:opacity-50">
                <Upload className="h-4 w-4" />
                {uploadAvatarMutation.isPending ? "Uploading..." : "Upload New Photo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarChange}
                  disabled={uploadAvatarMutation.isPending}
                  className="sr-only"
                />
              </label>

              {profileData?.avatarUrl && (
                <span className="text-xs text-success flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Avatar active
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              PNG, JPEG or WebP up to 2 MB. A friendly professional photo increases candidate engagement by 40%.
            </p>
          </div>
        </div>
      </div>

      {/* Recruiter Details Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6"
      >
        <h2 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3">
          Personal & Professional Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Full Name" required>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              required
            />
          </FormField>

          <FormField label="Account Email">
            <Input
              value={profileData?.email || ""}
              disabled
              className="bg-surface-muted cursor-not-allowed opacity-80"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Contact email associated with your verified recruiter login.
            </p>
          </FormField>

          <FormField label="Job Title">
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Lead Technical Recruiter"
            />
          </FormField>

          <FormField label="Direct Phone Number">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (555) 234-5678"
            />
          </FormField>

          <FormField label="LinkedIn Profile URL">
            <Input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </FormField>

          <FormField label="Twitter / X Profile URL">
            <Input
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://x.com/username"
            />
          </FormField>
        </div>

        {/* Notifications */}
        <div className="pt-6 border-t border-border space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-brand" />
            <h3 className="font-heading text-sm font-semibold text-foreground">
              Recruitment Notification Preferences
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="pref-new-apps"
                checked={newApplications}
                onCheckedChange={(checked) => setNewApplications(checked === true)}
              />
              <label htmlFor="pref-new-apps" className="cursor-pointer select-none">
                <p className="text-sm font-medium text-foreground">New Candidate Applications</p>
                <p className="text-xs text-muted-foreground">
                  Receive immediate alerts when candidates apply to your active jobs.
                </p>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="pref-app-updates"
                checked={applicationUpdates}
                onCheckedChange={(checked) => setApplicationUpdates(checked === true)}
              />
              <label htmlFor="pref-app-updates" className="cursor-pointer select-none">
                <p className="text-sm font-medium text-foreground">Application Status Updates</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when interviews are scheduled or reviews completed.
                </p>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="pref-marketing"
                checked={marketing}
                onCheckedChange={(checked) => setMarketing(checked === true)}
              />
              <label htmlFor="pref-marketing" className="cursor-pointer select-none">
                <p className="text-sm font-medium text-foreground">HireLoop Hiring News & Tips</p>
                <p className="text-xs text-muted-foreground">
                  Occasional digest with hiring best practices and platform feature updates.
                </p>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            type="submit"
            loading={updateProfileMutation.isPending}
            disabled={updateProfileMutation.isPending}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Company Link Banner */}
      <div className="rounded-2xl border border-brand/20 bg-brand-soft/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Looking to update company branding?</p>
            <p className="text-xs text-muted-foreground">
              Company logo, website, headquarters location, and about section can be configured in Company Profile.
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/recruiter/company"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-surface-muted transition-colors"
        >
          Manage Company Profile
        </Link>
      </div>
    </div>
  );
}
