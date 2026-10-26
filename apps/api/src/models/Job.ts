import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { JOB_STATUSES, JOB_TYPES } from "@hireloop/shared";

const jobSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
    },
    category: { type: String, required: true, maxlength: 50 },
    skills: { type: [String], default: [] },
    jobType: { type: String, enum: JOB_TYPES, required: true },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    currency: { type: String, default: "USD", maxlength: 5 },
    salaryPeriod: { type: String, default: "yearly", maxlength: 10 },
    city: { type: String, trim: true, maxlength: 100, default: null },
    country: { type: String, trim: true, maxlength: 100, default: null },
    isRemote: { type: Boolean, default: false },
    deadline: { type: Date, default: null },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    responsibilities: { type: String, trim: true, maxlength: 5000, default: null },
    requirements: { type: String, trim: true, maxlength: 5000, default: null },
    benefits: { type: String, trim: true, maxlength: 5000, default: null },
    status: { type: String, enum: JOB_STATUSES, default: "draft", required: true },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ jobType: 1, status: 1 });
jobSchema.index({ isRemote: 1, status: 1 });
jobSchema.index({ country: 1, city: 1, status: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ title: "text", description: "text" });

export type JobAttributes = InferSchemaType<typeof jobSchema>;
export type JobDocument = HydratedDocument<JobAttributes>;

export const JobModel = model("Job", jobSchema);
