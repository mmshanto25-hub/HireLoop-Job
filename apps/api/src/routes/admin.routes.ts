import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { USER_ROLES, USER_STATUSES, type UserRole, type UserStatus } from "@hireloop/shared";
import type { Env } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { changeUserRoles, changeUserStatus } from "../services/admin-users.service.js";
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

  return router;
}
