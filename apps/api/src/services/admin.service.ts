import {
  UserModel,
  UserRoleModel,
  CompanyModel,
  JobModel,
  ApplicationModel,
  AuditLogModel,
} from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import type {
  AdminOverviewStats,
  AdminUserListItem,
  AdminJobListItem,
  AdminPaymentListItem,
} from "@hireloop/shared";

/**
 * Aggregates high-level metrics for the Admin Overview dashboard.
 */
export async function getAdminOverview(): Promise<AdminOverviewStats> {
  const [
    totalUsers,
    totalSeekers,
    totalRecruiters,
    totalCompanies,
    pendingCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    categoryAgg,
    recentUserDocs,
    pendingCompanyDocs,
    regTrendAgg,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserRoleModel.countDocuments({ role: "seeker" }),
    UserRoleModel.countDocuments({ role: "recruiter" }),
    CompanyModel.countDocuments(),
    CompanyModel.countDocuments({ status: "pending" }),
    JobModel.countDocuments(),
    JobModel.countDocuments({ status: "active" }),
    ApplicationModel.countDocuments(),
    JobModel.aggregate<{ _id: string; count: number }>([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    UserModel.find().sort({ createdAt: -1 }).limit(5).lean(),
    CompanyModel.find({ status: "pending" })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate<{ ownerId: { email: string } }>("ownerId", "email")
      .lean(),
    UserModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Roles for recent users
  const recentUserIds = recentUserDocs.map((u) => u._id);
  const roles = await UserRoleModel.find({ userId: { $in: recentUserIds } }).lean();
  const roleMap = new Map<string, string[]>();
  for (const r of roles) {
    const uid = String(r.userId);
    if (!roleMap.has(uid)) roleMap.set(uid, []);
    roleMap.get(uid)!.push(r.role);
  }

  const recentUsers = recentUserDocs.map((u) => ({
    id: String(u._id),
    fullName: u.fullName,
    email: u.email,
    roles: roleMap.get(String(u._id)) ?? [],
    status: u.status,
    createdAt: u.createdAt.toISOString(),
  }));

  const pendingCompaniesQueue = pendingCompanyDocs.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    industry: c.industry,
    submittedAt: (c.submittedAt ?? c.createdAt).toISOString(),
    ownerEmail: (c.ownerId as any)?.email,
  }));

  // Registration timeline 30-day series
  const trendMap = new Map(regTrendAgg.map((t) => [t._id, t.count]));
  const registrationTrends: Array<{ date: string; count: number }> = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    registrationTrends.push({
      date: dateStr,
      count: trendMap.get(dateStr) ?? 0,
    });
  }

  const jobsByCategory = categoryAgg.map((c) => ({
    category: c._id || "Other",
    count: c.count,
  }));

  return {
    totalUsers,
    totalSeekers,
    totalRecruiters,
    totalCompanies,
    pendingCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    revenueSummary: {
      totalRevenueCents: 0,
      activeSubscriptions: 0,
    },
    jobsByCategory,
    registrationTrends,
    pendingCompaniesQueue,
    recentUsers,
  };
}

/**
 * Lists users with filtering and role enrichment for Admin management.
 */
