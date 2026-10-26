import multer from "multer";
import { AppError } from "../utils/AppError.js";

// Store in memory so storage service can validate file header signatures before disk write
const storage = multer.memoryStorage();

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(AppError.badRequest("Only image files are allowed for avatars"));
    }
    cb(null, true);
  },
}).single("avatar");

export const logoUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(AppError.badRequest("Only image files are allowed for company logos"));
    }
    cb(null, true);
  },
}).single("logo");

export const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(AppError.badRequest("Only PDF files are allowed for resumes"));
    }
    cb(null, true);
  },
}).single("resume");

