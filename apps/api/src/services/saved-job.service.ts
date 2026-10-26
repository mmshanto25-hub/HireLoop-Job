import { SavedJobModel, JobModel, CompanyModel } from "../models/index.js";
import { FREE_SEEKER_SAVED_JOB_LIMIT, type SavedJobItem, type SavedJobUsage } from "@hireloop/shared";
import { AppError } from "../utils/AppError.js";

export class SavedJobService {
  async saveJob(seekerId: string, jobId: string): Promise<void> {
    const job = await JobModel.findById(jobId).lean();
    if (!job || job.status === "draft") {
      throw AppError.notFound("Job listing not found or is not active");
    }

    // Check existing
    const alreadySaved = await SavedJobModel.findOne({ seekerId, jobId }).lean();
    if (alreadySaved) {
      return; // Idempotent: already saved
    }

    // Check free plan entitlement limit
    const currentCount = await SavedJobModel.countDocuments({ seekerId });
    if (currentCount >= FREE_SEEKER_SAVED_JOB_LIMIT) {
      throw AppError.forbidden(
        `You have reached the maximum of ${FREE_SEEKER_SAVED_JOB_LIMIT} saved jobs on your current plan. Upgrade to save unlimited jobs.`,
      );
    }

    try {
      await SavedJobModel.create({ seekerId, jobId });
    } catch (err: any) {
      // E11000 duplicate key race condition handled gracefully
      if (err.code === 11000) return;
      throw err;
    }
  }

  async unsaveJob(seekerId: string, jobId: string): Promise<void> {
    await SavedJobModel.deleteOne({ seekerId, jobId });
  }

  async listSavedJobs(
    seekerId: string,
  ): Promise<{ items: SavedJobItem[]; usage: SavedJobUsage }> {
    const [savedDocs, totalCount] = await Promise.all([
      SavedJobModel.find({ seekerId }).sort({ createdAt: -1 }).lean(),
      SavedJobModel.countDocuments({ seekerId }),
    ]);

    if (savedDocs.length === 0) {
      return {
        items: [],
        usage: {
          used: 0,
          limit: FREE_SEEKER_SAVED_JOB_LIMIT,
          isAtLimit: false,
        },
      };
    }

    const jobIds = savedDocs.map((s) => s.jobId);
    const jobs = await JobModel.find({ _id: { $in: jobIds } }).lean();
    const companyIds = jobs.map((j) => j.companyId);
    const companies = await CompanyModel.find({ _id: { $in: companyIds } }).lean();

    const companyMap = new Map(companies.map((c) => [c._id.toString(), c]));
    const jobMap = new Map(jobs.map((j) => [j._id.toString(), j]));

    const now = Date.now();
    const items: SavedJobItem[] = [];

    for (const saved of savedDocs) {
      const job = jobMap.get(saved.jobId.toString());
      if (!job) continue; // Job may have been removed

      const company = companyMap.get(job.companyId.toString());
      const deadlineDate = job.deadline ? new Date(job.deadline) : null;
      const isExpired = deadlineDate ? deadlineDate.getTime() < now : false;

      items.push({
        id: saved._id.toString(),
        jobId: job._id.toString(),
        title: job.title,
        slug: job.slug,
        companyName: company?.name ?? "Unknown Company",
        companyLogoUrl: company?.logoObjectKey
          ? `/api/v1/uploads/public/${company.logoObjectKey}`
          : null,
        city: job.city ?? "",
        country: job.country ?? "",
        isRemote: Boolean(job.isRemote),
        jobType: job.jobType as any,
        salaryMin: job.salaryMin ?? null,
        salaryMax: job.salaryMax ?? null,
        currency: job.currency ?? "USD",
        salaryPeriod: job.salaryPeriod ?? "yearly",
        status: job.status as any,
        deadline: deadlineDate ? deadlineDate.toISOString() : "",
        isExpired,
        savedAt: (saved as any).createdAt?.toISOString() ?? new Date().toISOString(),
      });
    }

    return {
      items,
      usage: {
        used: totalCount,
        limit: FREE_SEEKER_SAVED_JOB_LIMIT,
        isAtLimit: totalCount >= FREE_SEEKER_SAVED_JOB_LIMIT,
      },
    };
  }

  async getSavedJobIds(seekerId: string): Promise<string[]> {
    const docs = await SavedJobModel.find({ seekerId }).select("jobId").lean();
    return docs.map((d) => d.jobId.toString());
  }
}

export function createSavedJobService(): SavedJobService {
  return new SavedJobService();
}
