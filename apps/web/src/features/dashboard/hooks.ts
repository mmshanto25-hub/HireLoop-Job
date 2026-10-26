import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./api";

export function useSeekerDashboard() {
  return useQuery({
    queryKey: ["dashboard", "seeker"],
    queryFn: () => dashboardApi.getSeekerOverview(),
  });
}

export function useRecruiterDashboard() {
  return useQuery({
    queryKey: ["dashboard", "recruiter"],
    queryFn: () => dashboardApi.getRecruiterOverview(),
  });
}

export function useRecruiterAnalytics() {
  return useQuery({
    queryKey: ["dashboard", "recruiter", "analytics"],
    queryFn: () => dashboardApi.getRecruiterAnalytics(),
  });
}

