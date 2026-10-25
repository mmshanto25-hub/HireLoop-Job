import { OAuth2Client } from "google-auth-library";
import type { Env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import type { GoogleProfile } from "./auth.service.js";

/**
 * Google OpenID Connect (authorization code flow). The state and nonce are
 * generated per request and carried in a signed cookie (see utils/oauthState.ts).
 * We verify the nonce inside the ID token so a token issued for another request
 * cannot be replayed here.
 */

const SCOPES = ["openid", "email", "profile"];

type GoogleEnv = Pick<Env, "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "GOOGLE_CALLBACK_URL">;

function client(env: GoogleEnv): OAuth2Client {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    throw AppError.serviceUnavailable("Google sign-in is not configured.");
  }
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_CALLBACK_URL);
}

export function buildGoogleAuthUrl(env: GoogleEnv, state: string, nonce: string): string {
  return client(env).generateAuthUrl({
    access_type: "online",
    scope: SCOPES,
    state,
    nonce,
    prompt: "select_account",
    include_granted_scopes: false,
  });
}

/**
 * Exchanges the authorization code and returns the verified profile.
 * Throws when the token is invalid, the audience is wrong, or the nonce does not match.
 */
export async function exchangeGoogleCode(
  env: GoogleEnv,
  code: string,
  expectedNonce: string,
): Promise<GoogleProfile> {
  const oauth = client(env);
  const { tokens } = await oauth.getToken(code);
  if (!tokens.id_token) throw new Error("Google did not return an ID token");

  const ticket = await oauth.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Google ID token is missing required claims");
  }
  if (payload.nonce !== expectedNonce) {
    throw new Error("Google ID token nonce mismatch");
  }
  if (payload.iss !== "https://accounts.google.com" && payload.iss !== "accounts.google.com") {
    throw new Error("Google ID token issuer is not accepted");
  }

  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    emailVerified: payload.email_verified === true,
    name: payload.name ?? null,
    picture: payload.picture ?? null,
  };
}
