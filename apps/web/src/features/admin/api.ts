import type {
  AdminOverviewStats,
  AdminUserListItem,
  AdminJobListItem,
  AdminPaymentListItem,
  CompanyData,
} from "@hireloop/shared";
import { apiRequest } from "@/lib/api";

export const adminApi = {
  getOverview: () => apiRequest<AdminOverviewStats>("/admin/overview"),

  getUsers: (params?: { q?: string; role?: string; status?: string; page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.role && params.role !== "all") sp.set("role", params.role);
    if (params?.status && params.status !== "all") sp.set("status", params.status);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return apiRequest<{ users: AdminUserListItem[]; total: number; page: number; limit: number }>(
      `/admin/users${qs ? `?${qs}` : ""}`,
    );
  },

  updateUserStatus: (id: string, status: string) =>
    apiRequest<{ id: string; status: string }>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  updateUserRoles: (id: string, roles: string[]) =>
    apiRequest<{ id: string; roles: string[] }>(`/admin/users/${id}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
    }),

  getCompanies: (params?: { q?: string; status?: string; page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.status && params.status !== "all") sp.set("status", params.status);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return apiRequest<{ companies: CompanyData[]; total: number; page: number; limit: number }>(
      `/admin/companies${qs ? `?${qs}` : ""}`,
    );
  },

  reviewCompany: (companyId: string, status: "approved" | "rejected", rejectionReason?: string) =>
    apiRequest<CompanyData>(`/admin/companies/${companyId}/review`, {
      method: "POST",
      body: JSON.stringify({ status, rejectionReason }),
    }),

  getJobs: (params?: { q?: string; category?: string; status?: string; page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.category && params.category !== "all") sp.set("category", params.category);
    if (params?.status && params.status !== "all") sp.set("status", params.status);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return apiRequest<{ jobs: AdminJobListItem[]; total: number; page: number; limit: number }>(
      `/admin/jobs${qs ? `?${qs}` : ""}`,
    );
  },

  toggleJobFeatured: (jobId: string) =>
    apiRequest<{ id: string; isFeatured: boolean }>(`/admin/jobs/${jobId}/feature`, {
      method: "PATCH",
    }),

  deleteJob: (jobId: string) =>
    apiRequest<{ id: string }>(`/admin/jobs/${jobId}`, {
      method: "DELETE",
    }),

  getPayments: () =>
    apiRequest<{
      payments: AdminPaymentListItem[];
      summary: { totalRevenueCents: number; activeSubscriptions: number };
    }>("/admin/payments"),

  exportPaymentsCsvUrl: () => "/api/v1/admin/payments/export",
};

