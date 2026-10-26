import type { JobType } from "../constants/domain.js";

export interface SavedJobItem {
  id: string;
  jobId: string;
  title: string;
  slug: string;
  companyName: string;
  companyLogoUrl: string | null;
  city: string;
  country: string;
  isRemote: boolean;
  jobType: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  salaryPeriod: string;
  status: "active" | "closed" | "draft";
  deadline: string;
  isExpired: boolean;
  savedAt: string;
}

export interface SavedJobUsage {
  used: number;
  limit: number;
  isAtLimit: boolean;
}

