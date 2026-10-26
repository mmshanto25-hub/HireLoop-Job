import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const savedJobSchema = new Schema(
  {
    seekerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
  },
  { timestamps: true },
);

savedJobSchema.index({ seekerId: 1, jobId: 1 }, { unique: true });
savedJobSchema.index({ seekerId: 1, createdAt: -1 });

export type SavedJobAttributes = InferSchemaType<typeof savedJobSchema>;
export type SavedJobDocument = HydratedDocument<SavedJobAttributes>;

export const SavedJob = model<SavedJobAttributes>("SavedJob", savedJobSchema);

