import type {
  CreateJobInput,
  UpdateJobInput,
  JobSearchInput,
  JobListItem,
  JobDetail,
  RecruiterJobItem,
  PublicStats,
} from "@hireloop/shared";
import { CompanyModel, JobModel, UserRoleModel, type JobDocument } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function generateUniqueJobSlug(title: string, companyName: string): Promise<string> {
  const baseSlug = `${slugify(title)}-at-${slugify(companyName)}`;
  let slug = baseSlug;
  let counter = 1;

  while (await JobModel.exists({ slug })) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}

export async function createJob(
  recruiterId: string,
  input: CreateJobInput,
): Promise<JobDetail> {
  const company = await CompanyModel.findOne({ ownerId: recruiterId });
  if (!company) {
    throw AppError.badRequest("You must register a company profile before posting a job");
  }
  if (company.status !== "approved") {
    throw AppError.forbidden("Your company must be approved by an administrator before publishing jobs");
  }

  const slug = await generateUniqueJobSlug(input.title, company.name);

  const job = await JobModel.create({
    companyId: company._id,
    recruiterId,
    title: input.title,
    slug,
    category: input.category,
    skills: input.skills,
    jobType: input.jobType,
    salaryMin: input.salaryMin ?? null,
    salaryMax: input.salaryMax ?? null,
    currency: input.currency ?? "USD",
    salaryPeriod: input.salaryPeriod ?? "yearly",
    city: input.city ?? null,
    country: input.country ?? null,
    isRemote: input.isRemote ?? false,
    deadline: input.deadline ? new Date(input.deadline) : null,
    description: input.description,
    responsibilities: input.responsibilities ?? null,
    requirements: input.requirements ?? null,
    benefits: input.benefits ?? null,
    status: "draft",
  });

  return toJobDetail(job, company.name, company.slug, company.logoObjectKey ?? null);
}

export async function updateJob(
  recruiterId: string,
  jobId: string,
  input: UpdateJobInput,
  isAdmin = false,
): Promise<JobDetail> {
  const query = isAdmin ? { _id: jobId } : { _id: jobId, recruiterId };
  const job = await JobModel.findOne(query);
  if (!job) throw AppError.notFound("Job not found");

  if (input.title !== undefined) job.title = input.title;
  if (input.category !== undefined) job.category = input.category;
  if (input.skills !== undefined) job.skills = input.skills;
  if (input.jobType !== undefined) job.jobType = input.jobType;
  if (input.salaryMin !== undefined) job.salaryMin = input.salaryMin;
  if (input.salaryMax !== undefined) job.salaryMax = input.salaryMax;
  if (input.currency !== undefined) job.currency = input.currency;
  if (input.salaryPeriod !== undefined) job.salaryPeriod = input.salaryPeriod;
  if (input.city !== undefined) job.city = input.city;
  if (input.country !== undefined) job.country = input.country;
  if (input.isRemote !== undefined) job.isRemote = input.isRemote;
  if (input.deadline !== undefined) {
    job.deadline = input.deadline ? new Date(input.deadline) : null;
  }
  if (input.description !== undefined) job.description = input.description;
  if (input.responsibilities !== undefined) job.responsibilities = input.responsibilities;
  if (input.requirements !== undefined) job.requirements = input.requirements;
  if (input.benefits !== undefined) job.benefits = input.benefits;

  await job.save();

  const company = await CompanyModel.findById(job.companyId);
  return toJobDetail(
    job,
    company?.name ?? "Company",
    company?.slug ?? "",
    company?.logoObjectKey ?? null,
  );
}

export async function publishJob(recruiterId: string, jobId: string): Promise<JobDetail> {
  const job = await JobModel.findOne({ _id: jobId, recruiterId });
  if (!job) throw AppError.notFound("Job not found");

  const company = await CompanyModel.findById(job.companyId);
  if (!company || company.status !== "approved") {
    throw AppError.forbidden("Cannot publish job: your company is not approved");
  }

  if (job.deadline && new Date(job.deadline) <= new Date()) {
    throw AppError.badRequest("Application deadline must be in the future to publish");
  }

  job.status = "active";
  job.publishedAt = new Date();
  await job.save();

  return toJobDetail(job, company.name, company.slug, company.logoObjectKey ?? null);
}

export async function closeJob(recruiterId: string, jobId: string): Promise<JobDetail> {
  const job = await JobModel.findOne({ _id: jobId, recruiterId });
  if (!job) throw AppError.notFound("Job not found");

  job.status = "closed";
  await job.save();

  const company = await CompanyModel.findById(job.companyId);
  return toJobDetail(
    job,
    company?.name ?? "Company",
    company?.slug ?? "",
    company?.logoObjectKey ?? null,
  );
}

