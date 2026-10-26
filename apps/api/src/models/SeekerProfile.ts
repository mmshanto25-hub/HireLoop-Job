import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const seekerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    headline: { type: String, trim: true, maxlength: 120, default: null },
    bio: { type: String, trim: true, maxlength: 2000, default: null },
    skills: { type: [String], default: [] },
    location: { type: String, trim: true, maxlength: 100, default: null },
    phone: { type: String, trim: true, maxlength: 20, default: null },
    socialLinks: {
      linkedin: { type: String, default: null },
      github: { type: String, default: null },
      portfolio: { type: String, default: null },
    },
    resumeObjectKey: { type: String, default: null },
    resumeFileName: { type: String, default: null },
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
    emailPreferences: {
      applicationUpdates: { type: Boolean, default: true },
      jobAlerts: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    jobAlertPreferences: {
      categories: { type: [String], default: [] },
      jobTypes: { type: [String], default: [] },
      locations: { type: [String], default: [] },
      remote: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

seekerProfileSchema.index({ skills: 1 });
seekerProfileSchema.index({ location: 1 });

export type SeekerProfileAttributes = InferSchemaType<typeof seekerProfileSchema>;
export type SeekerProfileDocument = HydratedDocument<SeekerProfileAttributes>;

export function calculateSeekerCompleteness(
  profile: Partial<SeekerProfileAttributes>,
  hasAvatar: boolean,
): number {
  let score = 0;
  if (hasAvatar) score += 15;
  if (profile.headline && profile.headline.trim().length > 0) score += 15;
  if (profile.bio && profile.bio.trim().length > 0) score += 15;
  if (profile.skills && profile.skills.length >= 3) score += 20;
  else if (profile.skills && profile.skills.length > 0) score += 10;
  if (profile.location && profile.location.trim().length > 0) score += 10;
  if (profile.phone && profile.phone.trim().length > 0) score += 10;
  if (profile.resumeObjectKey) score += 15;
  return Math.min(100, score);
}

export const SeekerProfileModel = model("SeekerProfile", seekerProfileSchema);
