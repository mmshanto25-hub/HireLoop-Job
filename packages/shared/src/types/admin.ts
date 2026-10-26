export interface AdminOverviewStats {
  totalUsers: number;
  totalSeekers: number;
  totalRecruiters: number;
  totalCompanies: number;
  pendingCompanies: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  revenueSummary: {
    totalRevenueCents: number;
    activeSubscriptions: number;
  };
  jobsByCategory: Array<{ category: string; count: number }>;
  registrationTrends: Array<{ date: string; count: number }>;
  pendingCompaniesQueue: Array<{
    id: string;
    name: string;
    slug: string;
    industry: string;
    submittedAt: string;
    ownerEmail?: string;
  }>;
  recentUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    roles: string[];
    status: string;
    createdAt: string;
  }>;
}

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  status: string;
  roles: string[];
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminJobListItem {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  companySlug: string;
  recruiterEmail: string;
  category: string;
  jobType: string;
  status: string;
  isFeatured: boolean;
  applicantsCount: number;
  createdAt: string;
}

export interface AdminPaymentListItem {
  id: string;
  userId: string;
  userEmail: string;
  planName: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
}

