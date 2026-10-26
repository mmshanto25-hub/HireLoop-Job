import type { Request, Response } from "express";
import {
  createJobSchema,
  updateJobSchema,
  jobSearchSchema,
} from "@hireloop/shared";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";
import * as jobService from "../services/job.service.js";

export function createJobController() {
  return {
    search: asyncHandler(async (req: Request, res: Response) => {
      const parsed = jobSearchSchema.parse(req.query);
      const result = await jobService.searchJobs(parsed);

      sendSuccess(res, result.jobs, {
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit) || 1,
          hasNextPage: result.page * result.limit < result.total,
          hasPreviousPage: result.page > 1,
        },
      });
    }),

    getFeatured: asyncHandler(async (_req: Request, res: Response) => {
      const jobs = await jobService.getFeaturedJobs(6);
      sendSuccess(res, jobs);
    }),

    getPublicStats: asyncHandler(async (_req: Request, res: Response) => {
      const stats = await jobService.getPublicStats();
      sendSuccess(res, stats);
    }),

    getBySlugOrId: asyncHandler(async (req: Request, res: Response) => {
      const { slugOrId } = req.params;
      if (!slugOrId) throw AppError.notFound();

      const viewerUserId = req.auth?.userId;
      const isAdmin = req.auth?.user.roles.includes("admin") ?? false;

      const job = await jobService.getJobBySlugOrId(slugOrId, viewerUserId, isAdmin);
      sendSuccess(res, job);
    }),

    getSimilar: asyncHandler(async (req: Request, res: Response) => {
      const { slugOrId } = req.params;
      if (!slugOrId) throw AppError.notFound();

      const job = await jobService.getJobBySlugOrId(slugOrId);
      const similar = await jobService.getSimilarJobs(job.id, 4);
      sendSuccess(res, similar);
    }),

    // Recruiter management
    listMine: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const jobs = await jobService.listRecruiterJobs(req.auth.userId);
      sendSuccess(res, jobs);
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const parsed = createJobSchema.parse(req.body);
      const job = await jobService.createJob(req.auth.userId, parsed);
      sendSuccess(res, job, { status: 201 });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const { jobId } = req.params;
      if (!jobId) throw AppError.notFound();

      const isAdmin = req.auth.user.roles.includes("admin");
      const parsed = updateJobSchema.parse(req.body);
      const job = await jobService.updateJob(req.auth.userId, jobId, parsed, isAdmin);
      sendSuccess(res, job);
    }),

    publish: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const { jobId } = req.params;
      if (!jobId) throw AppError.notFound();

      const job = await jobService.publishJob(req.auth.userId, jobId);
      sendSuccess(res, job);
    }),

    close: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const { jobId } = req.params;
      if (!jobId) throw AppError.notFound();

      const job = await jobService.closeJob(req.auth.userId, jobId);
      sendSuccess(res, job);
    }),

    reopen: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const { jobId } = req.params;
      if (!jobId) throw AppError.notFound();

      const job = await jobService.reopenJob(req.auth.userId, jobId);
      sendSuccess(res, job);
    }),

    deleteJob: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const { jobId } = req.params;
      if (!jobId) throw AppError.notFound();

      const isAdmin = req.auth.user.roles.includes("admin");
      await jobService.deleteJob(req.auth.userId, jobId, isAdmin);
      sendSuccess(res, { deleted: true });
    }),
  };
}

