import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * Single-use tokens for email verification and password reset. Only a hash of
 * the token is stored. Documents expire automatically through a TTL index.
 */
const oneTimeTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: { type: String, enum: ["email_verification", "password_reset"], required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

oneTimeTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
oneTimeTokenSchema.index({ userId: 1, purpose: 1, consumedAt: 1 });

export type OneTimeTokenAttributes = InferSchemaType<typeof oneTimeTokenSchema>;

export const OneTimeTokenModel = model("OneTimeToken", oneTimeTokenSchema);
