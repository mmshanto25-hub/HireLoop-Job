import type { SavedJobItem, SavedJobUsage } from "@hireloop/shared";
import { apiRequest } from "@/lib/api";

export const savedJobsApi = {
  getSavedJobs: () =>
    apiRequest<{ items: SavedJobItem[]; usage: SavedJobUsage }>("/saved-jobs"),

  getSavedJobIds: () => apiRequest<string[]>("/saved-jobs/ids"),

  saveJob: (jobId: string) =>
    apiRequest<{ saved: boolean }>(`/saved-jobs/${jobId}`, {
      method: "POST",
    }),

  unsaveJob: (jobId: string) =>
    apiRequest<{ saved: boolean }>(`/saved-jobs/${jobId}`, {
      method: "DELETE",
    }),
};

