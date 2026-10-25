import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@hireloop/shared";
import type { Env } from "../config/env.js";
import { loadAuthUser } from "../services/auth.service.js";
import { isSessionActive } from "../services/session.service.js";
import { verifyAccessToken } from "../services/token.service.js";
import { ACCESS_COOKIE } from "../utils/cookies.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Authenticates a request from the access cookie. Three checks run on every
 * request: the JWT is valid, its session is still active (so logout and
 * suspension take effect at once), and the user is still active.
 */
export function requireAuth(env: Pick<Env, "ACCESS_TOKEN_SECRET">) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[ACCESS_COOKIE];
    if (typeof token !== "string" || token.length === 0) {
      throw AppError.unauthenticated();
    }

    const claims = await verifyAccessToken(token, env.ACCESS_TOKEN_SECRET);
    if (!claims) throw AppError.unauthenticated("Your session has expired. Sign in again.");

    const active = await isSessionActive(claims.sessionId, claims.userId);
    if (!active) throw AppError.unauthenticated("Your session has ended. Sign in again.");

    const user = await loadAuthUser(claims.userId);
    if (!user) throw AppError.unauthenticated();
    if (user.status === "suspended") throw AppError.accountSuspended();
    if (user.status !== "active") throw AppError.unauthenticated();

    req.auth = { userId: claims.userId, sessionId: claims.sessionId, user };
    next();
  });
}

/** Must follow requireAuth. Allows the request when the user has at least one of the roles. */
export function requireRole(...allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const roles = req.auth?.user.roles ?? [];
    if (!allowed.some((role) => roles.includes(role))) {
      next(AppError.forbidden());
      return;
    }
    next();
  };
}
