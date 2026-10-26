import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSeekerDashboard,
  getRecruiterDashboard,
  getRecruiterAnalytics,
} from "../services/dashboard.service.js";
import {
  getAdminOverview,
  listAdminUsers,
  listAdminJobs,
  toggleJobFeatured,
  deleteJobAdmin,
  getAdminPayments,
  exportAdminPaymentsCsv,
} from "../services/admin.service.js";
import {
  UserModel,
  UserRoleModel,
  CompanyModel,
  JobModel,
  ApplicationModel,
  SavedJobModel,
  SeekerProfileModel,
  AuditLogModel,
} from "../models/index.js";

vi.mock("../models/index.js", () => ({
  UserModel: {
    countDocuments: vi.fn(),
    find: vi.fn(),
    aggregate: vi.fn(),
  },
  UserRoleModel: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
  CompanyModel: {
    countDocuments: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
  },
  JobModel: {
    countDocuments: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    aggregate: vi.fn(),
  },
  ApplicationModel: {
    countDocuments: vi.fn(),
    find: vi.fn(),
    aggregate: vi.fn(),
  },
  SavedJobModel: {
    countDocuments: vi.fn(),
  },
  SeekerProfileModel: {
    findOne: vi.fn(),
  },
  AuditLogModel: {
    create: vi.fn(),
  },
}));

