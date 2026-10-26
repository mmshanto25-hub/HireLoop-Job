import type {
  ProfileResponse,
  UpdateSeekerProfileInput,
  UpdateRecruiterProfileInput,
  SeekerProfileData,
  RecruiterProfileData,
} from "@hireloop/shared";
import { apiRequest, apiUpload } from "@/lib/api";

export const profilesApi = {
  getMe: () => apiRequest<ProfileResponse>("/profiles/me"),

  updateMe: (data: UpdateSeekerProfileInput | UpdateRecruiterProfileInput | { fullName: string }) =>
    apiRequest<{ seekerProfile?: SeekerProfileData; recruiterProfile?: RecruiterProfileData; message?: string }>(
      "/profiles/me",
      { method: "PATCH", body: data },
    ),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiUpload<{ avatarUrl: string }>("/profiles/me/avatar", formData);
  },

  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    return apiUpload<{ resumeObjectKey: string; resumeFileName: string; profileCompleteness: number }>(
      "/profiles/me/resume",
      formData,
    );
  },

  deleteResume: () =>
    apiRequest<{ deleted: boolean; profileCompleteness: number }>("/profiles/me/resume", {
      method: "DELETE",
    }),
};

