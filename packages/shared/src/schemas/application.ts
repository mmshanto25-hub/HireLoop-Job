import { z } from "zod";
import { APPLICATION_STATUSES } from "../constants/domain.js";

export const createApplicationSchema = z.object({
  coverLetter: z
    .string()
    .max(4000, "Cover letter cannot exceed 4,000 characters")
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  resumeObjectKey: z
    .string()
    .min(1, "Resume is required to submit an application"),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    "under_review",
    "shortlisted",
    "rejected",
    "offered",
  ]),
  recruiterNotes: z
    .string()
    .max(2000, "Recruiter notes cannot exceed 2,000 characters")
    .optional(),
  interviewAt: z.coerce
    .date()
    .optional()
    .refine(
      (val) => !val || val.getTime() > Date.now() - 60_000,
      "Interview date must be in the future",
    ),
});

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;

export const applicationQuerySchema = z.object({
  status: z.enum(["all", ...APPLICATION_STATUSES]).optional().default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ApplicationQueryInput = z.infer<typeof applicationQuerySchema>;

