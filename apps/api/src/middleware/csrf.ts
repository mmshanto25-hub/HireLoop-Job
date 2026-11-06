import type { NextFunction, Request, Response } from "express";
import type { Env } from "../config/env.js";
import { ACCESS_COOKIE, CSRF_COOKIE, REFRESH_COOKIE } from "../utils/cookies.js";
import { AppError } from "../utils/AppError.js";
import { safeEqual } from "../utils/crypto.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF defense for cookie-authenticated requests.
 *
 * 1. Origin check: unsafe methods that send an Origin header must come from
 *    the web app or the API itself.
 * 2. Double-submit token: when auth cookies are present, the X-CSRF-Token
 *    header must match the hl_csrf cookie. A cross-site page cannot read that
 *    cookie, so it cannot forge the header.
 */
export function csrfProtection(env: Pick<Env, "WEB_URL" | "API_URL">) {
  const allowedOrigins = new Set([env.WEB_URL, env.API_URL]);

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }

    const origin = req.get("origin");
    const isTrustedOrigin =
      origin !== undefined &&
      (allowedOrigins.has(origin) ||
        (env.WEB_URL.includes("vercel.app") && origin.endsWith(".vercel.app")));

    if (origin !== undefined && !isTrustedOrigin) {
      next(AppError.forbidden("This request came from an untrusted origin."));
      return;
    }

    // Auth entry routes establish a new session and must never fail because of stale cookies.
    const isAuthRoute =
      req.path.includes("/auth/login") ||
      req.path.includes("/auth/register") ||
      req.path.includes("/auth/forgot-password") ||
      req.path.includes("/auth/reset-password");

    if (isAuthRoute) {
      next();
      return;
    }

    const hasAuthCookie = Boolean(req.cookies?.[ACCESS_COOKIE] || req.cookies?.[REFRESH_COOKIE]);
    if (!hasAuthCookie) {
      next();
      return;
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE];
    const headerToken = req.get("x-csrf-token");

    // For trusted cross-site origins (e.g. Vercel frontend calling Render backend),
    // document.cookie cannot read cross-domain cookies. If origin is verified, allow.
    if (isTrustedOrigin && !headerToken) {
      next();
      return;
    }

    if (
      typeof cookieToken !== "string" ||
      typeof headerToken !== "string" ||
      !safeEqual(cookieToken, headerToken)
    ) {
      next(
        AppError.forbidden("Security token is missing or invalid. Refresh the page and try again."),
      );
      return;
    }
    next();
  };
}
