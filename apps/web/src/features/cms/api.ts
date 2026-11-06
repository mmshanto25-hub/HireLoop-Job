import type { SiteContent, UpdateSiteContentInput } from "@hireloop/shared";
import { apiRequest } from "@/lib/api";

export const cmsApi = {
  getPublicContent: () => apiRequest<SiteContent>("/content/public"),

  getAdminContent: () => apiRequest<SiteContent>("/admin/content"),

  updateContent: (data: UpdateSiteContentInput) =>
    apiRequest<SiteContent>("/admin/content", {
      method: "PUT",
      body: data,
    }),

  resetContent: () =>
    apiRequest<SiteContent>("/admin/content/reset", {
      method: "POST",
    }),
};
