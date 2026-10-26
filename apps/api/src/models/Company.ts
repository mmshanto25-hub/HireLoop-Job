import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { COMPANY_STATUSES } from "@hireloop/shared";

const companySchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    industry: { type: String, required: true, maxlength: 100 },
    website: { type: String, default: null, maxlength: 200 },
    location: { type: String, required: true, trim: true, maxlength: 150 },
    employeeRange: { type: String, required: true, maxlength: 20 },
    logoObjectKey: { type: String, default: null },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: COMPANY_STATUSES, default: "pending", required: true },
    rejectionReason: { type: String, default: null, maxlength: 500 },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

companySchema.index({ status: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ name: "text", description: "text" });

export type CompanyAttributes = InferSchemaType<typeof companySchema>;
export type CompanyDocument = HydratedDocument<CompanyAttributes>;

export const CompanyModel = model("Company", companySchema);
