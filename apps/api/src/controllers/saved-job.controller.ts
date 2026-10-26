import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";
import { createSavedJobService } from "../services/saved-job.service.js";

export function createSavedJobController() {
  const service = createSavedJobService();

  return {
    save: asyncHandler(async (req: Request, res: Response) => {
      const seekerId = req.auth?.userId;
      if (!seekerId) throw AppError.unauthenticated();

      const { jobId } = req.params;
      if (!jobId) throw AppError.badRequest("Missing job ID");

      await service.saveJob(seekerId, jobId);
      sendSuccess(res, { saved: true });
    }),

    unsave: asyncHandler(async (req: Request, res: Response) => {
      const seekerId = req.auth?.userId;
      if (!seekerId) throw AppError.unauthenticated();

      const { jobId } = req.params;
      if (!jobId) throw AppError.badRequest("Missing job ID");

      await service.unsaveJob(seekerId, jobId);
      sendSuccess(res, { saved: false });
    }),

    list: asyncHandler(async (req: Request, res: Response) => {
      const seekerId = req.auth?.userId;
      if (!seekerId) throw AppError.unauthenticated();

      const result = await service.listSavedJobs(seekerId);
      sendSuccess(res, result);
    }),

    getIds: asyncHandler(async (req: Request, res: Response) => {
      const seekerId = req.auth?.userId;
      if (!seekerId) throw AppError.unauthenticated();

      const ids = await service.getSavedJobIds(seekerId);
      sendSuccess(res, ids);
    }),
  };
}

