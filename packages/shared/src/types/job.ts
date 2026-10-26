import type { JobType, JobStatus } from "../constants/domain.js";

export interface JobListItem {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  companyLogoUrl: string | null;
  category: string;
  jobType: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  salaryPeriod: string;
  city: string | null;
  country: string | null;
  isRemote: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface JobDetail extends JobListItem {
  skills: string[];
  deadline: string | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  status: JobStatus;
  recruiterId: string;
}

export interface RecruiterJobItem extends JobDetail {
  applicantCount: number;
  viewCount: number;
}

export interface JobSearchResult {
  jobs: JobListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PublicStats {
  activeJobs: number;
  approvedCompanies: number;
  registeredSeekers: number;
}
