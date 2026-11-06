import { cloudinary } from "../config/cloudinary.js";
import { UserModel } from "../models/User.js";
import { CompanyModel } from "../models/Company.js";
import { SeekerProfileModel } from "../models/SeekerProfile.js";
import { AppError } from "../utils/AppError.js";

/**
 * Extracts the public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/cloudname/image/upload/v12345/hireloop/avatars/abc.jpg
 * Returns: hireloop/avatars/abc
 */
export function extractCloudinaryPublicId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("cloudinary.com")) return null;

  const cleanUrl = url.split("?")[0]?.split("#")[0] ?? "";
  const match = cleanUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match || !match[1]) return null;

  const withExt = match[1];
  const lastDot = withExt.lastIndexOf(".");
  if (lastDot > 0) {
    return withExt.substring(0, lastDot);
  }
  return withExt;
}

/**
 * Deletes a file from Cloudinary given its URL or public_id.
 */
export async function deleteFromCloudinary(
  urlOrPublicId?: string | null,
  resourceType: "image" | "raw" | "auto" = "image",
): Promise<void> {
  if (!urlOrPublicId) return;
  try {
    const publicId = urlOrPublicId.includes("cloudinary.com")
      ? extractCloudinaryPublicId(urlOrPublicId)
      : urlOrPublicId;

    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
  } catch (err) {
    // Log failure but don't break the caller flow
    console.error("Cloudinary file deletion failed:", err);
  }
}

/**
 * 1. Upload Avatar:
 * Deletes old avatar from Cloudinary if exists, and updates User.avatarUrl.
 */
export async function saveUserAvatar(userId: string, newAvatarUrl: string): Promise<string> {
  const user = await UserModel.findById(userId);
  if (!user) throw AppError.unauthenticated();

  // If old avatar was in Cloudinary, delete it
  if (user.avatarUrl && user.avatarUrl !== newAvatarUrl) {
    await deleteFromCloudinary(user.avatarUrl, "image");
  }

  user.avatarUrl = newAvatarUrl;
  await user.save();

  return newAvatarUrl;
}

/**
 * 2. Upload Resume:
 * Deletes old resume from Cloudinary if exists, and updates User.resumeUrl.
 */
export async function saveUserResume(userId: string, newResumeUrl: string, originalFileName?: string): Promise<string> {
  const user = await UserModel.findById(userId);
  if (!user) throw AppError.unauthenticated();

  // If old resume was in Cloudinary, delete it
  if (user.resumeUrl && user.resumeUrl !== newResumeUrl) {
    await deleteFromCloudinary(user.resumeUrl, "raw");
  }

  user.resumeUrl = newResumeUrl;
  await user.save();

  // Also sync with seeker profile if user is a seeker
  const seeker = await SeekerProfileModel.findOne({ userId });
  if (seeker) {
    seeker.resumeObjectKey = newResumeUrl;
    if (originalFileName) seeker.resumeFileName = originalFileName;
    await seeker.save();
  }

  return newResumeUrl;
}

/**
 * 3. Upload Logo:
 * Deletes old logo from Cloudinary if exists, and updates Company.logoUrl.
 */
export async function saveCompanyLogo(
  ownerIdOrCompanyId: string,
  newLogoUrl: string,
): Promise<{ companyId: string; logoUrl: string }> {
  // Find by ownerId first, or by direct _id
  let company = await CompanyModel.findOne({ ownerId: ownerIdOrCompanyId });
  if (!company) {
    company = await CompanyModel.findById(ownerIdOrCompanyId);
  }

  if (!company) {
    throw AppError.notFound("Company profile not found for this user");
  }

  // If old logo was in Cloudinary, delete it
  if (company.logoUrl && company.logoUrl !== newLogoUrl) {
    await deleteFromCloudinary(company.logoUrl, "image");
  }

  company.logoUrl = newLogoUrl;
  await company.save();

  return { companyId: String(company._id), logoUrl: newLogoUrl };
}