export async function listAdminUsers(options: {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: AdminUserListItem[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (options.status) {
    filter["status"] = options.status;
  }
  if (options.q && options.q.trim().length > 0) {
    const regex = new RegExp(options.q.trim(), "i");
    filter["$or"] = [{ fullName: regex }, { email: regex }];
  }

  if (options.role) {
    const userRoleDocs = await UserRoleModel.find({ role: options.role }).select("userId").lean();
    const userIdsWithRole = userRoleDocs.map((r) => r.userId);
    filter["_id"] = { $in: userIdsWithRole };
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    UserModel.countDocuments(filter),
  ]);

  const uids = users.map((u) => u._id);
  const roles = await UserRoleModel.find({ userId: { $in: uids } }).lean();
  const roleMap = new Map<string, string[]>();
  for (const r of roles) {
    const uid = String(r.userId);
    if (!roleMap.has(uid)) roleMap.set(uid, []);
    roleMap.get(uid)!.push(r.role);
  }

  const result: AdminUserListItem[] = users.map((u) => ({
    id: String(u._id),
    fullName: u.fullName,
    email: u.email,
    status: u.status,
    roles: roleMap.get(String(u._id)) ?? [],
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  }));

  return { users: result, total, page, limit };
}

/**
 * Lists all platform jobs with filtering, company info, and applicant counts.
 */
export async function listAdminJobs(options: {
  q?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ jobs: AdminJobListItem[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (options.status) filter["status"] = options.status;
  if (options.category) filter["category"] = options.category;
  if (options.q && options.q.trim().length > 0) {
    filter["title"] = new RegExp(options.q.trim(), "i");
  }

  const [rawJobs, total] = await Promise.all([
    JobModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{ companyId: { _id: string; name: string; slug: string } }>("companyId", "name slug")
      .populate<{ recruiterId: { _id: string; email: string } }>("recruiterId", "email")
      .lean(),
    JobModel.countDocuments(filter),
  ]);

  const jobIds = rawJobs.map((j) => j._id);
  const appCounts = await ApplicationModel.aggregate<{ _id: string; count: number }>([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: "$jobId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(appCounts.map((a) => [String(a._id), a.count]));

  const jobs: AdminJobListItem[] = rawJobs.map((j) => {
    const company = j.companyId as any;
    const recruiter = j.recruiterId as any;
    return {
      id: String(j._id),
      title: j.title,
      slug: j.slug,
      companyName: company?.name ?? "Unknown Company",
      companySlug: company?.slug ?? "",
      recruiterEmail: recruiter?.email ?? "Unknown",
      category: j.category,
      jobType: j.jobType,
      status: j.status,
      isFeatured: j.isFeatured ?? false,
      applicantsCount: countMap.get(String(j._id)) ?? 0,
      createdAt: j.createdAt.toISOString(),
    };
  });

  return { jobs, total, page, limit };
}

/**
 * Toggles the featured state of a job listing.
 */
export async function toggleJobFeatured(
  adminId: string,
  jobId: string,
): Promise<{ id: string; isFeatured: boolean }> {
  const job = await JobModel.findById(jobId);
  if (!job) throw AppError.notFound("Job listing not found");

  job.isFeatured = !job.isFeatured;
  await job.save();

  await AuditLogModel.create({
    actorId: adminId,
    action: job.isFeatured ? "job.featured" : "job.unfeatured",
    targetType: "job",
    targetId: jobId,
    details: { isFeatured: job.isFeatured },
  });

  return { id: String(job._id), isFeatured: job.isFeatured };
}

/**
 * Administratively removes a job listing with an audit trail.
 */
export async function deleteJobAdmin(adminId: string, jobId: string): Promise<{ id: string }> {
  const job = await JobModel.findById(jobId);
  if (!job) throw AppError.notFound("Job listing not found");

  job.status = "closed";
  await job.save();

  await AuditLogModel.create({
    actorId: adminId,
    action: "job.admin_removed",
    targetType: "job",
    targetId: jobId,
    details: { title: job.title, companyId: String(job.companyId) },
  });

  return { id: jobId };
}

/**
 * Lists platform transactions and summary metrics.
 */
export async function getAdminPayments(): Promise<{
  payments: AdminPaymentListItem[];
  summary: { totalRevenueCents: number; activeSubscriptions: number };
}> {
  // If payment collection is empty or free tier, provide empty list with structure
  return {
    payments: [],
    summary: {
      totalRevenueCents: 0,
      activeSubscriptions: 0,
    },
  };
}

/**
 * Generates CSV string for platform payments export.
 */
export async function exportAdminPaymentsCsv(): Promise<string> {
  const { payments } = await getAdminPayments();
  const header = "Payment ID,User ID,User Email,Plan Name,Amount,Currency,Status,Created At\n";
  const rows = payments.map((p) =>
    `"${p.id}","${p.userId}","${p.userEmail}","${p.planName}",${(p.amountCents / 100).toFixed(2)},"${p.currency}","${p.status}","${p.createdAt}"`
  );
  return header + rows.join("\n");
}

