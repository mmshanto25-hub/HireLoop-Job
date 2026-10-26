import type {
  CompanyData,
  CompanyListItem,
  CompanyDetail,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "@hireloop/shared";
import { apiRequest, apiUpload } from "@/lib/api";

export const companiesApi = {
  listPublic: (params: { q?: string; industry?: string; page?: number; limit?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.industry) searchParams.set("industry", params.industry);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return apiRequest<CompanyListItem[]>(`/companies${query ? `?${query}` : ""}`);
  },

  getBySlug: (slug: string) => apiRequest<CompanyDetail>(`/companies/${slug}`),

  getMine: () => apiRequest<CompanyData | null>("/companies/me/profile"),

  register: (data: CreateCompanyInput) =>
    apiRequest<CompanyData>("/companies", { method: "POST", body: data }),

  updateMine: (data: UpdateCompanyInput) =>
    apiRequest<CompanyData>("/companies/me/profile", { method: "PATCH", body: data }),

  uploadLogo: (companyId: string, file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return apiUpload<{ logoUrl: string }>(`/companies/${companyId}/logo`, formData);
  },
};

