import {
  ApplicationModel,
  JobModel,
  CompanyModel,
  UserModel,
  SeekerProfileModel,
} from "../models/index.js";
import {
  FREE_SEEKER_MONTHLY_APPLICATION_LIMIT,
  type ApplicationStatus,
  type ApplicationStats,
  type CreateApplicationInput,
  type RecruiterApplicantItem,
  type SeekerApplicationItem,
  type UpdateApplicationStatusInput,
} from "@hireloop/shared";
import { AppError } from "../utils/AppError.js";
import { getPrivateResumeStream } from "./storage.service.js";
import type { NotificationService } from "./notification.service.js";
import type { EmailSender } from "./email.service.js";
import { sendEmailSafely } from "./email.service.js";
import type { Logger } from "../utils/logger.js";

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  applied: ["under_review", "rejected", "withdrawn"],
  under_review: ["shortlisted", "rejected"],
  shortlisted: ["offered", "rejected", "under_review"],
  offered: ["rejected"],
  rejected: ["under_review"], // Allow re-evaluating if needed
  withdrawn: [],
};

export class ApplicationService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly emailSender: EmailSender,
    private readonly logger: Logger,
  ) {}

  /**
   * Submit an application for an active job.
   */
  async applyToJob(
    seekerId: string,
    jobId: string,
    input: CreateApplicationInput,
  ): Promise<SeekerApplicationItem> {
    const job = await JobModel.findById(jobId);
    if (!job || job.status !== "active") {
      throw AppError.notFound("This job listing is no longer accepting applications");
    }

    if (job.deadline && new Date(job.deadline).getTime() < Date.now()) {
      throw AppError.badRequest("The deadline for this job posting has expired");
    }

    // Check duplicate application
    const existing = await ApplicationModel.findOne({ jobId, seekerId });
    if (existing) {
      throw AppError.conflict("You have already submitted an application for this job posting");
    }

    // Check 30-day monthly application limit for free tier
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentApplicationsCount = await ApplicationModel.countDocuments({
      seekerId,
      createdAt: { $gte: thirtyDaysAgo },
      status: { $ne: "withdrawn" },
    });

    if (recentApplicationsCount >= FREE_SEEKER_MONTHLY_APPLICATION_LIMIT) {
      throw AppError.forbidden(
        `You have reached your limit of ${FREE_SEEKER_MONTHLY_APPLICATION_LIMIT} applications per month on the Free tier. Upgrade to Pro for unlimited applications.`,
      );
    }

    const application = await ApplicationModel.create({
      jobId: job._id,
      seekerId,
      coverLetter: input.coverLetter ?? null,
      resumeObjectKey: input.resumeObjectKey,
      status: "applied",
    });

    const [seeker, company] = await Promise.all([
      UserModel.findById(seekerId).lean(),
      CompanyModel.findById(job.companyId).lean(),
    ]);

    // Send notifications safely
    void this.notificationService.createNotification(seekerId, {
      type: "application_submitted",
      title: "Application Submitted",
      body: `Your application for "${job.title}" at ${company?.name ?? "the employer"} was successfully received.`,
      link: `/dashboard/seeker/applications`,
    });

    void this.notificationService.createNotification(job.recruiterId.toString(), {
      type: "application_submitted",
      title: "New Job Applicant",
      body: `${seeker?.fullName ?? "A candidate"} applied for "${job.title}".`,
      link: `/dashboard/recruiter/jobs/${job._id.toString()}/applicants`,
    });

    if (seeker?.email) {
      void sendEmailSafely(
        this.emailSender,
        {
          to: seeker.email,
          subject: `Application Confirmation: ${job.title}`,
          html: `<p>Hi ${seeker.fullName},</p><p>We have successfully submitted your application for <strong>${job.title}</strong> at <strong>${company?.name ?? "the employer"}</strong>.</p><p>You can track the status of your application from your HireLoop dashboard.</p>`,
          text: `Hi ${seeker.fullName},\n\nWe have successfully submitted your application for ${job.title} at ${company?.name ?? "the employer"}.\n\nYou can track your application status on HireLoop.`,
        },
        this.logger,
      );
    }

    return {
      id: application._id.toString(),
      jobId: job._id.toString(),
      jobTitle: job.title,
      jobSlug: job.slug,
      companyName: company?.name ?? "Unknown Company",
      companyLogoUrl: company?.logoObjectKey
        ? `/api/v1/uploads/public/${company.logoObjectKey}`
        : null,
      location: [job.city, job.country].filter(Boolean).join(", "),
      isRemote: Boolean(job.isRemote),
      salaryMin: job.salaryMin ?? null,
      salaryMax: job.salaryMax ?? null,
      currency: job.currency ?? "USD",
      salaryPeriod: job.salaryPeriod ?? "yearly",
      status: "applied",
      interviewAt: null,
      coverLetter: application.coverLetter ?? null,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    };
  }

  /**
   * List seeker's applications with status breakdown.
   */
  async listSeekerApplications(
    seekerId: string,
    statusFilter?: string,
  ): Promise<{ items: SeekerApplicationItem[]; stats: ApplicationStats }> {
    const filter: Record<string, any> = { seekerId };
    if (statusFilter && statusFilter !== "all") {
      filter.status = statusFilter;
    }

    const [applications, allApplications] = await Promise.all([
      ApplicationModel.find(filter).sort({ createdAt: -1 }).lean(),
      ApplicationModel.find({ seekerId }).select("status").lean(),
    ]);

    const stats: ApplicationStats = {
      total: allApplications.length,
      applied: allApplications.filter((a) => a.status === "applied").length,
      underReview: allApplications.filter((a) => a.status === "under_review").length,
      shortlisted: allApplications.filter((a) => a.status === "shortlisted").length,
      rejected: allApplications.filter((a) => a.status === "rejected").length,
      offered: allApplications.filter((a) => a.status === "offered").length,
      withdrawn: allApplications.filter((a) => a.status === "withdrawn").length,
    };

    if (applications.length === 0) {
      return { items: [], stats };
    }

    const jobIds = applications.map((a) => a.jobId);
    const jobs = await JobModel.find({ _id: { $in: jobIds } }).lean();
    const companyIds = jobs.map((j) => j.companyId);
    const companies = await CompanyModel.find({ _id: { $in: companyIds } }).lean();

    const jobMap = new Map(jobs.map((j) => [j._id.toString(), j]));
    const companyMap = new Map(companies.map((c) => [c._id.toString(), c]));

    const items: SeekerApplicationItem[] = [];

    for (const app of applications) {
      const job = jobMap.get(app.jobId.toString());
      const company = job ? companyMap.get(job.companyId.toString()) : null;

      items.push({
        id: app._id.toString(),
        jobId: app.jobId.toString(),
        jobTitle: job?.title ?? "Unknown Position",
        jobSlug: job?.slug ?? "",
        companyName: company?.name ?? "Unknown Employer",
        companyLogoUrl: company?.logoObjectKey
          ? `/api/v1/uploads/public/${company.logoObjectKey}`
          : null,
        location: job ? [job.city, job.country].filter(Boolean).join(", ") : "",
        isRemote: Boolean(job?.isRemote),
        salaryMin: job?.salaryMin ?? null,
        salaryMax: job?.salaryMax ?? null,
        currency: job?.currency ?? "USD",
        salaryPeriod: job?.salaryPeriod ?? "yearly",
        status: app.status as ApplicationStatus,
        interviewAt: app.interviewAt ? app.interviewAt.toISOString() : null,
        coverLetter: app.coverLetter ?? null,
        createdAt: (app as any).createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: (app as any).updatedAt?.toISOString() ?? new Date().toISOString(),
      });
    }

    return { items, stats };
  }

  /**
   * Withdraw an application. Only allowed when status is 'applied'.
   */
  async withdrawApplication(seekerId: string, applicationId: string): Promise<void> {
    const app = await ApplicationModel.findOne({ _id: applicationId, seekerId });
    if (!app) {
      throw AppError.notFound("Application not found");
    }

    if (app.status !== "applied") {
      throw AppError.badRequest(
        `Cannot withdraw application with status "${app.status}". Only newly submitted applications can be withdrawn.`,
      );
    }

    app.status = "withdrawn";
    await app.save();

    const job = await JobModel.findById(app.jobId).lean();
    if (job) {
      void this.notificationService.createNotification(job.recruiterId.toString(), {
        type: "application_status_changed",
        title: "Application Withdrawn",
        body: `A candidate withdrew their application for "${job.title}".`,
        link: `/dashboard/recruiter/jobs/${job._id.toString()}/applicants`,
      });
    }
  }

  /**
   * List applicants for a specific recruiter's job.
   */
  async listJobApplicants(
    recruiterId: string,
    userRoles: string[],
    jobId: string,
    statusFilter?: string,
  ): Promise<{ applicants: RecruiterApplicantItem[]; jobTitle: string; stats: ApplicationStats }> {
    const job = await JobModel.findById(jobId).lean();
    if (!job) {
      throw AppError.notFound("Job listing not found");
    }

    // Authorization: Recruiter must own the job unless admin
    if (job.recruiterId.toString() !== recruiterId && !userRoles.includes("admin")) {
      throw AppError.forbidden("You do not have permission to view applicants for this job");
    }

    const filter: Record<string, any> = { jobId };
    if (statusFilter && statusFilter !== "all") {
      filter.status = statusFilter;
    }

    const [applications, allApplications] = await Promise.all([
      ApplicationModel.find(filter).sort({ createdAt: -1 }).lean(),
      ApplicationModel.find({ jobId }).select("status").lean(),
    ]);

    const stats: ApplicationStats = {
      total: allApplications.length,
      applied: allApplications.filter((a) => a.status === "applied").length,
      underReview: allApplications.filter((a) => a.status === "under_review").length,
      shortlisted: allApplications.filter((a) => a.status === "shortlisted").length,
      rejected: allApplications.filter((a) => a.status === "rejected").length,
      offered: allApplications.filter((a) => a.status === "offered").length,
      withdrawn: allApplications.filter((a) => a.status === "withdrawn").length,
    };

    if (applications.length === 0) {
      return { applicants: [], jobTitle: job.title, stats };
    }

    const seekerIds = applications.map((a) => a.seekerId);
    const [users, profiles] = await Promise.all([
      UserModel.find({ _id: { $in: seekerIds } }).lean(),
      SeekerProfileModel.find({ userId: { $in: seekerIds } }).lean(),
    ]);

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const applicants: RecruiterApplicantItem[] = applications.map((app) => {
      const user = userMap.get(app.seekerId.toString());
      const profile = profileMap.get(app.seekerId.toString());

      return {
        id: app._id.toString(),
        jobId: job._id.toString(),
        jobTitle: job.title,
        seekerId: app.seekerId.toString(),
        seekerName: user?.fullName ?? "Applicant",
        seekerEmail: user?.email ?? "",
        seekerHeadline: profile?.headline ?? null,
        seekerAvatarUrl: user?.avatarUrl ?? null,
        seekerLocation: profile?.location ?? null,
        coverLetter: app.coverLetter ?? null,
        resumeDownloadUrl: `/api/v1/applications/${app._id.toString()}/resume`,
        status: app.status as ApplicationStatus,
        interviewAt: app.interviewAt ? app.interviewAt.toISOString() : null,
        recruiterNotes: app.recruiterNotes ?? null,
        createdAt: (app as any).createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: (app as any).updatedAt?.toISOString() ?? new Date().toISOString(),
      };
    });

    return { applicants, jobTitle: job.title, stats };
  }

  /**
   * Update applicant status, notes, or schedule interview.
   */
  async updateApplicationStatus(
    recruiterId: string,
    userRoles: string[],
    applicationId: string,
    input: UpdateApplicationStatusInput,
  ): Promise<RecruiterApplicantItem> {
    const app = await ApplicationModel.findById(applicationId);
    if (!app) {
      throw AppError.notFound("Application not found");
    }

    const job = await JobModel.findById(app.jobId);
    if (!job) {
      throw AppError.notFound("Associated job not found");
    }

    if (job.recruiterId.toString() !== recruiterId && !userRoles.includes("admin")) {
      throw AppError.forbidden("You do not have permission to manage this application");
    }

    const currentStatus = app.status as ApplicationStatus;
    const targetStatus = input.status;

    // Validate status transition if status changed
    if (currentStatus !== targetStatus) {
      const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
      if (!allowed.includes(targetStatus)) {
        throw AppError.badRequest(
          `Invalid status transition from "${currentStatus}" to "${targetStatus}".`,
        );
      }
      app.status = targetStatus;
    }

    if (input.recruiterNotes !== undefined) {
      app.recruiterNotes = input.recruiterNotes;
    }

    if (input.interviewAt !== undefined) {
      app.interviewAt = input.interviewAt;
    }

    await app.save();

    const [seeker, company] = await Promise.all([
      UserModel.findById(app.seekerId).lean(),
      CompanyModel.findById(job.companyId).lean(),
    ]);

    // Send in-app notification to seeker
    let notificationTitle = "Application Updated";
    let notificationBody = `Your application for "${job.title}" status changed to ${targetStatus.replace("_", " ")}.`;

    if (input.interviewAt && targetStatus === "shortlisted") {
      notificationTitle = "Interview Scheduled!";
      notificationBody = `You have an interview scheduled for "${job.title}" at ${new Date(input.interviewAt).toLocaleString()}.`;
    }

    void this.notificationService.createNotification(app.seekerId.toString(), {
      type: input.interviewAt ? "interview_scheduled" : "application_status_changed",
      title: notificationTitle,
      body: notificationBody,
      link: `/dashboard/seeker/applications`,
    });

    // Send email to seeker
    if (seeker?.email) {
      void sendEmailSafely(
        this.emailSender,
        {
          to: seeker.email,
          subject: `${notificationTitle}: ${job.title}`,
          html: `<p>Hi ${seeker.fullName},</p><p>${notificationBody}</p><p>Company: <strong>${company?.name ?? "Employer"}</strong></p><p>Please log in to your HireLoop dashboard to review details.</p>`,
          text: `Hi ${seeker.fullName},\n\n${notificationBody}\n\nPlease check your HireLoop dashboard for details.`,
        },
        this.logger,
      );
    }

    const profile = await SeekerProfileModel.findOne({ userId: app.seekerId }).lean();

    return {
      id: app._id.toString(),
      jobId: job._id.toString(),
      jobTitle: job.title,
      seekerId: app.seekerId.toString(),
      seekerName: seeker?.fullName ?? "Applicant",
      seekerEmail: seeker?.email ?? "",
      seekerHeadline: profile?.headline ?? null,
      seekerAvatarUrl: seeker?.avatarUrl ?? null,
      seekerLocation: profile?.location ?? null,
      coverLetter: app.coverLetter ?? null,
      resumeDownloadUrl: `/api/v1/applications/${app._id.toString()}/resume`,
      status: app.status as ApplicationStatus,
      interviewAt: app.interviewAt ? app.interviewAt.toISOString() : null,
      recruiterNotes: app.recruiterNotes ?? null,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    };
  }

  /**
   * Authorize and stream applicant resume.
   */
  async getApplicantResumeStream(
    userId: string,
    userRoles: string[],
    applicationId: string,
  ): Promise<Buffer> {
    const app = await ApplicationModel.findById(applicationId).lean();
    if (!app) {
      throw AppError.notFound("Application not found");
    }

    const job = await JobModel.findById(app.jobId).lean();
    if (!job) {
      throw AppError.notFound("Associated job not found");
    }

    const isSeekerOwner = app.seekerId.toString() === userId;
    const isJobRecruiter = job.recruiterId.toString() === userId;
    const isAdmin = userRoles.includes("admin");

    if (!isSeekerOwner && !isJobRecruiter && !isAdmin) {
      throw AppError.forbidden("You are not authorized to access this applicant's resume");
    }

    return getPrivateResumeStream(app.resumeObjectKey);
  }
}

export function createApplicationService(
  notificationService: NotificationService,
  emailSender: EmailSender,
  logger: Logger,
): ApplicationService {
  return new ApplicationService(notificationService, emailSender, logger);
}

