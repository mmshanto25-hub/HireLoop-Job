import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  ReviewCompanyInput,
  CompanyData,
  CompanyListItem,
  CompanyDetail,
} from "@hireloop/shared";
import { CompanyModel, JobModel, UserModel, type CompanyDocument } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { storePublicImage } from "./storage.service.js";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export async function generateUniqueCompanySlug(name: string): Promise<string> {
  const baseSlug = slugify(name) || "company";
  let slug = baseSlug;
  let counter = 1;

  while (await CompanyModel.exists({ slug })) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}

function toCompanyData(company: CompanyDocument): CompanyData {
  return {
    id: String(company._id),
    ownerId: String(company.ownerId),
    name: company.name,
    slug: company.slug,
    industry: company.industry,
    website: company.website ?? null,
    location: company.location,
    employeeRange: company.employeeRange,
    logoUrl: company.logoObjectKey ? `/api/v1/uploads/public/${company.logoObjectKey}` : null,
    description: company.description,
    status: company.status,
    rejectionReason: company.rejectionReason ?? null,
    submittedAt: company.submittedAt.toISOString(),
    reviewedAt: company.reviewedAt ? company.reviewedAt.toISOString() : null,
    reviewedBy: company.reviewedBy ? String(company.reviewedBy) : null,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export async function registerCompany(
  ownerId: string,
  input: CreateCompanyInput,
): Promise<CompanyData> {
  // Check if recruiter already has a company
  const existing = await CompanyModel.findOne({ ownerId });
  if (existing) {
    throw AppError.conflict("You have already registered a company profile");
  }

  const slug = await generateUniqueCompanySlug(input.name);

  const company = await CompanyModel.create({
    ownerId,
    name: input.name,
    slug,
    industry: input.industry,
    website: input.website || null,
    location: input.location,
    employeeRange: input.employeeRange,
    description: input.description,
    status: "pending",
  });

  return toCompanyData(company);
}

export async function getRecruiterCompany(ownerId: string): Promise<CompanyData | null> {
  const company = await CompanyModel.findOne({ ownerId });
  if (!company) return null;
  return toCompanyData(company);
}

export async function updateCompany(
  ownerId: string,
  input: UpdateCompanyInput,
): Promise<CompanyData> {
  const company = await CompanyModel.findOne({ ownerId });
  if (!company) throw AppError.notFound("Company not found");

  if (input.name && input.name !== company.name) {
    company.name = input.name;
    // Keep slug stable unless company is pending
    if (company.status === "pending") {
      company.slug = await generateUniqueCompanySlug(input.name);
    }
  }

  if (input.industry) company.industry = input.industry;
  if (input.website !== undefined) company.website = input.website || null;
  if (input.location) company.location = input.location;
  if (input.employeeRange) company.employeeRange = input.employeeRange;
  if (input.description) company.description = input.description;

  await company.save();
  return toCompanyData(company);
}

export async function uploadCompanyLogo(
  ownerId: string,
  companyId: string,
  file: Express.Multer.File,
  isAdmin = false,
): Promise<string> {
  const query = isAdmin ? { _id: companyId } : { _id: companyId, ownerId };
  const company = await CompanyModel.findOne(query);
  if (!company) throw AppError.notFound("Company not found or unauthorized");

  const stored = await storePublicImage(file.buffer, file.originalname, file.mimetype);
  company.logoObjectKey = stored.objectKey;
  await company.save();

  return stored.url;
}

export async function getCompanyBySlug(
  slug: string,
  viewerUserId?: string,
  isAdmin = false,
): Promise<CompanyDetail> {
  const company = await CompanyModel.findOne({ slug });
  if (!company) throw AppError.notFound("Company not found");

  const isOwner = viewerUserId && String(company.ownerId) === viewerUserId;
  // If not approved, only owner or admin can view
  if (company.status !== "approved" && !isOwner && !isAdmin) {
    throw AppError.notFound("Company not found");
  }

  const owner = await UserModel.findById(company.ownerId).select("fullName");
  const openJobCount = await JobModel.countDocuments({
    companyId: company._id,
    status: "active",
  });

  return {
    ...toCompanyData(company),
    ownerName: owner?.fullName,
    openJobCount,
  };
}

export async function listApprovedCompanies(options: {
  q?: string;
  industry?: string;
  page?: number;
  limit?: number;
}): Promise<{ companies: CompanyListItem[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;

  // Filter approved only
  const filter: Record<string, unknown> = { status: "approved" };

  if (options.industry) {
    filter["industry"] = options.industry;
  }

  if (options.q && options.q.trim().length > 0) {
    const regex = new RegExp(options.q.trim(), "i");
    filter["name"] = regex;
  }

  const [companies, total] = await Promise.all([
    CompanyModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    CompanyModel.countDocuments(filter),
  ]);

  // Count active jobs for these companies
  const companyIds = companies.map((c) => c._id);
  const jobCounts = await JobModel.aggregate<{ _id: string; count: number }>([
    { $match: { companyId: { $in: companyIds }, status: "active" } },
    { $group: { _id: "$companyId", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(jobCounts.map((j) => [String(j._id), j.count]));

  const listItems: CompanyListItem[] = companies.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    industry: c.industry,
    location: c.location,
    employeeRange: c.employeeRange,
    logoUrl: c.logoObjectKey ? `/api/v1/uploads/public/${c.logoObjectKey}` : null,
    description: c.description,
    openJobCount: countMap.get(String(c._id)) ?? 0,
  }));

  return { companies: listItems, total, page, limit };
}

export async function listAdminCompanies(options: {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ companies: CompanyData[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (options.status) filter["status"] = options.status;
  if (options.q && options.q.trim().length > 0) {
    filter["name"] = new RegExp(options.q.trim(), "i");
  }

  const [companies, total] = await Promise.all([
    CompanyModel.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(limit),
    CompanyModel.countDocuments(filter),
  ]);

  return {
    companies: companies.map(toCompanyData),
    total,
    page,
    limit,
  };
}

export async function reviewCompany(
  adminId: string,
  companyId: string,
  input: ReviewCompanyInput,
): Promise<CompanyData> {
  const company = await CompanyModel.findById(companyId);
  if (!company) throw AppError.notFound("Company not found");

  company.status = input.status;
  company.reviewedAt = new Date();
  company.reviewedBy = adminId as unknown as CompanyDocument["reviewedBy"];
  company.rejectionReason = input.status === "rejected" ? input.rejectionReason ?? null : null;

  // If rejected, close any active jobs published by this company
  if (input.status === "rejected") {
    await JobModel.updateMany({ companyId: company._id }, { $set: { status: "closed" } });
  }

  await company.save();
  return toCompanyData(company);
}

