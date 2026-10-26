import type { Request, Response } from "express";
import {
  updateSeekerProfileSchema,
  updateRecruiterProfileSchema,
  updateNameSchema,
} from "@hireloop/shared";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";
import * as profileService from "../services/profile.service.js";

export function createProfileController() {
  return {
    getMe: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const profile = await profileService.getProfile(req.auth.userId, req.auth.user.roles);
      sendSuccess(res, profile);
    }),

    updateMe: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const { roles } = req.auth.user;

      if (req.body.fullName) {
        const parsedName = updateNameSchema.parse({ fullName: req.body.fullName });
        await profileService.updateFullName(req.auth.userId, parsedName.fullName);
      }

      if (roles.includes("seeker")) {
        const parsed = updateSeekerProfileSchema.parse(req.body);
        const updated = await profileService.updateSeekerProfile(req.auth.userId, parsed);
        sendSuccess(res, { seekerProfile: updated });
        return;
      }

      if (roles.includes("recruiter")) {
        const parsed = updateRecruiterProfileSchema.parse(req.body);
        const updated = await profileService.updateRecruiterProfile(req.auth.userId, parsed);
        sendSuccess(res, { recruiterProfile: updated });
        return;
      }

      sendSuccess(res, { message: "Profile updated" });
    }),

    uploadAvatar: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      if (!req.file) throw AppError.badRequest("No image uploaded");

      const avatarUrl = await profileService.updateAvatar(req.auth.userId, req.file);
      sendSuccess(res, { avatarUrl });
    }),

    uploadResume: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      if (!req.file) throw AppError.badRequest("No resume PDF uploaded");

      const result = await profileService.uploadResume(req.auth.userId, req.file);
      sendSuccess(res, result);
    }),

    downloadResume: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();

      const { buffer, fileName } = await profileService.getResume(req.auth.userId);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(fileName)}"`,
      );
      res.send(buffer);
    }),

    deleteResume: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();

      const profileCompleteness = await profileService.deleteResume(req.auth.userId);
      sendSuccess(res, { deleted: true, profileCompleteness });
    }),
  };
}

