import type { CookieOptions, Response } from "express";
import type { Env } from "../config/env.js";

/**
 * Cookie names and attributes for authentication. The access and refresh
 * cookies are HTTP-only, so JavaScript cannot read them. The CSRF cookie is
 * readable on purpose, because the web app echoes it in a header.
 */
export const ACCESS_COOKIE = "hl_access";
export const REFRESH_COOKIE = "hl_refresh";
export const CSRF_COOKIE = "hl_csrf";
export const OAUTH_STATE_COOKIE = "hl_oauth";

export const ACCESS_COOKIE_MAX_AGE_MS = 15 * 60 * 1000;
export const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function baseOptions(env: Pick<Env, "NODE_ENV">): CookieOptions {
  const isProd = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
}

export function setSessionCookies(
  res: Response,
  env: Pick<Env, "NODE_ENV">,
  tokens: { accessToken: string; refreshValue: string },
): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions(env),
    maxAge: ACCESS_COOKIE_MAX_AGE_MS,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshValue, {
    ...baseOptions(env),
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

export function clearSessionCookies(res: Response, env: Pick<Env, "NODE_ENV">): void {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions(env) });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions(env), path: "/" });
}

export function setCsrfCookie(res: Response, env: Pick<Env, "NODE_ENV">, token: string): void {
  const isProd = env.NODE_ENV === "production";
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

export function setOauthStateCookie(
  res: Response,
  env: Pick<Env, "NODE_ENV">,
  value: string,
): void {
  const isProd = env.NODE_ENV === "production";
  res.cookie(OAUTH_STATE_COOKIE, value, {
    ...baseOptions(env),
    sameSite: isProd ? "none" : "lax",
    path: "/api/v1/auth/google",
    maxAge: 10 * 60 * 1000,
  });
}

export function clearOauthStateCookie(res: Response, env: Pick<Env, "NODE_ENV">): void {
  const isProd = env.NODE_ENV === "production";
  res.clearCookie(OAUTH_STATE_COOKIE, {
    ...baseOptions(env),
    sameSite: isProd ? "none" : "lax",
    path: "/api/v1/auth/google",
  });
}
