import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { AUTH_PROVIDERS, USER_STATUSES } from "@hireloop/shared";

const authProviderSchema = new Schema(
  {
    provider: { type: String, enum: AUTH_PROVIDERS, required: true },
    /** Provider's stable subject ID, for example the Google "sub" claim. Empty for password accounts. */
    providerUserId: { type: String, default: null },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    /** Stored normalised (trimmed, lowercase). The unique index makes duplicate accounts impossible. */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    /** Never returned by default. Only selected explicitly when verifying a password. */
    passwordHash: { type: String, select: false, default: null },
    avatarUrl: { type: String, default: null },
    emailVerifiedAt: { type: Date, default: null },
    status: { type: String, enum: USER_STATUSES, default: "active", required: true },
    authProviders: { type: [authProviderSchema], default: [] },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Only enforce uniqueness for real provider IDs, so password-only accounts
// (which have no provider ID) never collide with each other.
userSchema.index(
  { "authProviders.provider": 1, "authProviders.providerUserId": 1 },
  {
    unique: true,
    partialFilterExpression: { "authProviders.providerUserId": { $type: "string" } },
  },
);
userSchema.index({ status: 1 });

export type UserAttributes = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserAttributes>;

export const UserModel = model("User", userSchema);
