import { Router, type Request, type Response } from "express";
import type { Env } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getSeekerDashboard,
  getRecruiterDashboard,
  getRecruiterAnalytics,
} from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export function createDashboardRouter(deps: { env: Pick<Env, "ACCESS_TOKEN_SECRET"> }): Router {
  const router = Router();
  router.use(requireAuth(deps.env));

  // Seeker overview metrics & recommendations
  router.get(
    "/seeker",
    requireRole("seeker", "admin"),
    asyncHandler(async (req: Request, res: Response) => {
      const data = await getSeekerDashboard(req.auth!.userId);
      sendSuccess(res, data);
    }),
  );

  // Recruiter overview metrics & pipeline
  router.get(
    "/recruiter",
    requireRole("recruiter", "admin"),
    asyncHandler(async (req: Request, res: Response) => {
      const data = await getRecruiterDashboard(req.auth!.userId);
      sendSuccess(res, data);
    }),
  );

  // Recruiter deep recruitment analytics
  router.get(
    "/recruiter/analytics",
    requireRole("recruiter", "admin"),
    asyncHandler(async (req: Request, res: Response) => {
      const data = await getRecruiterAnalytics(req.auth!.userId);
      sendSuccess(res, data);
    }),
  );

  return router;
}

