import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "./api";

export const companyKeys = {
  all: ["companies"] as const,
  list: (params: Record<string, unknown>) => ["companies", "list", params] as const,
  detail: (slug: string) => ["companies", "detail", slug] as const,
  mine: ["companies", "mine"] as const,
};

export function useApprovedCompanies(params: { q?: string; industry?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => companiesApi.listPublic(params),
  });
}

export function useCompany(slug: string | undefined) {
  return useQuery({
    queryKey: companyKeys.detail(slug || ""),
    queryFn: () => companiesApi.getBySlug(slug!),
    enabled: Boolean(slug),
  });
}

export function useMyCompany() {
  return useQuery({
    queryKey: companyKeys.mine,
    queryFn: companiesApi.getMine,
  });
}

export function useRegisterCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: companiesApi.register,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.mine });
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useUpdateMyCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: companiesApi.updateMine,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.mine });
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useUploadCompanyLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, file }: { companyId: string; file: File }) =>
      companiesApi.uploadLogo(companyId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.mine });
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

