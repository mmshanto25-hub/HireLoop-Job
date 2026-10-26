import { Router } from "express";
import type { Env } from "../config/env.js";
import type { Logger } from "../utils/logger.js";
import { createJobController } from "../controllers/job.controller.js";
import { createApplicationController } from "../controllers/application.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export function createJobRouter(deps: { env: Env; logger?: Logger }): Router {
  const router = Router();
  const c = createJobController();
  const logger = deps.logger ?? (console as unknown as Logger);
  const appCtrl = createApplicationController({ env: deps.env, logger });

  // Recruiter job operations (must come before /:slugOrId so "recruiter" is not matched as a slug/id)
  router.get("/recruiter/mine", requireAuth(deps.env), requireRole("recruiter", "admin"), c.listMine);
  router.post("/", requireAuth(deps.env), requireRole("recruiter", "admin"), c.create);
  router.patch("/:jobId", requireAuth(deps.env), requireRole("recruiter", "admin"), c.update);
  router.post("/:jobId/publish", requireAuth(deps.env), requireRole("recruiter", "admin"), c.publish);
  router.post("/:jobId/close", requireAuth(deps.env), requireRole("recruiter", "admin"), c.close);
  router.post("/:jobId/reopen", requireAuth(deps.env), requireRole("recruiter", "admin"), c.reopen);
  router.delete("/:jobId", requireAuth(deps.env), requireRole("recruiter", "admin"), c.deleteJob);

  // Job Applications
  router.post(
    "/:jobId/applications",
    requireAuth(deps.env),
    requireRole("seeker", "admin"),
    appCtrl.apply,
  );
  router.get(
    "/:jobId/applications",
    requireAuth(deps.env),
    requireRole("recruiter", "admin"),
    appCtrl.listJobApplicants,
  );

  // Public job browsing
  router.get("/", c.search);
  router.get("/stats/public", c.getPublicStats);
  router.get("/featured", c.getFeatured);
  router.get("/:slugOrId", c.getBySlugOrId);
  router.get("/:slugOrId/similar", c.getSimilar);

  return router;
}
