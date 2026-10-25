import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * One row per signed-in browser session. The document _id is the session ID
 * (sid) that access tokens carry. The refresh secret is never stored; only its
 * SHA-256 hash is. Rotation replaces the hash, so a reused old secret is
 * detectable.
 */
const refreshSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    /** Why the session was revoked, for security review (logout, reuse, password_change, suspended). */
    revokeReason: { type: String, default: null, maxlength: 64 },
    lastUsedAt: { type: Date, default: null },
    userAgent: { type: String, default: null, maxlength: 300 },
  },
  { timestamps: true },
);

// MongoDB removes expired sessions automatically (TTL index).
refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshSessionAttributes = InferSchemaType<typeof refreshSessionSchema>;

export const RefreshSessionModel = model("RefreshSession", refreshSessionSchema);
