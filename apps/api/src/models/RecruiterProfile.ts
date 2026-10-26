import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const recruiterProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    jobTitle: { type: String, trim: true, maxlength: 100, default: null },
    phone: { type: String, trim: true, maxlength: 20, default: null },
    socialLinks: {
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
    },
    notificationPreferences: {
      newApplications: { type: Boolean, default: true },
      applicationUpdates: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export type RecruiterProfileAttributes = InferSchemaType<typeof recruiterProfileSchema>;
export type RecruiterProfileDocument = HydratedDocument<RecruiterProfileAttributes>;

export const RecruiterProfileModel = model("RecruiterProfile", recruiterProfileSchema);
