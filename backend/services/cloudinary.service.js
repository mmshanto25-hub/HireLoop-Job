import { cloudinary } from "../config/cloudinary.js";
import { UserModel } from "../../apps/api/src/models/User.js";
import { CompanyModel } from "../../apps/api/src/models/Company.js";

export function extractCloudinaryPublicId(url) {
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

export async function deleteFromCloudinary(urlOrPublicId, resourceType = "image") {
  if (!urlOrPublicId) return;
  try {
    const publicId = urlOrPublicId.includes("cloudinary.com")
      ? extractCloudinaryPublicId(urlOrPublicId)
      : urlOrPublicId;

    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
  } catch (err) {
    console.error("Cloudinary deletion failed:", err);
  }
}

export async function saveUserAvatar(userId, newAvatarUrl) {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.avatarUrl && user.avatarUrl !== newAvatarUrl) {
    await deleteFromCloudinary(user.avatarUrl, "image");
  }

  user.avatarUrl = newAvatarUrl;
  await user.save();
  return newAvatarUrl;
}

export async function saveUserResume(userId, newResumeUrl) {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.resumeUrl && user.resumeUrl !== newResumeUrl) {
    await deleteFromCloudinary(user.resumeUrl, "raw");
  }

  user.resumeUrl = newResumeUrl;
  await user.save();
  return newResumeUrl;
}

export async function saveCompanyLogo(ownerOrCompanyId, newLogoUrl) {
  let company = await CompanyModel.findOne({ ownerId: ownerOrCompanyId });
  if (!company) {
    company = await CompanyModel.findById(ownerOrCompanyId);
  }
  if (!company) throw new Error("Company not found");

  if (company.logoUrl && company.logoUrl !== newLogoUrl) {
    await deleteFromCloudinary(company.logoUrl, "image");
  }

  company.logoUrl = newLogoUrl;
  await company.save();
  return { companyId: String(company._id), logoUrl: newLogoUrl };
}
