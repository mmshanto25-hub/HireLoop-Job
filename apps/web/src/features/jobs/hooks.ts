import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JobSearchInput, CreateJobInput, UpdateJobInput } from "@hireloop/shared";
import { jobsApi } from "./api";

export const jobKeys = {
  all: ["jobs"] as const,
  search: (params: JobSearchInput) => ["jobs", "search", params] as const,
  featured: ["jobs", "featured"] as const,
  stats: ["jobs", "stats"] as const,
  detail: (slugOrId: string) => ["jobs", "detail", slugOrId] as const,
  similar: (slugOrId: string) => ["jobs", "similar", slugOrId] as const,
  mine: ["jobs", "recruiter", "mine"] as const,
};

export function useSearchJobs(params: JobSearchInput = {}) {
  return useQuery({
    queryKey: jobKeys.search(params),
    queryFn: () => jobsApi.search(params),
  });
}

export function useFeaturedJobs() {
  return useQuery({
    queryKey: jobKeys.featured,
    queryFn: jobsApi.getFeatured,
    staleTime: 60_000,
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: jobKeys.stats,
    queryFn: jobsApi.getPublicStats,
    staleTime: 60_000,
  });
}

export function useJob(slugOrId: string | undefined) {
  return useQuery({
    queryKey: jobKeys.detail(slugOrId || ""),
    queryFn: () => jobsApi.getBySlugOrId(slugOrId!),
    enabled: Boolean(slugOrId),
  });
}

export function useSimilarJobs(slugOrId: string | undefined) {
  return useQuery({
    queryKey: jobKeys.similar(slugOrId || ""),
    queryFn: () => jobsApi.getSimilar(slugOrId!),
    enabled: Boolean(slugOrId),
  });
}

export function useRecruiterJobs() {
  return useQuery({
    queryKey: jobKeys.mine,
    queryFn: jobsApi.listMine,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobInput) => jobsApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.mine });
      void queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: UpdateJobInput }) =>
      jobsApi.update(jobId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.mine });
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.jobId) });
      void queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function usePublishJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => jobsApi.publish(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.mine });
      void queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function useCloseJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => jobsApi.close(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.mine });
      void queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function useReopenJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => jobsApi.reopen(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.mine });
      void queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => jobsApi.delete(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.mine });
      void queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