describe("Phase 6: Dashboard & Analytics Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Seeker Dashboard Service", () => {
    it("aggregates overview stats and recent applications for seeker", async () => {
      vi.mocked(SavedJobModel.countDocuments).mockResolvedValue(5 as any);
      vi.mocked(ApplicationModel.countDocuments).mockResolvedValueOnce(3 as any); // applicationsCount
      vi.mocked(ApplicationModel.countDocuments).mockResolvedValueOnce(1 as any); // interviewsCount
      vi.mocked(ApplicationModel.countDocuments).mockResolvedValueOnce(0 as any); // offersCount
      vi.mocked(SeekerProfileModel.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({ profileCompleteness: 85, skills: ["React", "TypeScript"] }),
      } as any);
      vi.mocked(ApplicationModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            populate: vi.fn().mockReturnValue({
              lean: vi.fn().mockResolvedValue([
                {
                  _id: "app1",
                  jobId: { _id: "job1", title: "Frontend Eng", companyId: "comp1", city: "NY", country: "USA", isRemote: true },
                  status: "applied",
                  interviewAt: null,
                  createdAt: new Date("2026-05-01"),
                },
              ]),
            }),
          }),
        }),
      } as any);
      vi.mocked(ApplicationModel.aggregate).mockResolvedValue([{ _id: "applied", count: 3 }] as any);
      vi.mocked(CompanyModel.find).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([{ _id: "comp1", name: "TechCorp", slug: "techcorp" }]),
        }),
      } as any);
      vi.mocked(JobModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            populate: vi.fn().mockReturnValue({
              lean: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      const res = await getSeekerDashboard("seeker123");

      expect(res.savedJobsCount).toBe(5);
      expect(res.applicationsCount).toBe(3);
      expect(res.interviewsCount).toBe(1);
      expect(res.profileCompleteness).toBe(85);
      expect(res.statusCounts.applied).toBe(3);
      expect(res.recentApplications).toHaveLength(1);
      expect(res.recentApplications[0]!.jobTitle).toBe("Frontend Eng");
      expect(res.recentApplications[0]!.companyName).toBe("TechCorp");
    });
  });

  describe("Recruiter Dashboard & Analytics Service", () => {
    it("aggregates overview metrics for recruiter hub", async () => {
      vi.mocked(CompanyModel.findOne).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({
            _id: "comp1",
            name: "HiringInc",
            slug: "hiring-inc",
            status: "approved",
            logoObjectKey: null,
          }),
        }),
      } as any);
      vi.mocked(JobModel.find).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            { _id: "job1", status: "active", title: "Fullstack Dev" },
            { _id: "job2", status: "closed", title: "Product Mgr" },
          ]),
        }),
      } as any);
      vi.mocked(ApplicationModel.countDocuments).mockResolvedValue(12 as any);
      vi.mocked(ApplicationModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            populate: vi.fn().mockReturnValue({
              populate: vi.fn().mockReturnValue({
                lean: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      } as any);
      vi.mocked(ApplicationModel.aggregate).mockResolvedValue([] as any);

      const res = await getRecruiterDashboard("recruiter123");

      expect(res.totalJobs).toBe(2);
      expect(res.activeJobs).toBe(1);
      expect(res.closedJobs).toBe(1);
      expect(res.totalApplicants).toBe(12);
      expect(res.company?.name).toBe("HiringInc");
      expect(res.applicantTrends).toHaveLength(30);
    });

    it("calculates deep recruitment metrics and status funnel", async () => {
      vi.mocked(JobModel.find).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([{ _id: "j1", title: "Backend Eng", status: "active" }]),
        }),
      } as any);
      vi.mocked(ApplicationModel.find).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              jobId: "j1",
              status: "applied",
              createdAt: new Date("2026-05-01"),
              updatedAt: new Date("2026-05-01"),
            },
            {
              jobId: "j1",
              status: "offered",
              createdAt: new Date("2026-05-01"),
              updatedAt: new Date("2026-05-11"),
            },
          ]),
        }),
      } as any);
      vi.mocked(ApplicationModel.aggregate).mockResolvedValue([] as any);

      const res = await getRecruiterAnalytics("recruiter123");

      expect(res.metrics.totalApplicants).toBe(2);
      expect(res.metrics.avgTimeToHireDays).toBe(10);
      expect(res.statusFunnel).toBeDefined();
      expect(res.jobPerformance).toHaveLength(1);
      expect(res.timeline).toHaveLength(30);
    });
  });

  describe("Admin Service", () => {
    it("returns platform overview stats and distributions", async () => {
      vi.mocked(UserModel.countDocuments).mockResolvedValue(50 as any);
      vi.mocked(UserRoleModel.countDocuments).mockResolvedValueOnce(35 as any); // seeker
      vi.mocked(UserRoleModel.countDocuments).mockResolvedValueOnce(12 as any); // recruiter
      vi.mocked(CompanyModel.countDocuments).mockResolvedValueOnce(8 as any); // total companies
      vi.mocked(CompanyModel.countDocuments).mockResolvedValueOnce(2 as any); // pending companies
      vi.mocked(JobModel.countDocuments).mockResolvedValueOnce(25 as any); // total jobs
      vi.mocked(JobModel.countDocuments).mockResolvedValueOnce(18 as any); // active jobs
      vi.mocked(ApplicationModel.countDocuments).mockResolvedValue(100 as any);
      vi.mocked(JobModel.aggregate).mockResolvedValue([{ _id: "Engineering", count: 10 }] as any);
      vi.mocked(UserModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);
      vi.mocked(CompanyModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            populate: vi.fn().mockReturnValue({
              lean: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);
      vi.mocked(UserModel.aggregate).mockResolvedValue([] as any);
      vi.mocked(UserRoleModel.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const res = await getAdminOverview();

      expect(res.totalUsers).toBe(50);
      expect(res.totalSeekers).toBe(35);
      expect(res.totalRecruiters).toBe(12);
      expect(res.totalCompanies).toBe(8);
      expect(res.pendingCompanies).toBe(2);
      expect(res.activeJobs).toBe(18);
      expect(res.jobsByCategory[0]!.category).toBe("Engineering");
    });

    it("toggles job featured status with audit trail", async () => {
      const mockJob = { _id: "job123", isFeatured: false, save: vi.fn().mockResolvedValue(true) };
      vi.mocked(JobModel.findById).mockResolvedValue(mockJob as any);

      const res = await toggleJobFeatured("admin1", "job123");

      expect(res.isFeatured).toBe(true);
      expect(mockJob.save).toHaveBeenCalled();
      expect(AuditLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "admin1",
          action: "job.featured",
          targetType: "job",
          targetId: "job123",
        }),
      );
    });

    it("closes job on administrative deletion with audit record", async () => {
      const mockJob = {
        _id: "job123",
        title: "Staff Dev",
        companyId: "comp1",
        status: "active",
        save: vi.fn().mockResolvedValue(true),
      };
      vi.mocked(JobModel.findById).mockResolvedValue(mockJob as any);

      const res = await deleteJobAdmin("admin1", "job123");

      expect(res.id).toBe("job123");
      expect(mockJob.status).toBe("closed");
      expect(mockJob.save).toHaveBeenCalled();
      expect(AuditLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "admin1",
          action: "job.admin_removed",
        }),
      );
    });

    it("generates CSV format for admin payments export", async () => {
      const csv = await exportAdminPaymentsCsv();
      expect(csv).toContain("Payment ID,User ID,User Email,Plan Name,Amount,Currency,Status,Created At");
    });
  });
});
