import type { CompanyStatus } from "../constants/domain.js";

export interface CompanyData {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  industry: string;
  website: string | null;
  location: string;
  employeeRange: string;
  logoUrl: string | null;
  description: string;
  status: CompanyStatus;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListItem {
  id: string;
  name: string;
  slug: string;
  industry: string;
  location: string;
  employeeRange: string;
  logoUrl: string | null;
  description: string;
  openJobCount: number;
}

export interface CompanyDetail extends CompanyData {
  ownerName?: string;
  openJobCount: number;
}
