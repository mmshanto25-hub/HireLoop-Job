import { Router } from "express";
import type { Env } from "../config/env.js";
import { createProfileController } from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { avatarUpload, resumeUpload } from "../middleware/upload.js";

export function createProfileRouter(deps: { env: Env }): Router {
  const router = Router();
  const c = createProfileController();

  router.use(requireAuth(deps.env));

  router.get("/me", c.getMe);
  router.patch("/me", c.updateMe);
  router.post("/me/avatar", avatarUpload, c.uploadAvatar);
  router.post("/me/resume", resumeUpload, c.uploadResume);
  router.get("/me/resume", c.downloadResume);
  router.delete("/me/resume", c.deleteResume);

  return router;
}

