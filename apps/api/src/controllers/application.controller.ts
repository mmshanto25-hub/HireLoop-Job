import type { Request, Response } from "express";
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from "@hireloop/shared";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";
import { createApplicationService } from "../services/application.service.js";
import { createNotificationService } from "../services/notification.service.js";
import { createEmailSender } from "../services/email.service.js";
import type { Env } from "../config/env.js";
import type { Logger } from "../utils/logger.js";

export function createApplicationController(deps: { env: Env; logger: Logger }) {
  const notificationService = createNotificationService();
  const emailSender = createEmailSender(deps.env, deps.logger);
  const service = createApplicationService(
    notificationService,
    emailSender,
    deps.logger,
  );

  return {
    apply: asyncHandler(async (req: Request, res: Response) => {
      const seekerId = req.auth?.userId;
      if (!seekerId) throw AppError.unauthenticated();

      const { jobId } = req.params;
      if (!jobId) throw AppError.badRequest("Missing job ID");

      const parsed = createApplicationSchema.parse(req.body);
      const application = await service.applyToJob(seekerId, jobId, parsed);

      sendSuccess(res, application, { status: 201 });
    }),

    listMine: asyncHandler(async (req: Request, res: Response) => {
      const seekerId = req.auth?.userId;
      if (!seekerId) throw AppError.unauthenticated();

      const statusFilter = req.query.status ? String(req.query.status) : undefined;
      const result = await service.listSeekerApplications(seekerId, statusFilter);

      sendSuccess(res, result);
    }),

    withdraw: asyncHandler(async (req: Request, res: Response) => {
      const seekerId = req.auth?.userId;
      if (!seekerId) throw AppError.unauthenticated();

      const { applicationId } = req.params;
      if (!applicationId) throw AppError.badRequest("Missing application ID");

      await service.withdrawApplication(seekerId, applicationId);
      sendSuccess(res, { withdrawn: true });
    }),

    listJobApplicants: asyncHandler(async (req: Request, res: Response) => {
      const recruiterId = req.auth?.userId;
      if (!recruiterId) throw AppError.unauthenticated();

      const { jobId } = req.params;
      if (!jobId) throw AppError.badRequest("Missing job ID");

      const userRoles = req.auth?.user.roles ?? [];
      const statusFilter = req.query.status ? String(req.query.status) : undefined;

      const result = await service.listJobApplicants(
        recruiterId,
        userRoles,
        jobId,
        statusFilter,
      );

      sendSuccess(res, result);
    }),

    updateStatus: asyncHandler(async (req: Request, res: Response) => {
      const recruiterId = req.auth?.userId;
      if (!recruiterId) throw AppError.unauthenticated();

      const { applicationId } = req.params;
      if (!applicationId) throw AppError.badRequest("Missing application ID");

      const userRoles = req.auth?.user.roles ?? [];
      const parsed = updateApplicationStatusSchema.parse(req.body);

      const updated = await service.updateApplicationStatus(
        recruiterId,
        userRoles,
        applicationId,
        parsed,
      );

      sendSuccess(res, updated);
    }),

    downloadResume: asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth?.userId;
      if (!userId) throw AppError.unauthenticated();

      const { applicationId } = req.params;
      if (!applicationId) throw AppError.badRequest("Missing application ID");

      const userRoles = req.auth?.user.roles ?? [];
      const buffer = await service.getApplicantResumeStream(userId, userRoles, applicationId);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="resume.pdf"');
      res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");

      res.send(buffer);
    }),
  };
}

