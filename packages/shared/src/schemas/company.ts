import { z } from "zod";
import { COMPANY_STATUSES } from "../constants/domain.js";

export const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Finance",
  "HR",
  "Operations",
  "Legal",
  "Customer Support",
  "Data Science",
  "DevOps",
  "QA",
  "Management",
  "Other",
] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "AI & Machine Learning",
  "Developer Tools",
  "SaaS",
  "Fintech",
  "Media",
  "Consulting",
  "Manufacturing",
  "Real Estate",
  "Other",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const EMPLOYEE_RANGES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5000+",
] as const;
export type EmployeeRange = (typeof EMPLOYEE_RANGES)[number];

export const createCompanySchema = z
  .object({
    name: z
      .string({ error: "Company name is required" })
      .trim()
      .min(2, "Company name is required")
      .max(100, "Name must be 100 characters or fewer"),
    industry: z.enum(INDUSTRIES, { error: "Select an industry" }),
    website: z.string().url("Enter a valid website URL").max(200).optional().or(z.literal("")),
    location: z
      .string({ error: "Location is required" })
      .trim()
      .min(2, "Location is required")
      .max(150),
    employeeRange: z.enum(EMPLOYEE_RANGES, { error: "Select a company size" }),
    description: z
      .string({ error: "Description is required" })
      .trim()
      .min(20, "Description must be at least 20 characters")
      .max(5000, "Description must be 5000 characters or fewer"),
  })
  .strict();
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.partial().strict();
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const reviewCompanySchema = z
  .object({
    status: z.enum(["approved", "rejected"] as const, {
      error: "Decision must be approved or rejected",
    }),
    rejectionReason: z.string().trim().max(500).optional().nullable(),
  })
  .strict()
  .refine(
    (data) => data.status !== "rejected" || (Boolean(data.rejectionReason) && data.rejectionReason!.length > 0),
    { message: "Provide a reason for rejection", path: ["rejectionReason"] },
  );
export type ReviewCompanyInput = z.infer<typeof reviewCompanySchema>;
