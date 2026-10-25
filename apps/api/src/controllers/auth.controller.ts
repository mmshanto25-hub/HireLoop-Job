import type { Request, Response } from "express";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  isSafeInternalPath,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type UserRole,
} from "@hireloop/shared";
import type { Env } from "../config/env.js";
import type { Logger } from "../utils/logger.js";
import type { EmailSender } from "../services/email.service.js";
import * as auth from "../services/auth.service.js";
import { buildGoogleAuthUrl, exchangeGoogleCode } from "../services/google.service.js";
import { verifyAccessToken } from "../services/token.service.js";
import { revokeSession } from "../services/session.service.js";
import { signOauthState, verifyOauthState } from "../utils/oauthState.js";
import {
  ACCESS_COOKIE,
  OAUTH_STATE_COOKIE,
  REFRESH_COOKIE,
  clearOauthStateCookie,
  clearSessionCookies,
  setCsrfCookie,
  setOauthStateCookie,
  setSessionCookies,
} from "../utils/cookies.js";
import { generateToken } from "../utils/crypto.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export interface AuthControllerDeps {
  env: Env;
  email: EmailSender;
  logger: Logger;
}

const GENERIC_ACCEPTED = "If that email can be used, we have sent instructions. Check your inbox.";

/** Sets the access, refresh, and CSRF cookies for a new or rotated session. */
function applySession(
  res: Response,
  env: Env,
  issued: { accessToken: string; refreshValue: string },
) {
  setSessionCookies(res, env, issued);
  setCsrfCookie(res, env, generateToken(24));
}

function refreshSessionId(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.indexOf(".");
  return dot > 0 ? value.slice(0, dot) : null;
}

function safeRole(value: unknown): UserRole {
  return value === "recruiter" ? "recruiter" : "seeker";
}

function googleFailureRedirect(env: Env, reason: string): string {
  return `${env.WEB_URL}/login?error=${encodeURIComponent(reason)}`;
}

export function createAuthController(deps: AuthControllerDeps) {
  const { env, logger } = deps;
  const svc = { env, email: deps.email, logger };

  const register = asyncHandler(async (req: Request, res: Response) => {
    const input = registerSchema.parse(req.body);
    await auth.register(svc, input);
    sendSuccess(res, { message: GENERIC_ACCEPTED }, { status: 202 });
  });

  const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = verifyEmailSchema.parse(req.body);
    await auth.verifyEmail(svc, token);
    sendSuccess(res, { verified: true });
  });

  const resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email } = resendVerificationSchema.parse(req.body);
    await auth.resendVerification(svc, email);
    sendSuccess(res, { message: GENERIC_ACCEPTED }, { status: 202 });
  });

  const login = asyncHandler(async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);
    const result = await auth.login(svc, input, req.get("user-agent"));
    applySession(res, env, result.session);
    sendSuccess(res, { user: result.user });
  });

  const refresh = asyncHandler(async (req: Request, res: Response) => {
    const value = req.cookies?.[REFRESH_COOKIE];
    const session = await auth.refresh(svc, typeof value === "string" ? value : undefined);
    const user = await auth.loadAuthUser(session.userId);
    if (!user) throw AppError.unauthenticated();
    applySession(res, env, session);
    sendSuccess(res, { user });
  });

  const logout = asyncHandler(async (req: Request, res: Response) => {
    // Revoke the session named by the access token and by the refresh cookie.
    const access = req.cookies?.[ACCESS_COOKIE];
    if (typeof access === "string") {
      const claims = await verifyAccessToken(access, env.ACCESS_TOKEN_SECRET);
      if (claims) await auth.logout(svc, claims.sessionId);
    }
    const refreshValue = req.cookies?.[REFRESH_COOKIE];
    const fromRefresh = refreshSessionId(
      typeof refreshValue === "string" ? refreshValue : undefined,
    );
    if (fromRefresh) await revokeSession(fromRefresh, "logout");

    clearSessionCookies(res, env);
    sendSuccess(res, { loggedOut: true });
  });

  const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    await auth.forgotPassword(svc, email);
    sendSuccess(res, { message: GENERIC_ACCEPTED }, { status: 202 });
  });

  const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = resetPasswordSchema.parse(req.body);
    await auth.resetPassword(svc, token, password);
    clearSessionCookies(res, env);
    sendSuccess(res, { reset: true });
  });

  const changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.auth) throw AppError.unauthenticated();
    const input = changePasswordSchema.parse(req.body);
    await auth.changePassword(svc, req.auth.userId, req.auth.sessionId, input);
    sendSuccess(res, { changed: true });
  });

  const me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.auth) throw AppError.unauthenticated();
    sendSuccess(res, { user: req.auth.user });
  });

  /** Starts Google sign-in. The state and nonce go into a signed, short-lived cookie. */
  const googleStart = asyncHandler(async (req: Request, res: Response) => {
    if (!env.GOOGLE_CLIENT_ID) {
      res.redirect(googleFailureRedirect(env, "google_unavailable"));
      return;
    }
    const role = safeRole(req.query["role"]);
    const next =
      typeof req.query["next"] === "string" && isSafeInternalPath(req.query["next"])
        ? req.query["next"]
        : "/dashboard";

    const state = generateToken(24);
    const nonce = generateToken(24);
    const cookieValue = signOauthState(
      { state, nonce, role, next, exp: Date.now() + 10 * 60 * 1000 },
      env.SESSION_SECRET,
    );
    setOauthStateCookie(res, env, cookieValue);
    res.redirect(buildGoogleAuthUrl(env, state, nonce));
  });

  const googleCallback = asyncHandler(async (req: Request, res: Response) => {
    const stateCookie = req.cookies?.[OAUTH_STATE_COOKIE];
    clearOauthStateCookie(res, env);

    const payload =
      typeof stateCookie === "string"
        ? verifyOauthState(stateCookie, env.SESSION_SECRET, Date.now())
        : null;
    const code = req.query["code"];
    const state = req.query["state"];

    if (
      !payload ||
      typeof code !== "string" ||
      typeof state !== "string" ||
      state !== payload.state
    ) {
      res.redirect(googleFailureRedirect(env, "google_state"));
      return;
    }

    try {
      const profile = await exchangeGoogleCode(env, code, payload.nonce);
      const result = await auth.signInWithGoogle(
        svc,
        profile,
        safeRole(payload.role),
        req.get("user-agent"),
      );
      applySession(res, env, result.session);
      const next = isSafeInternalPath(payload.next) ? payload.next : "/dashboard";
      res.redirect(`${env.WEB_URL}${next}`);
    } catch (err) {
      if (err instanceof AppError && err.code === "ACCOUNT_SUSPENDED") {
        res.redirect(googleFailureRedirect(env, "suspended"));
        return;
      }
      logger.warn(
        { err: err instanceof Error ? err.message : String(err) },
        "Google sign-in failed",
      );
      res.redirect(googleFailureRedirect(env, "google_failed"));
    }
  });

  return {
    register,
    verifyEmail,
    resendVerification,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    me,
    googleStart,
    googleCallback,
  };
}
