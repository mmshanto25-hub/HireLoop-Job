import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { USER_ROLES, USER_STATUSES, type UserRole, type UserStatus } from "@hireloop/shared";
import type { Env } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { changeUserRoles, changeUserStatus } from "../services/admin-users.service.js";
import {
  getAdminOverview,
  listAdminUsers,
  listAdminJobs,
  toggleJobFeatured,
  deleteJobAdmin,
  getAdminPayments,
  exportAdminPaymentsCsv,
} from "../services/admin.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

const idParam = z.string().regex(/^[a-f0-9]{24}$/, "Invalid user id");

const statusBody = z.object({ status: z.enum(USER_STATUSES) as z.ZodType<UserStatus> }).strict();

const rolesBody = z
  .object({
    roles: z
      .array(z.enum(USER_ROLES) as z.ZodType<UserRole>)
      .min(1, "Assign at least one role")
      .max(USER_ROLES.length),
  })
  .strict();

/**
 * Mounted at /api/v1/admin. Admin-only. Every endpoint requires a valid
 * session and the admin role, and every change is written to the audit log.
 */
export function createAdminRouter(deps: { env: Pick<Env, "ACCESS_TOKEN_SECRET"> }): Router {
  const router = Router();
  router.use(requireAuth(deps.env), requireRole("admin"));

  // Overview stats
  router.get(
    "/overview",
    asyncHandler(async (_req: Request, res: Response) => {
      const overview = await getAdminOverview();
      sendSuccess(res, overview);
    }),
  );

  // User management
  router.get(
    "/users",
    asyncHandler(async (req: Request, res: Response) => {
      const q = typeof req.query["q"] === "string" ? req.query["q"] : undefined;
      const role = typeof req.query["role"] === "string" ? req.query["role"] : undefined;
      const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
      const page = req.query["page"] ? Number(req.query["page"]) : undefined;
      const limit = req.query["limit"] ? Number(req.query["limit"]) : undefined;

      const result = await listAdminUsers({ q, role, status, page, limit });
      sendSuccess(res, result);
    }),
  );

  router.patch(
    "/users/:id/status",
    asyncHandler(async (req: Request, res: Response) => {
      const id = idParam.parse(req.params["id"]);
      const { status } = statusBody.parse(req.body);
      const result = await changeUserStatus(req.auth!.userId, id, status);
      sendSuccess(res, result);
    }),
  );

  router.put(
    "/users/:id/roles",
    asyncHandler(async (req: Request, res: Response) => {
      const id = idParam.parse(req.params["id"]);
      const { roles } = rolesBody.parse(req.body);
      const result = await changeUserRoles(req.auth!.userId, id, roles);
      sendSuccess(res, result);
    }),
  );

  // Job moderation
  router.get(
    "/jobs",
    asyncHandler(async (req: Request, res: Response) => {
      const q = typeof req.query["q"] === "string" ? req.query["q"] : undefined;
      const category = typeof req.query["category"] === "string" ? req.query["category"] : undefined;
      const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
      const page = req.query["page"] ? Number(req.query["page"]) : undefined;
      const limit = req.query["limit"] ? Number(req.query["limit"]) : undefined;

      const result = await listAdminJobs({ q, category, status, page, limit });
      sendSuccess(res, result);
    }),
  );

  router.patch(
    "/jobs/:id/feature",
    asyncHandler(async (req: Request, res: Response) => {
      const id = idParam.parse(req.params["id"]);
      const result = await toggleJobFeatured(req.auth!.userId, id);
      sendSuccess(res, result);
    }),
  );

  router.delete(
    "/jobs/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const id = idParam.parse(req.params["id"]);
      const result = await deleteJobAdmin(req.auth!.userId, id);
      sendSuccess(res, result);
    }),
  );

  // Payments & reporting
  router.get(
    "/payments",
    asyncHandler(async (_req: Request, res: Response) => {
      const result = await getAdminPayments();
      sendSuccess(res, result);
    }),
  );

  router.get(
    "/payments/export",
    asyncHandler(async (_req: Request, res: Response) => {
      const csv = await exportAdminPaymentsCsv();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="payments-export.csv"');
      res.status(200).send(csv);
    }),
  );

  return router;
}
