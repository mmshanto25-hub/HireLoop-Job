import type { AuthUser, UserRole } from "@hireloop/shared";
import { apiRequest, API_BASE_PATH } from "@/lib/api";

/** Auth client calls. Each one is a thin wrapper over the API contract. */

export interface LoginResponse {
  user: AuthUser;
}

export const authApi = {
  me: () => apiRequest<{ user: AuthUser }>("/auth/me"),
  register: (input: { fullName: string; email: string; password: string; role: UserRole }) =>
    apiRequest<{ message: string }>("/auth/register", { method: "POST", body: input }),
  login: (input: { email: string; password: string }) =>
    apiRequest<LoginResponse>("/auth/login", { method: "POST", body: input }),
  logout: () => apiRequest<{ loggedOut: boolean }>("/auth/logout", { method: "POST" }),
  verifyEmail: (token: string) =>
    apiRequest<{ verified: boolean }>("/auth/verify-email", { method: "POST", body: { token } }),
  resendVerification: (email: string) =>
    apiRequest<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: { email },
    }),
  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (input: { token: string; password: string }) =>
    apiRequest<{ reset: boolean }>("/auth/reset-password", { method: "POST", body: input }),
  changePassword: (input: { currentPassword: string; newPassword: string }) =>
    apiRequest<{ changed: boolean }>("/auth/change-password", { method: "POST", body: input }),
};

/**
 * Google sign-in is a full browser navigation, not a fetch, because the API
 * sets cookies and redirects. The role and return path are sent as query params.
 */
export function googleSignInUrl(options: { role: UserRole; next?: string }): string {
  const params = new URLSearchParams({ role: options.role });
  if (options.next) params.set("next", options.next);
  return `${API_BASE_PATH}/auth/google?${params.toString()}`;
}
