import type { ApplicationStatus } from "../constants/domain.js";

/** Application as viewed by the candidate job seeker */
export interface SeekerApplicationItem {
  id: string;
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  salaryPeriod: string;
  status: ApplicationStatus;
  interviewAt: string | null;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Applicant details as viewed by the recruiter of the job */
export interface RecruiterApplicantItem {
  id: string;
  jobId: string;
  jobTitle: string;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  seekerHeadline: string | null;
  seekerAvatarUrl: string | null;
  seekerLocation: string | null;
  coverLetter: string | null;
  resumeDownloadUrl: string;
  status: ApplicationStatus;
  interviewAt: string | null;
  recruiterNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStats {
  total: number;
  applied: number;
  underReview: number;
  shortlisted: number;
  rejected: number;
  offered: number;
  withdrawn: number;
}

