import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Clock,
  Sparkles,
  Key,
  Database,
  Building2,
  Briefcase,
  FileText,
  Sliders,
} from "lucide-react";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/features/profiles/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export function AdminProfilePage() {
  const { data: profileData, isPending } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const [fullName, setFullName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (profileData?.fullName) {
      setFullName(profileData.fullName);
    }
  }, [profileData]);

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
      setSuccessMessage("Admin avatar photo updated successfully!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload avatar image");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed || trimmed.length < 2) {
      setErrorMessage("Please enter a valid full name (minimum 2 characters)");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateProfileMutation.mutateAsync({ fullName: trimmed });
      setSuccessMessage("Administrator name updated successfully!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile name");
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
          <Badge tone="danger" size="sm" className="font-semibold uppercase tracking-wider">
            Super Administrator
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> System Security Tier 1
          </span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl mt-2">
          Administrator Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your administrator identity, profile photo, and platform account credentials.
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
          <span>Administrator Avatar</span>
          <span className="text-xs font-normal text-muted-foreground">Visible across admin audit logs & headers</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar
            src={profileData?.avatarUrl}
            name={profileData?.fullName || "Admin"}
            size="xl"
            className="h-24 w-24 text-2xl border-2 border-brand/30 shadow-md ring-4 ring-brand/10"
          />

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <p className="text-base font-semibold text-foreground">
                {profileData?.fullName || "Administrator"}
              </p>
              <p className="text-xs text-muted-foreground">{profileData?.email}</p>
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
                  <CheckCircle2 className="h-3.5 w-3.5" /> Avatar is active
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Supports PNG, JPEG or WebP images up to 2 MB. Square aspect ratio recommended.
            </p>
          </div>
        </div>
      </div>

      {/* Account Details Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6"
      >
        <h2 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3">
          Account Credentials & Personal Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Full Name" required>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              required
            />
          </FormField>

          <FormField label="Administrator Email">
            <div className="relative">
              <Input
                value={profileData?.email || ""}
                disabled
                className="bg-surface-muted cursor-not-allowed opacity-80"
              />
              <span className="absolute right-3 top-2.5 flex items-center gap-1 text-xs text-success font-medium">
                <ShieldCheck className="h-4 w-4" /> Verified
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Administrator login email is bound to root authorization and cannot be changed here.
            </p>
          </FormField>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            type="submit"
            loading={updateProfileMutation.isPending}
            disabled={updateProfileMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Administrator Privileges Overview */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-brand" />
          <h2 className="font-heading text-base font-semibold text-foreground">
            Privileges & Governance Scope
          </h2>
        </div>

        <p className="text-xs text-muted-foreground">
          As a system administrator on HireLoop, this profile carries global governance access over the following resources:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted/50 p-3 text-xs">
            <User className="h-4 w-4 text-brand" />
            <div>
              <p className="font-semibold text-foreground">User Management</p>
              <p className="text-muted-foreground">Suspend, verify & assign roles</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted/50 p-3 text-xs">
            <Building2 className="h-4 w-4 text-brand" />
            <div>
              <p className="font-semibold text-foreground">Company Approvals</p>
              <p className="text-muted-foreground">Review & verify employer records</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted/50 p-3 text-xs">
            <Briefcase className="h-4 w-4 text-brand" />
            <div>
              <p className="font-semibold text-foreground">Job Moderation</p>
              <p className="text-muted-foreground">Review, flag & moderate listings</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted/50 p-3 text-xs">
            <Sliders className="h-4 w-4 text-brand" />
            <div>
              <p className="font-semibold text-foreground">Site Content (CMS)</p>
              <p className="text-muted-foreground">Full public UI controls & themes</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted/50 p-3 text-xs">
            <Database className="h-4 w-4 text-brand" />
            <div>
              <p className="font-semibold text-foreground">Audit Logs</p>
              <p className="text-muted-foreground">System trace & transaction ledgers</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted/50 p-3 text-xs">
            <Key className="h-4 w-4 text-brand" />
            <div>
              <p className="font-semibold text-foreground">Zero-Trust Security</p>
              <p className="text-muted-foreground">Scoped token rotation & RBAC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
