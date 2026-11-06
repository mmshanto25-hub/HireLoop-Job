import { Router } from "express";
import type { Env } from "../config/env.js";
import { createProfileController } from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.js";
import {
  cloudinaryAvatarUpload,
  cloudinaryResumeUpload,
} from "../middleware/cloudinaryUpload.js";

export function createProfileRouter(deps: { env: Env }): Router {
  const router = Router();
  const c = createProfileController();

  router.use(requireAuth(deps.env));

  router.get("/me", c.getMe);
  router.patch("/me", c.updateMe);
  router.post("/me/avatar", cloudinaryAvatarUpload, c.uploadAvatar);
  router.post("/me/resume", cloudinaryResumeUpload, c.uploadResume);
  router.get("/me/resume", c.downloadResume);
  router.delete("/me/resume", c.deleteResume);

  return router;
}

