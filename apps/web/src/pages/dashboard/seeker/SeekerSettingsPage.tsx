import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Download,
  FileText,
  Mail,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  updateSeekerProfileSchema,
  JOB_CATEGORIES,
  JOB_TYPES,
  type UpdateSeekerProfileInput,
} from "@hireloop/shared";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Avatar } from "@/components/ui/Avatar";
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useUploadResume,
  useDeleteResume,
} from "@/features/profiles/hooks";

export function SeekerSettingsPage() {
  const { data: profileData, isPending } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const uploadResumeMutation = useUploadResume();
  const deleteResumeMutation = useDeleteResume();

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const seeker = profileData?.seekerProfile;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(updateSeekerProfileSchema) as any,
  });

  const emailPrefs = watch("emailPreferences");

  useEffect(() => {
    if (profileData) {
      reset({
        fullName: profileData.fullName,
        headline: seeker?.headline || "",
        bio: seeker?.bio || "",
        location: seeker?.location || "",
        phone: seeker?.phone || "",
        socialLinks: {
          linkedin: seeker?.socialLinks?.linkedin || "",
          github: seeker?.socialLinks?.github || "",
          portfolio: seeker?.socialLinks?.portfolio || "",
        },
        emailPreferences: {
          applicationUpdates: seeker?.emailPreferences?.applicationUpdates ?? true,
          jobAlerts: seeker?.emailPreferences?.jobAlerts ?? true,
          marketing: seeker?.emailPreferences?.marketing ?? false,
        },
      });
      setSkills(seeker?.skills || []);
    }
  }, [profileData, seeker, reset]);

  function handleAddSkill(e: React.KeyboardEvent | React.MouseEvent) {
    if ("key" in e && e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const trimmed = skillInput.trim().replace(/^,+|,+$/g, "");
    if (trimmed && !skills.includes(trimmed) && skills.length < 30) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      setSkillInput("");
    }
  }

  function handleRemoveSkill(skillToRemove: string) {
    setSkills(skills.filter((s) => s !== skillToRemove));
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMessage("");
      try {
        await uploadAvatarMutation.mutateAsync(file);
        setSuccessMessage("Avatar image updated!");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to upload avatar");
      }
    }
  }

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMessage("");
      try {
        await uploadResumeMutation.mutateAsync(file);
        setSuccessMessage("Resume PDF uploaded successfully!");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to upload resume");
      }
    }
  }

  async function handleDeleteResume() {
    setErrorMessage("");
    try {
      await deleteResumeMutation.mutateAsync();
      setSuccessMessage("Resume removed.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to remove resume");
    }
  }

  async function onSubmit(data: any) {
    setSuccessMessage("");
    setErrorMessage("");
    try {
      data.skills = skills;
      await updateProfileMutation.mutateAsync(data);
      setSuccessMessage("Profile updated successfully!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile");
    }
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <div className="h-8 w-48 bg-surface-muted rounded animate-pulse" />
        <div className="h-64 bg-surface rounded-xl border border-border animate-pulse" />
      </div>
    );
  }

  const completeness = seeker?.profileCompleteness ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Profile & Account Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your candidate profile, contact information, resume, and job alerts.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-success-soft border border-success/30 p-4 text-sm text-success flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-danger-soft border border-danger/30 p-4 text-sm text-danger">
          {errorMessage}
        </div>
      )}

      {/* Profile Completeness Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" aria-hidden="true" />
            <h2 className="font-heading text-base font-semibold text-foreground">
              Profile Completeness
            </h2>
          </div>
          <span className="font-heading text-lg font-bold text-brand">{completeness}%</span>
        </div>
        <div className="w-full bg-surface-muted rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-brand h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground">
          {completeness >= 80
            ? "Great job! A complete profile increases recruiter response rates by up to 3x."
            : "Add a headline, bio, at least 3 skills, and a resume to reach 100% completeness."}
        </p>
      </div>

      {/* Avatar & Photo Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
        <h2 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3 mb-6">
          Profile Photo
        </h2>
        <div className="flex items-center gap-6">
          <Avatar
            src={profileData?.avatarUrl}
            name={profileData?.fullName || "User"}
            size="xl"
            className="rounded-full border-2 border-brand/20 h-20 w-20 text-xl"
          />
          <div>
            <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-surface-muted cursor-pointer transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Upload Avatar
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarChange}
                className="sr-only"
              />
            </label>
            <p className="mt-1.5 text-xs text-muted-foreground">
              PNG, JPEG or WebP up to 2 MB. Square image recommended.
            </p>
          </div>
        </div>
      </div>

      {/* Resume Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
        <h2 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3 mb-6">
          Resume Document
        </h2>

        {seeker?.resumeObjectKey ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {seeker.resumeFileName || "Primary Resume.pdf"}
                </p>
                <p className="text-xs text-muted-foreground">Uploaded & verified PDF</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/v1/profiles/me/resume"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                View / Download
              </a>

              <button
                type="button"
                onClick={handleDeleteResume}
                className="p-2 text-muted-foreground hover:text-danger rounded-md hover:bg-danger-soft transition-colors"
                title="Remove Resume"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">No resume uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">
              Upload your resume in PDF format (up to 5 MB).
            </p>
            <label className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover cursor-pointer transition-colors">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload PDF Resume
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeChange}
                className="sr-only"
              />
            </label>
          </div>
        )}
      </div>

      {/* Main Profile Details Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6"
      >
        <h2 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3">
          Candidate Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Full Name">
            <Input placeholder="John Doe" {...register("fullName")} />
          </FormField>

          <FormField label="Professional Headline" error={errors.headline?.message}>
            <Input placeholder="e.g. Senior Full-Stack Engineer" {...register("headline")} />
          </FormField>

          <FormField label="Location" error={errors.location?.message}>
            <Input placeholder="e.g. New York, NY" {...register("location")} />
          </FormField>

          <FormField label="Phone Number" error={errors.phone?.message}>
            <Input placeholder="e.g. +1 (555) 012-3456" {...register("phone")} />
          </FormField>
        </div>

        <FormField label="Professional Bio" error={errors.bio?.message}>
          <Textarea
            rows={4}
            placeholder="Write a brief professional overview summarizing your expertise and background..."
            {...register("bio")}
          />
        </FormField>

        {/* Skills Tag Input */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">
            Skills & Competencies
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add skill (e.g. React, Node.js, AWS)..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
            />
            <Button type="button" variant="outline" onClick={handleAddSkill}>
              Add
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-text"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-danger focus:outline-none"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="pt-4 border-t border-border">
          <h3 className="font-heading text-base font-semibold text-foreground mb-4">
            Online Presence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="LinkedIn URL">
              <Input placeholder="https://linkedin.com/in/..." {...register("socialLinks.linkedin")} />
            </FormField>

            <FormField label="GitHub URL">
              <Input placeholder="https://github.com/..." {...register("socialLinks.github")} />
            </FormField>

            <FormField label="Portfolio URL">
              <Input placeholder="https://myportfolio.dev" {...register("socialLinks.portfolio")} />
            </FormField>
          </div>
        </div>

        {/* Email Preferences */}
        <div className="pt-4 border-t border-border space-y-3">
          <h3 className="font-heading text-base font-semibold text-foreground mb-2">
            Notification Preferences
          </h3>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-foreground">
            <Checkbox
              checked={emailPrefs?.applicationUpdates ?? true}
              onCheckedChange={(val) =>
                setValue("emailPreferences.applicationUpdates", Boolean(val))
              }
            />
            <span>Email me status updates on my job applications</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-foreground">
            <Checkbox
              checked={emailPrefs?.jobAlerts ?? true}
              onCheckedChange={(val) => setValue("emailPreferences.jobAlerts", Boolean(val))}
            />
            <span>Send me weekly matching job alert digests</span>
          </label>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border">
          <Button type="submit" size="lg" disabled={updateProfileMutation.isPending}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
