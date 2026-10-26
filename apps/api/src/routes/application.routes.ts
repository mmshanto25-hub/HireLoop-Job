import { Router } from "express";
import type { Env } from "../config/env.js";
import type { Logger } from "../utils/logger.js";
import { createApplicationController } from "../controllers/application.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export function createApplicationRouter(deps: { env: Env; logger: Logger }): Router {
  const router = Router();
  const c = createApplicationController(deps);

  // All application endpoints require authentication
  router.use(requireAuth(deps.env));

  // Seeker application operations
  router.get("/me", requireRole("seeker", "admin"), c.listMine);
  router.post("/:applicationId/withdraw", requireRole("seeker", "admin"), c.withdraw);

  // Recruiter applicant management
  router.patch("/:applicationId/status", requireRole("recruiter", "admin"), c.updateStatus);

  // Authorized resume streaming (seeker or job recruiter)
  router.get("/:applicationId/resume", c.downloadResume);

  return router;
}

