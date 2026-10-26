import { Router } from "express";
import type { Env } from "../config/env.js";
import { createSavedJobController } from "../controllers/saved-job.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export function createSavedJobRouter(deps: { env: Env }): Router {
  const router = Router();
  const c = createSavedJobController();

  router.use(requireAuth(deps.env), requireRole("seeker", "admin"));

  router.get("/", c.list);
  router.get("/ids", c.getIds);
  router.post("/:jobId", c.save);
  router.delete("/:jobId", c.unsave);

  return router;
}