export async function reopenJob(recruiterId: string, jobId: string): Promise<JobDetail> {
  const job = await JobModel.findOne({ _id: jobId, recruiterId });
  if (!job) throw AppError.notFound("Job not found");

  const company = await CompanyModel.findById(job.companyId);
  if (!company || company.status !== "approved") {
    throw AppError.forbidden("Cannot reopen job: company is not approved");
  }

  if (job.deadline && new Date(job.deadline) <= new Date()) {
    throw AppError.badRequest("Extend the deadline into the future before reopening this job");
  }

  job.status = "active";
  job.publishedAt = new Date();
  await job.save();

  return toJobDetail(job, company.name, company.slug, company.logoObjectKey ?? null);
}

export async function deleteJob(recruiterId: string, jobId: string, isAdmin = false): Promise<void> {
  const query = isAdmin ? { _id: jobId } : { _id: jobId, recruiterId };
  const deleted = await JobModel.findOneAndDelete(query);
  if (!deleted) throw AppError.notFound("Job not found");
}

export async function getJobBySlugOrId(
  slugOrId: string,
  viewerUserId?: string,
  isAdmin = false,
): Promise<JobDetail> {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
  const query = isObjectId ? { $or: [{ _id: slugOrId }, { slug: slugOrId }] } : { slug: slugOrId };

  const job = await JobModel.findOne(query);
  if (!job) throw AppError.notFound("Job not found");

  const isOwner = viewerUserId && String(job.recruiterId) === viewerUserId;
  if (job.status !== "active" && !isOwner && !isAdmin) {
    throw AppError.notFound("Job is not currently active");
  }

  const company = await CompanyModel.findById(job.companyId);
  return toJobDetail(
    job,
    company?.name ?? "Company",
    company?.slug ?? "",
    company?.logoObjectKey ?? null,
  );
}

