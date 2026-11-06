import { Router, type Request, type Response } from "express";
import type { Env } from "../config/env.js";
import {
  cloudinaryAvatarUpload,
  cloudinaryLogoUpload,
  cloudinaryResumeUpload,
} from "../middleware/cloudinaryUpload.js";
import {
  saveUserAvatar,
  saveUserResume,
  saveCompanyLogo,
} from "../services/cloudinary.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../services/token.service.js";
import { ACCESS_COOKIE } from "../utils/cookies.js";

interface UploadFile extends Express.Multer.File {
  path: string; // Cloudinary secure URL
  secure_url?: string;
  url?: string;
}

/**
 * Resolves the authenticated user ID from access cookie, Authorization header, or body/query for testing.
 */
async function resolveUserId(req: Request, env?: Env): Promise<string> {
  // 1. If requireAuth already attached req.auth
  if (req.auth?.userId) return req.auth.userId;

  // 2. Access cookie check
  const token =
    req.cookies?.[ACCESS_COOKIE] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (token && env?.ACCESS_TOKEN_SECRET) {
    try {
      const claims = await verifyAccessToken(token, env.ACCESS_TOKEN_SECRET);
      if (claims?.userId) return claims.userId;
    } catch {
      // ignore token verification error and fallback
    }
  }

  // 3. Explicit userId in body or headers (supports programmatic test callers)
  const explicitUserId =
    (req.body && typeof req.body.userId === "string" && req.body.userId) ||
    (typeof req.headers["x-user-id"] === "string" && req.headers["x-user-id"]) ||
    (typeof req.query["userId"] === "string" && req.query["userId"]);

  if (explicitUserId) return explicitUserId;

  throw AppError.unauthenticated("Authentication required to upload files");
}

export function createCloudinaryUploadRouter(deps?: { env?: Env }): Router {
  const router = Router();

  /**
   * 1. Upload Avatar
   * POST /api/v1/upload/avatar
   * Uploads avatar to Cloudinary, deletes old photo from Cloudinary, and saves in User.avatarUrl
   */
  router.post(
    "/avatar",
    cloudinaryAvatarUpload,
    asyncHandler(async (req: Request, res: Response) => {
      const file = req.file as UploadFile | undefined;
      if (!file) throw AppError.badRequest("No image uploaded. Expected field: avatar or file");

      const fileUrl = file.path || file.secure_url || file.url;
      if (!fileUrl) throw AppError.badRequest("Cloudinary did not return a valid file URL");

      const userId = await resolveUserId(req, deps?.env);
      const avatarUrl = await saveUserAvatar(userId, fileUrl);

      sendSuccess(res, {
        avatarUrl,
        message: "Avatar uploaded and saved to User.avatarUrl successfully",
      });
    }),
  );

  /**
   * 2. Upload Resume
   * POST /api/v1/upload/resume
   * Uploads resume to Cloudinary, deletes old resume from Cloudinary, and saves in User.resumeUrl
   */
  router.post(
    "/resume",
    cloudinaryResumeUpload,
    asyncHandler(async (req: Request, res: Response) => {
      const file = req.file as UploadFile | undefined;
      if (!file) throw AppError.badRequest("No resume document uploaded. Expected field: resume or file");

      const fileUrl = file.path || file.secure_url || file.url;
      if (!fileUrl) throw AppError.badRequest("Cloudinary did not return a valid file URL");

      const userId = await resolveUserId(req, deps?.env);
      const resumeUrl = await saveUserResume(userId, fileUrl, file.originalname);

      sendSuccess(res, {
        resumeUrl,
        message: "Resume uploaded and saved to User.resumeUrl successfully",
      });
    }),
  );

  /**
   * 3. Upload Logo
   * POST /api/v1/upload/logo
   * Uploads company logo to Cloudinary, deletes old logo from Cloudinary, and saves in Company.logoUrl
   */
  router.post(
    "/logo",
    cloudinaryLogoUpload,
    asyncHandler(async (req: Request, res: Response) => {
      const file = req.file as UploadFile | undefined;
      if (!file) throw AppError.badRequest("No logo image uploaded. Expected field: logo or file");

      const fileUrl = file.path || file.secure_url || file.url;
      if (!fileUrl) throw AppError.badRequest("Cloudinary did not return a valid file URL");

      // Can specify companyId or fallback to userId (company owner)
      const targetCompanyId =
        (req.body && typeof req.body.companyId === "string" && req.body.companyId) ||
        (typeof req.query["companyId"] === "string" && req.query["companyId"]);

      const ownerOrCompanyId = targetCompanyId || (await resolveUserId(req, deps?.env));
      const result = await saveCompanyLogo(ownerOrCompanyId, fileUrl);

      sendSuccess(res, {
        companyId: result.companyId,
        logoUrl: result.logoUrl,
        message: "Company logo uploaded and saved to Company.logoUrl successfully",
      });
    }),
  );

  return router;
}
