import { z } from "zod";

export const updateSeekerProfileSchema = z
  .object({
    headline: z.string().trim().max(120, "Headline must be 120 characters or fewer").optional().nullable(),
    bio: z.string().trim().max(2000, "Bio must be 2000 characters or fewer").optional().nullable(),
    skills: z.array(z.string().trim().min(1).max(50)).max(30, "Maximum 30 skills").optional(),
    location: z.string().trim().max(100).optional().nullable(),
    phone: z.string().trim().max(20).optional().nullable(),
    socialLinks: z
      .object({
        linkedin: z.string().url("Enter a valid LinkedIn URL").or(z.literal("")).optional().nullable(),
        github: z.string().url("Enter a valid GitHub URL").or(z.literal("")).optional().nullable(),
        portfolio: z.string().url("Enter a valid URL").or(z.literal("")).optional().nullable(),
      })
      .optional(),
    emailPreferences: z
      .object({
        applicationUpdates: z.boolean().optional(),
        jobAlerts: z.boolean().optional(),
        marketing: z.boolean().optional(),
      })
      .optional(),
    jobAlertPreferences: z
      .object({
        categories: z.array(z.string().trim().max(50)).max(10).optional(),
        jobTypes: z.array(z.string()).max(5).optional(),
        locations: z.array(z.string().trim().max(100)).max(5).optional(),
        remote: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();
export type UpdateSeekerProfileInput = z.infer<typeof updateSeekerProfileSchema>;

export const updateRecruiterProfileSchema = z
  .object({
    jobTitle: z.string().trim().max(100, "Job title must be 100 characters or fewer").optional().nullable(),
    phone: z.string().trim().max(20).optional().nullable(),
    socialLinks: z
      .object({
        linkedin: z.string().url("Enter a valid LinkedIn URL").or(z.literal("")).optional().nullable(),
        twitter: z.string().url("Enter a valid URL").or(z.literal("")).optional().nullable(),
      })
      .optional(),
    notificationPreferences: z
      .object({
        newApplications: z.boolean().optional(),
        applicationUpdates: z.boolean().optional(),
        marketing: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();
export type UpdateRecruiterProfileInput = z.infer<typeof updateRecruiterProfileSchema>;

export const updateNameSchema = z
  .object({
    fullName: z
      .string({ error: "Enter your full name" })
      .trim()
      .min(2, "Enter your full name")
      .max(100, "Name must be 100 characters or fewer"),
  })
  .strict();
export type UpdateNameInput = z.infer<typeof updateNameSchema>;
