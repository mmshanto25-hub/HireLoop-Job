import type { UserRole } from "@hireloop/shared";
import { hmacHex, safeEqual } from "./crypto.js";

/**
 * Google OAuth state is carried in a signed cookie. It binds the callback to the
 * browser that started sign-in (CSRF protection), carries the nonce that must
 * appear in the ID token (replay protection), and stores the role and return
 * path chosen before the redirect.
 */
export interface OauthStatePayload {
  state: string;
  nonce: string;
  role: UserRole;
  next: string;
  /** Expiry as a Unix time in milliseconds. */
  exp: number;
}

export function signOauthState(payload: OauthStatePayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${hmacHex(body, secret)}`;
}

/** Returns the payload only when the signature is valid and the state has not expired. */
export function verifyOauthState(
  value: string | undefined,
  secret: string,
  now: number = Date.now(),
): OauthStatePayload | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  if (!safeEqual(signature, hmacHex(body, secret))) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as OauthStatePayload;
    if (typeof payload.exp !== "number" || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}
