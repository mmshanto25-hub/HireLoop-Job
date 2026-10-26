export interface SeekerProfileData {
  userId: string;
  headline: string | null;
  bio: string | null;
  skills: string[];
  location: string | null;
  phone: string | null;
  socialLinks: {
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
  };
  resumeObjectKey: string | null;
  resumeFileName?: string | null;
  profileCompleteness: number;
  emailPreferences: {
    applicationUpdates: boolean;
    jobAlerts: boolean;
    marketing: boolean;
  };
  jobAlertPreferences: {
    categories: string[];
    jobTypes: string[];
    locations: string[];
    remote: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterProfileData {
  userId: string;
  jobTitle: string | null;
  phone: string | null;
  socialLinks: {
    linkedin?: string | null;
    twitter?: string | null;
  };
  notificationPreferences: {
    newApplications: boolean;
    applicationUpdates: boolean;
    marketing: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  seekerProfile?: SeekerProfileData | null;
  recruiterProfile?: RecruiterProfileData | null;
}
