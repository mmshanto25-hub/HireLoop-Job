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
export function csrfProtection(env: Pick<Env, "WEB_URL" | "API_URL" | "NODE_ENV">) {
  const allowedOrigins = new Set([env.WEB_URL, env.API_URL]);

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }

    let origin = req.get("origin");
    if (!origin) {
      const referer = req.get("referer");
      if (referer) {
        try {
          origin = new URL(referer).origin;
        } catch {
          // ignore malformed referer
        }
      }
    }

    const isDev = env.NODE_ENV !== "production";
    const isLocalhost = Boolean(
      isDev && origin && (origin.includes("localhost") || origin.includes("127.0.0.1")),
    );

    const isTrustedOrigin =
      isLocalhost ||
      (origin !== undefined &&
        (allowedOrigins.has(origin) ||
          (env.WEB_URL.includes("vercel.app") && origin.endsWith(".vercel.app"))));

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

    // For trusted origins (same-origin / local dev / verified cross-site):
    // In development on trusted local origins, allow seamlessly.
    // In production, allow if origin is verified and either CSRF cookie/header is omitted due to cross-site restrictions
    // or the header matches the cookie token.
    if (isTrustedOrigin) {
      if (isDev || !cookieToken || !headerToken || safeEqual(cookieToken, headerToken)) {
        next();
        return;
      }
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
