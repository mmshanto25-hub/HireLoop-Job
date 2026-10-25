import { Schema, model, type InferSchemaType } from "mongoose";
import { USER_ROLES } from "@hireloop/shared";

/**
 * Authorization roles live in their own collection, not on the user document,
 * so a role change is a deliberate, auditable write and never a side effect of
 * editing a profile.
 */
const userRoleSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

userRoleSchema.index({ userId: 1, role: 1 }, { unique: true });
userRoleSchema.index({ role: 1 });

export type UserRoleAttributes = InferSchemaType<typeof userRoleSchema>;

export const UserRoleModel = model("UserRole", userRoleSchema);
