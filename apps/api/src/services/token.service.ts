import { SignJWT, jwtVerify } from "jose";

/**
 * Short-lived access tokens (JWT, HS256). Each token names the user (sub) and the
 * session (sid). Every protected request also checks that the session is still
 * active, so logout and suspension take effect immediately, not when the token expires.
 */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const ISSUER = "hireloop-api";
const AUDIENCE = "hireloop-web";

function keyFor(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export interface AccessTokenClaims {
  userId: string;
  sessionId: string;
}

export async function signAccessToken(claims: AccessTokenClaims, secret: string): Promise<string> {
  return new SignJWT({ sid: claims.sessionId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(keyFor(secret));
}

/** Returns the claims, or null when the token is malformed, expired, or signed with another key. */
export async function verifyAccessToken(
  token: string,
  secret: string,
): Promise<AccessTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, keyFor(secret), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || typeof payload["sid"] !== "string") return null;
    return { userId: payload.sub, sessionId: payload["sid"] };
  } catch {
    return null;
  }
}
