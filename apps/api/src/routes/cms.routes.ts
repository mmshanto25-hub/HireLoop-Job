import { Router, type Request, type Response } from "express";
import { updateSiteContentSchema } from "@hireloop/shared";
import type { Env } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getPublicSiteContent,
  getAdminSiteContent,
  updateSiteContent,
  resetSiteContent,
} from "../services/cms.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

/**
 * Public CMS Router mounted at /api/v1/content
 */
export function createCmsPublicRouter(): Router {
  const router = Router();

  router.get(
    "/public",
    asyncHandler(async (_req: Request, res: Response) => {
      const content = await getPublicSiteContent();
      sendSuccess(res, content);
    }),
  );

  return router;
}

/**
 * Admin CMS Router mounted at /api/v1/admin/content
 */
export function createCmsAdminRouter(deps: { env: Pick<Env, "ACCESS_TOKEN_SECRET"> }): Router {
  const router = Router();
  router.use(requireAuth(deps.env), requireRole("admin"));

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
      const content = await getAdminSiteContent();
      sendSuccess(res, content);
    }),
  );

  router.put(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const parsed = updateSiteContentSchema.parse(req.body);
      const updated = await updateSiteContent(req.auth!.userId, parsed);
      sendSuccess(res, updated);
    }),
  );

  router.post(
    "/reset",
    asyncHandler(async (req: Request, res: Response) => {
      const reset = await resetSiteContent(req.auth!.userId);
      sendSuccess(res, reset);
    }),
  );

  return router;
}
