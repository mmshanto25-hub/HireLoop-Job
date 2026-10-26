import { z } from "zod";
import { JOB_TYPES } from "../constants/domain.js";
import { JOB_CATEGORIES } from "./company.js";

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "INR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const SALARY_PERIODS = ["yearly", "monthly", "hourly"] as const;
export type SalaryPeriod = (typeof SALARY_PERIODS)[number];

const baseJobFields = z.object({
  title: z
    .string({ error: "Job title is required" })
    .trim()
    .min(3, "Job title is required")
    .max(100, "Title must be 100 characters or fewer"),
  category: z.enum(JOB_CATEGORIES, { error: "Select a category" }),
  skills: z
    .array(z.string().trim().min(1).max(50))
    .min(1, "Add at least one skill")
    .max(15, "Maximum 15 skills"),
  jobType: z.enum(JOB_TYPES, { error: "Select a job type" }),
  salaryMin: z.number().int().min(0, "Minimum salary cannot be negative").optional().nullable(),
  salaryMax: z.number().int().min(0, "Maximum salary cannot be negative").optional().nullable(),
  currency: z.enum(CURRENCIES).default("USD"),
  salaryPeriod: z.enum(SALARY_PERIODS).default("yearly"),
  city: z.string().trim().max(100).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
  isRemote: z.boolean().default(false),
  deadline: z.string().datetime({ offset: true }).optional().nullable(),
  description: z
    .string({ error: "Description is required" })
    .trim()
    .min(50, "Description must be at least 50 characters")
    .max(10000, "Description must be 10000 characters or fewer"),
  responsibilities: z.string().trim().max(5000).optional().nullable(),
  requirements: z.string().trim().max(5000).optional().nullable(),
  benefits: z.string().trim().max(5000).optional().nullable(),
});

export const createJobSchema = baseJobFields.strict().refine(
  (data) => {
    if (data.salaryMin != null && data.salaryMax != null) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  },
  { message: "Maximum salary must be at least the minimum", path: ["salaryMax"] },
);
export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobSchema = baseJobFields.partial().strict().refine(
  (data) => {
    if (data.salaryMin != null && data.salaryMax != null) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  },
  { message: "Maximum salary must be at least the minimum", path: ["salaryMax"] },
);
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export const jobSearchSchema = z
  .object({
    q: z.string().trim().max(200).optional(),
    category: z.enum(JOB_CATEGORIES).optional(),
    jobType: z.enum(JOB_TYPES).optional(),
    isRemote: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .optional()
      .transform((val) => (val === undefined ? undefined : String(val) === "true")),
    country: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
    salaryMin: z.coerce.number().int().min(0).optional(),
    salaryMax: z.coerce.number().int().min(0).optional(),
    datePosted: z.enum(["24h", "7d", "30d", "all"]).optional(),
    sort: z.enum(["newest", "salary_desc", "relevance"]).default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();
export type JobSearchInput = z.input<typeof jobSearchSchema>;
