import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { NOTIFICATION_TYPES } from "@hireloop/shared";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    link: { type: String, trim: true, maxlength: 500, default: null },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export type NotificationAttributes = InferSchemaType<typeof notificationSchema>;
export type NotificationDocument = HydratedDocument<NotificationAttributes>;

export const Notification = model<NotificationAttributes>("Notification", notificationSchema);

