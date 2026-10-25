import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * Append-only record of privileged actions (status and role changes). Entries
 * are never updated or deleted by the application.
 */
const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, maxlength: 100 },
    targetType: { type: String, required: true, maxlength: 50 },
    targetId: { type: String, required: true, maxlength: 100 },
    details: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

export type AuditLogAttributes = InferSchemaType<typeof auditLogSchema>;

export const AuditLogModel = model("AuditLog", auditLogSchema);
