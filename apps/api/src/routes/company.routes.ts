import { Router } from "express";
import type { Env } from "../config/env.js";
import { createCompanyController } from "../controllers/company.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logoUpload } from "../middleware/upload.js";

export function createCompanyRouter(deps: { env: Env }): Router {
  const router = Router();
  const c = createCompanyController();

  // Recruiter routes (must come before /:slug so "me" is not matched as a slug)
  router.get("/me/profile", requireAuth(deps.env), requireRole("recruiter", "admin"), c.getMine);
  router.post("/", requireAuth(deps.env), requireRole("recruiter", "admin"), c.register);
  router.patch("/me/profile", requireAuth(deps.env), requireRole("recruiter", "admin"), c.updateMine);
  router.post(
    "/:companyId/logo",
    requireAuth(deps.env),
    requireRole("recruiter", "admin"),
    logoUpload,
    c.uploadLogo,
  );

  // Public routes
  router.get("/", c.listPublic);
  router.get("/:slug", c.getBySlug);

  return router;
}

export function createAdminCompanyRouter(deps: { env: Env }): Router {
  const router = Router();
  const c = createCompanyController();

  router.use(requireAuth(deps.env), requireRole("admin"));

  router.get("/", c.listAdmin);
  router.post("/:companyId/review", c.review);

  return router;
}

