import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "./api";
import type { CreateApplicationInput, UpdateApplicationStatusInput } from "@hireloop/shared";

export const applicationKeys = {
  myApplications: (status?: string) => ["applications", "me", status ?? "all"] as const,
  jobApplicants: (jobId: string, status?: string) =>
    ["applications", "job", jobId, status ?? "all"] as const,
};

export function useMyApplications(status?: string) {
  return useQuery({
    queryKey: applicationKeys.myApplications(status),
    queryFn: () => applicationsApi.getMyApplications(status),
    staleTime: 30_000,
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, input }: { jobId: string; input: CreateApplicationInput }) =>
      applicationsApi.apply(jobId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applications", "me"] });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => applicationsApi.withdraw(applicationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applications", "me"] });
    },
  });
}

export function useJobApplicants(jobId: string, status?: string) {
  return useQuery({
    queryKey: applicationKeys.jobApplicants(jobId, status),
    queryFn: () => applicationsApi.getJobApplicants(jobId, status),
    enabled: Boolean(jobId),
    staleTime: 30_000,
  });
}

export function useUpdateApplicationStatus(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      input,
    }: {
      applicationId: string;
      input: UpdateApplicationStatusInput;
    }) => applicationsApi.updateStatus(applicationId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applications", "job", jobId] });
    },
  });
}

