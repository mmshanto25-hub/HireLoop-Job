import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_SITE_CONTENT, type SiteContent, type UpdateSiteContentInput } from "@hireloop/shared";
import { cmsApi } from "./api";

export const cmsKeys = {
  public: ["cms", "public"] as const,
  admin: ["cms", "admin"] as const,
};

/**
 * Public hook to fetch dynamic site content with instant fallback to built-in defaults.
 */
export function useSiteContent() {
  const query = useQuery({
    queryKey: cmsKeys.public,
    queryFn: cmsApi.getPublicContent,
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: DEFAULT_SITE_CONTENT,
  });

  return {
    content: query.data ?? DEFAULT_SITE_CONTENT,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Admin hook to fetch complete site content for editing.
 */
export function useAdminSiteContent() {
  return useQuery({
    queryKey: cmsKeys.admin,
    queryFn: cmsApi.getAdminContent,
    staleTime: 0,
  });
}

/**
 * Admin mutation to update site content.
 */
export function useUpdateSiteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSiteContentInput) => cmsApi.updateContent(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(cmsKeys.admin, updated);
      queryClient.setQueryData(cmsKeys.public, updated);
      void queryClient.invalidateQueries({ queryKey: cmsKeys.public });
      void queryClient.invalidateQueries({ queryKey: cmsKeys.admin });
    },
  });
}

/**
 * Admin mutation to reset site content to defaults.
 */
export function useResetSiteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cmsApi.resetContent(),
    onSuccess: (reset) => {
      queryClient.setQueryData(cmsKeys.admin, reset);
      queryClient.setQueryData(cmsKeys.public, reset);
      void queryClient.invalidateQueries({ queryKey: cmsKeys.public });
      void queryClient.invalidateQueries({ queryKey: cmsKeys.admin });
    },
  });
}
