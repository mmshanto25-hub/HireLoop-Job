import type {
  SeekerDashboardOverview,
  RecruiterDashboardOverview,
  RecruiterAnalyticsData,
} from "@hireloop/shared";
import { apiRequest } from "@/lib/api";

export const dashboardApi = {
  getSeekerOverview: () =>
    apiRequest<SeekerDashboardOverview>("/dashboard/seeker"),

  getRecruiterOverview: () =>
    apiRequest<RecruiterDashboardOverview>("/dashboard/recruiter"),

  getRecruiterAnalytics: () =>
    apiRequest<RecruiterAnalyticsData>("/dashboard/recruiter/analytics"),
};

