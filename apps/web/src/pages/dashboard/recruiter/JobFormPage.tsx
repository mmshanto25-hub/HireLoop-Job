import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Sparkles, X } from "lucide-react";
import {
  createJobSchema,
  JOB_CATEGORIES,
  JOB_TYPES,
  CURRENCIES,
  SALARY_PERIODS,
  type CreateJobInput,
} from "@hireloop/shared";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import {
  useCreateJob,
  useUpdateJob,
  usePublishJob,
  useJob,
} from "@/features/jobs/hooks";
import { useMyCompany } from "@/features/companies/hooks";

export function JobFormPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const isEditing = Boolean(jobId);
  const navigate = useNavigate();

  const { data: company } = useMyCompany();
  const { data: existingJob, isPending: jobLoading } = useJob(jobId);

  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const publishMutation = usePublishJob();

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(createJobSchema) as any,
    defaultValues: {
      currency: "USD",
      salaryPeriod: "yearly",
      isRemote: false,
    },
  });

  const isRemote = watch("isRemote");

  useEffect(() => {
    if (existingJob) {
      reset({
        title: existingJob.title,
        category: existingJob.category as any,
        jobType: existingJob.jobType as any,
        salaryMin: existingJob.salaryMin ?? undefined,
        salaryMax: existingJob.salaryMax ?? undefined,
        currency: existingJob.currency as any,
        salaryPeriod: existingJob.salaryPeriod as any,
        city: existingJob.city || "",
        country: existingJob.country || "",
        isRemote: existingJob.isRemote,
        deadline: existingJob.deadline
          ? new Date(existingJob.deadline).toISOString().split("T")[0]
          : undefined,
        description: existingJob.description,
        responsibilities: existingJob.responsibilities || "",
        requirements: existingJob.requirements || "",
        benefits: existingJob.benefits || "",
        skills: existingJob.skills,
      });
      setSkills(existingJob.skills || []);
    }
  }, [existingJob, reset]);

  function handleAddSkill(e: React.KeyboardEvent | React.MouseEvent) {
    if ("key" in e && e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const trimmed = skillInput.trim().replace(/^,+|,+$/g, "");
    if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      setValue("skills", updated, { shouldValidate: true });
      setSkillInput("");
    }
  }

  function handleRemoveSkill(skillToRemove: string) {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    setValue("skills", updated, { shouldValidate: true });
  }

  async function handleSave(data: CreateJobInput, publishDirectly: boolean) {
    setFormError(null);
    try {
      data.skills = skills;
      if (skills.length === 0) {
        setFormError("Add at least one required skill tag");
        return;
      }

      if (isEditing && jobId) {
        await updateMutation.mutateAsync({ jobId, data });
        if (publishDirectly && existingJob?.status === "draft") {
          await publishMutation.mutateAsync(jobId);
        }
      } else {
        const created = await createMutation.mutateAsync(data);
        if (publishDirectly) {
          await publishMutation.mutateAsync(created.id);
        }
      }
      navigate("/dashboard/recruiter/jobs");
    } catch (err: any) {
      setFormError(err.message || "Failed to save job");
    }
  }

  if (isEditing && jobLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <div className="h-8 w-48 bg-surface-muted rounded animate-pulse" />
        <div className="h-96 bg-surface rounded-xl border border-border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Link
          to="/dashboard/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {isEditing ? "Edit Job Listing" : "Post a New Job"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details below. Required fields are marked with an asterisk (*).
        </p>
      </div>

      {formError && (
        <div className="mb-6 rounded-lg bg-danger-soft border border-danger/30 p-4 text-sm text-danger">
          {formError}
        </div>
      )}

      <form className="space-y-8">
        {/* Section 1: General Job Info */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
          <h2 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3">
            1. Job Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormField label="Job Title" error={errors.title?.message} required>
                <Input placeholder="e.g. Senior Frontend Engineer" {...register("title")} />
              </FormField>
            </div>

            <FormField label="Category" error={errors.category?.message} required>
              <Select {...register("category")}>
                <option value="">Select category</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Employment Type" error={errors.jobType?.message} required>
              <Select {...register("jobType")}>
                <option value="">Select type</option>
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type} className="capitalize">
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          {/* Skills Tag Input */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Required Skills <span className="text-danger">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a skill and press Enter (e.g. React, TypeScript)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
              />
              <Button type="button" variant="outline" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            {errors.skills?.message && (
              <p className="mt-1 text-xs text-danger">{String(errors.skills.message)}</p>
            )}

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
        </div>

        {/* Section 2: Compensation & Location */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
          <h2 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3">
            2. Compensation & Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormField label="Min Salary" error={errors.salaryMin?.message}>
              <Input
                type="number"
                placeholder="e.g. 100000"
                {...register("salaryMin", { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Max Salary" error={errors.salaryMax?.message}>
              <Input
                type="number"
                placeholder="e.g. 140000"
                {...register("salaryMax", { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Currency">
              <Select {...register("currency")}>
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Period">
              <Select {...register("salaryPeriod")}>
                {SALARY_PERIODS.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <FormField label="City" error={errors.city?.message}>
              <Input placeholder="e.g. San Francisco or Remote" {...register("city")} />
            </FormField>

            <FormField label="Country" error={errors.country?.message}>
              <Input placeholder="e.g. United States" {...register("country")} />
            </FormField>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-foreground">
              <Checkbox
                checked={isRemote}
                onCheckedChange={(val) => setValue("isRemote", Boolean(val))}
              />
              <span>This is a remote position</span>
            </label>
          </div>

          <div className="pt-2">
            <FormField
              label="Application Deadline (Optional)"
              error={errors.deadline?.message}
              hint="After this date, candidates will not be able to submit new applications."
            >
              <Input
                type="date"
                {...register("deadline")}
              />
            </FormField>
          </div>
        </div>

        {/* Section 3: Description & Detailed Sections */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
          <h2 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3">
            3. Job Description & Details
          </h2>

          <FormField
            label="Role Overview"
            error={errors.description?.message}
            hint="Summarize the core mission and what this role is responsible for. Minimum 50 characters."
            required
          >
            <Textarea
              rows={6}
              placeholder="Provide a comprehensive overview of the role, team, and day-to-day impact..."
              {...register("description")}
            />
          </FormField>

          <FormField
            label="Key Responsibilities"
            error={errors.responsibilities?.message}
            hint="Bullet points or list of regular responsibilities."
          >
            <Textarea
              rows={4}
              placeholder="• Architect and ship scalable React applications&#10;• Collaborate with product designers on component specs..."
              {...register("responsibilities")}
            />
          </FormField>

          <FormField
            label="Requirements & Qualifications"
            error={errors.requirements?.message}
            hint="Required technical competencies, years of experience, or degrees."
          >
            <Textarea
              rows={4}
              placeholder="• 4+ years of professional TypeScript experience&#10;• Experience with distributed microservices and REST APIs..."
              {...register("requirements")}
            />
          </FormField>

          <FormField
            label="Perks & Benefits"
            error={errors.benefits?.message}
            hint="Healthcare, equity, learning stipends, flexible time off, etc."
          >
            <Textarea
              rows={3}
              placeholder="• Competitive compensation & equity grant&#10;• Comprehensive health, dental, and vision insurance..."
              {...register("benefits")}
            />
          </FormField>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleSubmit((data) => handleSave(data, false))}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save as Draft
          </Button>

          <Button
            type="button"
            size="lg"
            onClick={handleSubmit((data) => handleSave(data, true))}
            disabled={createMutation.isPending || updateMutation.isPending || publishMutation.isPending}
          >
            {isEditing ? "Save & Publish" : "Publish Job Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