export async function searchJobs(input: JobSearchInput): Promise<{
  jobs: JobListItem[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = Math.max(1, input.page ? Number(input.page) : 1);
  const limit = Math.min(50, Math.max(1, input.limit ? Number(input.limit) : 20));
  const skip = (page - 1) * limit;

  // Only approved companies' active jobs are public
  const filter: Record<string, unknown> = {
    status: "active",
  };

  if (input.category) {
    filter["category"] = input.category;
  }
  if (input.jobType) {
    filter["jobType"] = input.jobType;
  }
  if (input.isRemote !== undefined) {
    filter["isRemote"] = input.isRemote;
  }
  if (input.country) {
    filter["country"] = new RegExp(input.country.trim(), "i");
  }
  if (input.city) {
    filter["city"] = new RegExp(input.city.trim(), "i");
  }

  if (input.salaryMin != null) {
    filter["salaryMax"] = { $gte: input.salaryMin };
  }
  if (input.salaryMax != null) {
    filter["salaryMin"] = { $lte: input.salaryMax };
  }

  if (input.datePosted && input.datePosted !== "all") {
    const now = Date.now();
    let hoursAgo = 24 * 30;
    if (input.datePosted === "24h") hoursAgo = 24;
    else if (input.datePosted === "7d") hoursAgo = 24 * 7;
    filter["publishedAt"] = { $gte: new Date(now - hoursAgo * 60 * 60 * 1000) };
  }

  if (input.q && input.q.trim().length > 0) {
    const term = input.q.trim();
    filter["$or"] = [
      { title: new RegExp(term, "i") },
      { skills: new RegExp(term, "i") },
      { description: new RegExp(term, "i") },
    ];
  }

  // Sorting
  const sort: Record<string, 1 | -1> = {};
  if (input.sort === "salary_desc") {
    sort["salaryMax"] = -1;
  } else {
    sort["publishedAt"] = -1;
  }

  const [jobs, total] = await Promise.all([
    JobModel.find(filter).sort(sort).skip(skip).limit(limit),
    JobModel.countDocuments(filter),
  ]);

  const companyIds = jobs.map((j) => j.companyId);
  const companies = await CompanyModel.find({ _id: { $in: companyIds } });
  const companyMap = new Map(companies.map((c) => [String(c._id), c]));

  const listItems: JobListItem[] = jobs.map((job) => {
    const comp = companyMap.get(String(job.companyId));
    return {
      id: String(job._id),
      title: job.title,
      slug: job.slug,
      companyId: String(job.companyId),
      companyName: comp?.name ?? "Company",
      companySlug: comp?.slug ?? "",
      companyLogoUrl: comp?.logoObjectKey ? `/api/v1/uploads/public/${comp.logoObjectKey}` : null,
      category: job.category,
      jobType: job.jobType,
      salaryMin: job.salaryMin ?? null,
      salaryMax: job.salaryMax ?? null,
      currency: job.currency,
      salaryPeriod: job.salaryPeriod,
      city: job.city ?? null,
      country: job.country ?? null,
      isRemote: job.isRemote,
      isFeatured: job.isFeatured,
      publishedAt: job.publishedAt ? job.publishedAt.toISOString() : null,
      createdAt: job.createdAt.toISOString(),
    };
  });

  return { jobs: listItems, total, page, limit };
}

export async function listRecruiterJobs(
  recruiterId: string,
): Promise<RecruiterJobItem[]> {
  const jobs = await JobModel.find({ recruiterId }).sort({ createdAt: -1 });
  const company = await CompanyModel.findOne({ ownerId: recruiterId });

  return jobs.map((job) => ({
    ...toJobDetail(
      job,
      company?.name ?? "Company",
      company?.slug ?? "",
      company?.logoObjectKey ?? null,
    ),
    applicantCount: 0,
    viewCount: 0,
  }));
}

export async function getFeaturedJobs(limit = 6): Promise<JobListItem[]> {
  const jobs = await JobModel.find({ status: "active" })
    .sort({ isFeatured: -1, publishedAt: -1 })
    .limit(limit);

  const companyIds = jobs.map((j) => j.companyId);
  const companies = await CompanyModel.find({ _id: { $in: companyIds } });
  const companyMap = new Map(companies.map((c) => [String(c._id), c]));

  return jobs.map((job) => {
    const comp = companyMap.get(String(job.companyId));
    return {
      id: String(job._id),
      title: job.title,
      slug: job.slug,
      companyId: String(job.companyId),
      companyName: comp?.name ?? "Company",
      companySlug: comp?.slug ?? "",
      companyLogoUrl: comp?.logoObjectKey ? `/api/v1/uploads/public/${comp.logoObjectKey}` : null,
      category: job.category,
      jobType: job.jobType,
      salaryMin: job.salaryMin ?? null,
      salaryMax: job.salaryMax ?? null,
      currency: job.currency,
      salaryPeriod: job.salaryPeriod,
      city: job.city ?? null,
      country: job.country ?? null,
      isRemote: job.isRemote,
      isFeatured: job.isFeatured,
      publishedAt: job.publishedAt ? job.publishedAt.toISOString() : null,
      createdAt: job.createdAt.toISOString(),
    };
  });
}

export async function getSimilarJobs(jobId: string, limit = 4): Promise<JobListItem[]> {
  const current = await JobModel.findById(jobId);
  if (!current) return [];

  const similar = await JobModel.find({
    _id: { $ne: current._id },
    status: "active",
    category: current.category,
  })
    .sort({ publishedAt: -1 })
    .limit(limit);

  const companyIds = similar.map((j) => j.companyId);
  const companies = await CompanyModel.find({ _id: { $in: companyIds } });
  const companyMap = new Map(companies.map((c) => [String(c._id), c]));

  return similar.map((job) => {
    const comp = companyMap.get(String(job.companyId));
    return {
      id: String(job._id),
      title: job.title,
      slug: job.slug,
      companyId: String(job.companyId),
      companyName: comp?.name ?? "Company",
      companySlug: comp?.slug ?? "",
      companyLogoUrl: comp?.logoObjectKey ? `/api/v1/uploads/public/${comp.logoObjectKey}` : null,
      category: job.category,
      jobType: job.jobType,
      salaryMin: job.salaryMin ?? null,
      salaryMax: job.salaryMax ?? null,
      currency: job.currency,
      salaryPeriod: job.salaryPeriod,
      city: job.city ?? null,
      country: job.country ?? null,
      isRemote: job.isRemote,
      isFeatured: job.isFeatured,
      publishedAt: job.publishedAt ? job.publishedAt.toISOString() : null,
      createdAt: job.createdAt.toISOString(),
    };
  });
}

export async function getPublicStats(): Promise<PublicStats> {
  const [activeJobs, approvedCompanies, registeredSeekers] = await Promise.all([
    JobModel.countDocuments({ status: "active" }),
    CompanyModel.countDocuments({ status: "approved" }),
    UserRoleModel.countDocuments({ role: "seeker" }),
  ]);

  return {
    activeJobs,
    approvedCompanies,
    registeredSeekers,
  };
}

function toJobDetail(
  job: JobDocument,
  companyName: string,
  companySlug: string,
  companyLogoObjectKey: string | null,
): JobDetail {
  return {
    id: String(job._id),
    title: job.title,
    slug: job.slug,
    companyId: String(job.companyId),
    companyName,
    companySlug,
    companyLogoUrl: companyLogoObjectKey
      ? `/api/v1/uploads/public/${companyLogoObjectKey}`
      : null,
    category: job.category,
    skills: job.skills,
    jobType: job.jobType,
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    currency: job.currency,
    salaryPeriod: job.salaryPeriod,
    city: job.city ?? null,
    country: job.country ?? null,
    isRemote: job.isRemote,
    deadline: job.deadline ? job.deadline.toISOString() : null,
    description: job.description,
    responsibilities: job.responsibilities ?? null,
    requirements: job.requirements ?? null,
    benefits: job.benefits ?? null,
    status: job.status,
    isFeatured: job.isFeatured,
    recruiterId: String(job.recruiterId),
    publishedAt: job.publishedAt ? job.publishedAt.toISOString() : null,
    createdAt: job.createdAt.toISOString(),
  };
}
