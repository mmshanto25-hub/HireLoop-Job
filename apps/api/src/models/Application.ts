import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { APPLICATION_STATUSES } from "@hireloop/shared";

const applicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    seekerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coverLetter: { type: String, trim: true, maxlength: 4000, default: null },
    resumeObjectKey: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "applied",
      required: true,
      index: true,
    },
    interviewAt: { type: Date, default: null },
    recruiterNotes: { type: String, trim: true, maxlength: 2000, default: null },
  },
  { timestamps: true },
);

// Enforce one application per seeker per job
applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });
applicationSchema.index({ seekerId: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, status: 1, createdAt: -1 });

export type ApplicationAttributes = InferSchemaType<typeof applicationSchema>;
export type ApplicationDocument = HydratedDocument<ApplicationAttributes>;

export const Application = model<ApplicationAttributes>("Application", applicationSchema);

