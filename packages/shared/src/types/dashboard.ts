export interface SeekerRecentApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companySlug: string;
  status: string;
  interviewAt: string | null;
  appliedAt: string;
  location: string;
  isRemote: boolean;
}

export interface RecommendedJobItem {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  companySlug: string;
  companyLogoUrl: string | null;
  location: string;
  isRemote: boolean;
  jobType: string;
  category: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
}

export interface SeekerDashboardOverview {
  savedJobsCount: number;
  applicationsCount: number;
  interviewsCount: number;
  offersCount: number;
  profileCompleteness: number;
  statusCounts: Record<string, number>;
  recentApplications: SeekerRecentApplication[];
  recommendedJobs: RecommendedJobItem[];
}

export interface RecruiterApplicantTrend {
  date: string;
  count: number;
}

export interface RecruiterRecentApplicant {
  id: string;
  seekerName: string;
  seekerEmail: string;
  jobTitle: string;
  jobId: string;
  status: string;
  appliedAt: string;
  interviewAt: string | null;
}

export interface RecruiterDashboardOverview {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplicants: number;
  company: {
    id: string;
    name: string;
    slug: string;
    status: string;
    logoUrl: string | null;
  } | null;
  applicantTrends: RecruiterApplicantTrend[];
  recentApplicants: RecruiterRecentApplicant[];
}

export interface JobPerformanceItem {
  jobId: string;
  title: string;
  status: string;
  views: number;
  applications: number;
  conversionRate: number;
  shortlisted: number;
  offered: number;
}

export interface StatusFunnelItem {
  status: string;
  label: string;
  count: number;
}

export interface RecruiterAnalyticsData {
  metrics: {
    totalViews: number;
    totalApplicants: number;
    conversionRate: number;
    avgTimeToHireDays: number;
  };
  statusFunnel: StatusFunnelItem[];
  jobPerformance: JobPerformanceItem[];
  timeline: RecruiterApplicantTrend[];
}

