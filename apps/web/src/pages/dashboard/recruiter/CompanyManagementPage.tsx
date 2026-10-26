import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import {
  createCompanySchema,
  INDUSTRIES,
  EMPLOYEE_RANGES,
  type CreateCompanyInput,
} from "@hireloop/shared";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { FormField, ValidationMessage } from "@/components/ui/FormField";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  useMyCompany,
  useRegisterCompany,
  useUpdateMyCompany,
  useUploadCompanyLogo,
} from "@/features/companies/hooks";

export function CompanyManagementPage() {
  const { data: company, isPending } = useMyCompany();
  const registerMutation = useRegisterCompany();
  const updateMutation = useUpdateMyCompany();
  const uploadLogoMutation = useUploadCompanyLogo();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(createCompanySchema) as any,
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        industry: company.industry as any,
        website: company.website || "",
        location: company.location,
        employeeRange: company.employeeRange as any,
        description: company.description,
      });
      if (company.logoUrl) setLogoPreview(company.logoUrl);
    }
  }, [company, reset]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  async function onSubmit(data: CreateCompanyInput) {
    setSuccessMessage("");
    try {
      if (!company) {
        // Register new company
        const created = await registerMutation.mutateAsync(data);
        if (logoFile) {
          await uploadLogoMutation.mutateAsync({ companyId: created.id, file: logoFile });
        }
        setSuccessMessage("Company registered successfully! Awaiting moderation review.");
      } else {
        // Update existing company
        await updateMutation.mutateAsync(data);
        if (logoFile) {
          await uploadLogoMutation.mutateAsync({ companyId: company.id, file: logoFile });
        }
        setSuccessMessage("Company profile updated successfully.");
      }
    } catch {
      // Error handled by query/global error handler
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Company Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {company
            ? "Manage your company profile details and brand logo."
            : "Register your organization to publish job listings on HireLoop."}
        </p>
      </div>

      {/* Review Status Banner */}
      {company && (
        <div className="mb-8">
          {company.status === "pending" && (
            <div className="rounded-xl border border-warning/30 bg-warning-soft p-5 text-warning flex items-start gap-3">
              <Clock className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-sm">Under Review</h3>
                <p className="mt-0.5 text-xs opacity-90">
                  Your company profile was submitted on {new Date(company.submittedAt).toLocaleDateString()} and is pending administrator approval. You will be able to publish jobs once verified.
                </p>
              </div>
            </div>
          )}

          {company.status === "approved" && (
            <div className="rounded-xl border border-success/30 bg-success-soft p-5 text-success flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-sm">Approved & Verified</h3>
                <p className="mt-0.5 text-xs opacity-90">
                  Your company is verified and public. You have full access to publish jobs and recruit talent.
                </p>
              </div>
            </div>
          )}

          {company.status === "rejected" && (
            <div className="rounded-xl border border-danger/30 bg-danger-soft p-5 text-danger flex items-start gap-3">
              <XCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-sm">Registration Rejected</h3>
                <p className="mt-0.5 text-xs opacity-90">
                  Reason: {company.rejectionReason || "Company information could not be verified."}
                </p>
                <p className="mt-1 text-xs opacity-80">
                  Update the requested information below and save to resubmit for review.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-lg bg-success-soft border border-success/30 p-4 text-sm text-success flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6"
      >
        {/* Logo Section */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Company Logo</label>
          <div className="flex items-center gap-5">
            <Avatar
              src={logoPreview}
              name={company?.name || "Company"}
              size="xl"
              className="rounded-xl border border-border bg-surface-muted"
            />
            <div>
              <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-surface-muted cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Upload New Logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  className="sr-only"
                />
              </label>
              <p className="mt-1.5 text-xs text-muted-foreground">
                PNG, JPEG, WebP or SVG up to 2 MB. Square aspect ratio recommended.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
          {/* Name */}
          <FormField label="Company Name" error={errors.name?.message} required>
            <Input placeholder="Acme Technologies Inc." {...register("name")} />
          </FormField>

          {/* Industry */}
          <FormField label="Industry" error={errors.industry?.message} required>
            <Select {...register("industry")}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Website */}
          <FormField label="Website URL" error={errors.website?.message}>
            <Input placeholder="https://example.com" {...register("website")} />
          </FormField>

          {/* Location */}
          <FormField label="Location (Headquarters)" error={errors.location?.message} required>
            <Input placeholder="San Francisco, CA or London, UK" {...register("location")} />
          </FormField>

          {/* Employee Range */}
          <FormField label="Company Size" error={errors.employeeRange?.message} required>
            <Select {...register("employeeRange")}>
              <option value="">Select employee count</option>
              {EMPLOYEE_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range} employees
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        {/* Description */}
        <div className="pt-2">
          <FormField
            label="About the Company"
            error={errors.description?.message}
            hint="Describe your company mission, culture, and what you do. Minimum 20 characters."
            required
          >
            <Textarea
              rows={5}
              placeholder="Tell candidates about your company mission, products, and engineering culture..."
              {...register("description")}
            />
          </FormField>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border">
          <Button
            type="submit"
            size="lg"
            disabled={registerMutation.isPending || updateMutation.isPending || uploadLogoMutation.isPending}
          >
            {company ? "Save Changes" : "Register Company"}
          </Button>
        </div>
      </form>
    </div>
  );
}
