import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";

// Storage for user profile avatars
export const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hireloop/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Storage for company logos
export const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hireloop/logos",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
  },
});

// Storage for candidate resumes
export const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hireloop/resumes",
    resource_type: "auto",
    allowed_formats: ["pdf", "doc", "docx"],
  },
});

export const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Direct single middleware for route convenience:
export const uploadAvatar = avatarUpload.single("avatar");
export const uploadLogo = logoUpload.single("logo");
export const uploadResume = resumeUpload.single("resume");
