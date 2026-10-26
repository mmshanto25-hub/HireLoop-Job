import { Router } from "express";
import type { Env } from "../config/env.js";
import { createJobController } from "../controllers/job.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export function createJobRouter(deps: { env: Env }): Router {
  const router = Router();
  const c = createJobController();

  // Recruiter job operations (must come before /:slugOrId so "recruiter" is not matched as a slug/id)
  router.get("/recruiter/mine", requireAuth(deps.env), requireRole("recruiter", "admin"), c.listMine);
  router.post("/", requireAuth(deps.env), requireRole("recruiter", "admin"), c.create);
  router.patch("/:jobId", requireAuth(deps.env), requireRole("recruiter", "admin"), c.update);
  router.post("/:jobId/publish", requireAuth(deps.env), requireRole("recruiter", "admin"), c.publish);
  router.post("/:jobId/close", requireAuth(deps.env), requireRole("recruiter", "admin"), c.close);
  router.post("/:jobId/reopen", requireAuth(deps.env), requireRole("recruiter", "admin"), c.reopen);
  router.delete("/:jobId", requireAuth(deps.env), requireRole("recruiter", "admin"), c.deleteJob);

  // Public job browsing
  router.get("/", c.search);
  router.get("/stats/public", c.getPublicStats);
  router.get("/featured", c.getFeatured);
  router.get("/:slugOrId", c.getBySlugOrId);
  router.get("/:slugOrId/similar", c.getSimilar);

  return router;
}

