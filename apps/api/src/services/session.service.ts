import { isValidObjectId } from "mongoose";
import type { Env } from "../config/env.js";
import { RefreshSessionModel } from "../models/index.js";
import { generateToken, sha256Hex } from "../utils/crypto.js";
import { signAccessToken } from "./token.service.js";

/**
 * Refresh sessions. The refresh cookie holds "<sessionId>.<secret>". Only the
 * hash of the secret is stored. Each refresh replaces the secret (rotation).
 * Presenting an old secret means it was copied, so the session is revoked.
 */
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type RevokeReason =
  "logout" | "refresh_reuse" | "password_changed" | "password_reset" | "suspended" | "role_change";

export interface IssuedSession {
  sessionId: string;
  userId: string;
  accessToken: string;
  /** Value for the HTTP-only refresh cookie. */
  refreshValue: string;
}

function splitRefreshValue(value: string): { sessionId: string; secret: string } | null {
  const dot = value.indexOf(".");
  if (dot <= 0 || dot === value.length - 1) return null;
  const sessionId = value.slice(0, dot);
  if (!isValidObjectId(sessionId)) return null;
  return { sessionId, secret: value.slice(dot + 1) };
}

export async function createSession(
  env: Pick<Env, "ACCESS_TOKEN_SECRET">,
  userId: string,
  userAgent: string | undefined,
): Promise<IssuedSession> {
  const secret = generateToken();
  const session = await RefreshSessionModel.create({
    userId,
    refreshTokenHash: sha256Hex(secret),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    lastUsedAt: new Date(),
    userAgent: userAgent?.slice(0, 300) ?? null,
  });

  const sessionId = session.id as string;
  const accessToken = await signAccessToken({ userId, sessionId }, env.ACCESS_TOKEN_SECRET);
  return { sessionId, userId, accessToken, refreshValue: `${sessionId}.${secret}` };
}

/**
 * Exchanges a valid refresh value for a new one. The update is conditional on the
 * current hash, so two concurrent refreshes cannot both succeed. A failed attempt
 * revokes the session, because a mismatch means the old secret was presented.
 * Returns null when the value is not valid.
 */
export async function rotateSession(
  env: Pick<Env, "ACCESS_TOKEN_SECRET">,
  refreshValue: string,
): Promise<IssuedSession | null> {
  const parts = splitRefreshValue(refreshValue);
  if (!parts) return null;

  const now = new Date();
  const newSecret = generateToken();
  const rotated = await RefreshSessionModel.findOneAndUpdate(
    {
      _id: parts.sessionId,
      refreshTokenHash: sha256Hex(parts.secret),
      revokedAt: null,
      expiresAt: { $gt: now },
    },
    {
      $set: {
        refreshTokenHash: sha256Hex(newSecret),
        lastUsedAt: now,
        expiresAt: new Date(now.getTime() + REFRESH_TTL_MS),
      },
    },
    { new: true },
  )
    .select("userId")
    .lean();

  if (!rotated) {
    await RefreshSessionModel.updateOne(
      { _id: parts.sessionId, revokedAt: null },
      { $set: { revokedAt: now, revokeReason: "refresh_reuse" } },
    );
    return null;
  }

  const userId = String(rotated.userId);
  const accessToken = await signAccessToken(
    { userId, sessionId: parts.sessionId },
    env.ACCESS_TOKEN_SECRET,
  );
  return {
    sessionId: parts.sessionId,
    userId,
    accessToken,
    refreshValue: `${parts.sessionId}.${newSecret}`,
  };
}

export async function revokeSession(sessionId: string, reason: RevokeReason): Promise<void> {
  if (!isValidObjectId(sessionId)) return;
  await RefreshSessionModel.updateOne(
    { _id: sessionId, revokedAt: null },
    { $set: { revokedAt: new Date(), revokeReason: reason } },
  );
}

/** Revokes every active session for a user, optionally keeping the current one. */
export async function revokeAllSessions(
  userId: string,
  reason: RevokeReason,
  keepSessionId?: string,
): Promise<number> {
  const filter: Record<string, unknown> = { userId, revokedAt: null };
  if (keepSessionId && isValidObjectId(keepSessionId)) {
    filter["_id"] = { $ne: keepSessionId };
  }
  const result = await RefreshSessionModel.updateMany(filter, {
    $set: { revokedAt: new Date(), revokeReason: reason },
  });
  return result.modifiedCount;
}

/** Used on every protected request. True only when the session exists, is not revoked, and has not expired. */
export async function isSessionActive(sessionId: string, userId: string): Promise<boolean> {
  if (!isValidObjectId(sessionId)) return false;
  const found = await RefreshSessionModel.exists({
    _id: sessionId,
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
  return found !== null;
}
