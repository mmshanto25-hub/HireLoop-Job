import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savedJobsApi } from "./api";

export const savedJobKeys = {
  all: ["saved-jobs"] as const,
  ids: ["saved-jobs", "ids"] as const,
};

export function useSavedJobs() {
  return useQuery({
    queryKey: savedJobKeys.all,
    queryFn: savedJobsApi.getSavedJobs,
    staleTime: 60_000,
  });
}

export function useSavedJobIds(enabled = true) {
  return useQuery({
    queryKey: savedJobKeys.ids,
    queryFn: savedJobsApi.getSavedJobIds,
    enabled,
    staleTime: 60_000,
  });
}

export function useToggleSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, isSaved }: { jobId: string; isSaved: boolean }) => {
      if (isSaved) {
        return savedJobsApi.unsaveJob(jobId);
      }
      return savedJobsApi.saveJob(jobId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: savedJobKeys.all });
      void queryClient.invalidateQueries({ queryKey: savedJobKeys.ids });
    },
  });
}

