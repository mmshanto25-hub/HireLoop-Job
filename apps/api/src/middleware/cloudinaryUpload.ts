import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";
import { AppError } from "../utils/AppError.js";

// Storage for user profile avatars
export const avatarCloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hireloop/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  } as any,
});

// Storage for company logos
export const logoCloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hireloop/logos",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
  } as any,
});

// Storage for candidate resumes
export const resumeCloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hireloop/resumes",
    resource_type: "auto",
    allowed_formats: ["pdf", "doc", "docx"],
  } as any,
});

/**
 * Creates flexible multer middleware that accepts the primary field or "file".
 */
function createUploadMiddleware(storage: any, primaryField: string, maxBytes: number) {
  const upload = multer({
    storage,
    limits: { fileSize: maxBytes },
  });

  return (req: any, res: any, next: any) => {
    upload.any()(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(AppError.badRequest(`File size exceeds limit (${Math.round(maxBytes / 1024 / 1024)} MB)`));
        }
        return next(AppError.badRequest(err.message || "File upload error"));
      }

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const file = req.files.find((f: any) => f.fieldname === primaryField || f.fieldname === "file") || req.files[0];
        req.file = file;
      }

      next();
    });
  };
}

export const cloudinaryAvatarUpload = createUploadMiddleware(avatarCloudinaryStorage, "avatar", 2 * 1024 * 1024);
export const cloudinaryLogoUpload = createUploadMiddleware(logoCloudinaryStorage, "logo", 2 * 1024 * 1024);
export const cloudinaryResumeUpload = createUploadMiddleware(resumeCloudinaryStorage, "resume", 10 * 1024 * 1024);
