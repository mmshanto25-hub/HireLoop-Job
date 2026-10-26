import type {
  CreateApplicationInput,
  UpdateApplicationStatusInput,
  SeekerApplicationItem,
  RecruiterApplicantItem,
  ApplicationStats,
} from "@hireloop/shared";
import { apiRequest } from "@/lib/api";

export const applicationsApi = {
  apply: (jobId: string, input: CreateApplicationInput) =>
    apiRequest<SeekerApplicationItem>(`/jobs/${jobId}/applications`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getMyApplications: (status?: string) => {
    const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    return apiRequest<{ items: SeekerApplicationItem[]; stats: ApplicationStats }>(
      `/applications/me${query}`,
    );
  },

  withdraw: (applicationId: string) =>
    apiRequest<{ withdrawn: boolean }>(`/applications/${applicationId}/withdraw`, {
      method: "POST",
    }),

  getJobApplicants: (jobId: string, status?: string) => {
    const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    return apiRequest<{
      applicants: RecruiterApplicantItem[];
      jobTitle: string;
      stats: ApplicationStats;
    }>(`/jobs/${jobId}/applications${query}`);
  },

  updateStatus: (applicationId: string, input: UpdateApplicationStatusInput) =>
    apiRequest<RecruiterApplicantItem>(`/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};

