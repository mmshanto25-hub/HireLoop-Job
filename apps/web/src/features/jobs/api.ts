import type {
  JobListItem,
  JobDetail,
  RecruiterJobItem,
  JobSearchInput,
  PublicStats,
  CreateJobInput,
  UpdateJobInput,
} from "@hireloop/shared";
import { apiRequest } from "@/lib/api";

export const jobsApi = {
  search: (params: JobSearchInput = {}) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.category) searchParams.set("category", params.category);
    if (params.jobType) searchParams.set("jobType", params.jobType);
    if (params.isRemote !== undefined) searchParams.set("isRemote", String(params.isRemote));
    if (params.country) searchParams.set("country", params.country);
    if (params.city) searchParams.set("city", params.city);
    if (params.salaryMin != null) searchParams.set("salaryMin", String(params.salaryMin));
    if (params.salaryMax != null) searchParams.set("salaryMax", String(params.salaryMax));
    if (params.datePosted) searchParams.set("datePosted", params.datePosted);
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    return apiRequest<JobListItem[]>(`/jobs${query ? `?${query}` : ""}`);
  },

  getFeatured: () => apiRequest<JobListItem[]>("/jobs/featured"),

  getPublicStats: () => apiRequest<PublicStats>("/jobs/stats/public"),

  getBySlugOrId: (slugOrId: string) => apiRequest<JobDetail>(`/jobs/${slugOrId}`),

  getSimilar: (slugOrId: string) => apiRequest<JobListItem[]>(`/jobs/${slugOrId}/similar`),

  // Recruiter actions
  listMine: () => apiRequest<RecruiterJobItem[]>("/jobs/recruiter/mine"),

  create: (data: CreateJobInput) =>
    apiRequest<JobDetail>("/jobs", { method: "POST", body: data }),

  update: (jobId: string, data: UpdateJobInput) =>
    apiRequest<JobDetail>(`/jobs/${jobId}`, { method: "PATCH", body: data }),

  publish: (jobId: string) =>
    apiRequest<JobDetail>(`/jobs/${jobId}/publish`, { method: "POST" }),

  close: (jobId: string) =>
    apiRequest<JobDetail>(`/jobs/${jobId}/close`, { method: "POST" }),

  reopen: (jobId: string) =>
    apiRequest<JobDetail>(`/jobs/${jobId}/reopen`, { method: "POST" }),

  delete: (jobId: string) =>
    apiRequest<{ deleted: boolean }>(`/jobs/${jobId}`, { method: "DELETE" }),
};

