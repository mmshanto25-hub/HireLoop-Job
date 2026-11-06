import { Router } from "express";
import { uploadAvatar, uploadResume, uploadLogo } from "../middleware/upload.js";
import { saveUserAvatar, saveUserResume, saveCompanyLogo } from "../services/cloudinary.service.js";

const router = Router();

/**
 * 1. Upload Avatar
 * POST /api/v1/upload/avatar
 */
router.post("/avatar", uploadAvatar, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }
    const fileUrl = req.file.path || req.file.secure_url;
    const userId = req.auth?.userId || req.body?.userId || req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ success: false, message: "User authentication required" });
    }

    const avatarUrl = await saveUserAvatar(userId, fileUrl);
    return res.status(200).json({
      success: true,
      avatarUrl,
      message: "Avatar uploaded and saved to User.avatarUrl",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 2. Upload Resume
 * POST /api/v1/upload/resume
 */
router.post("/resume", uploadResume, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file uploaded" });
    }
    const fileUrl = req.file.path || req.file.secure_url;
    const userId = req.auth?.userId || req.body?.userId || req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ success: false, message: "User authentication required" });
    }

    const resumeUrl = await saveUserResume(userId, fileUrl);
    return res.status(200).json({
      success: true,
      resumeUrl,
      message: "Resume uploaded and saved to User.resumeUrl",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 3. Upload Logo
 * POST /api/v1/upload/logo
 */
router.post("/logo", uploadLogo, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No logo image uploaded" });
    }
    const fileUrl = req.file.path || req.file.secure_url;
    const targetId = req.body?.companyId || req.auth?.userId || req.body?.userId || req.headers["x-user-id"];
    if (!targetId) {
      return res.status(401).json({ success: false, message: "Company ID or authentication required" });
    }

    const result = await saveCompanyLogo(targetId, fileUrl);
    return res.status(200).json({
      success: true,
      companyId: result.companyId,
      logoUrl: result.logoUrl,
      message: "Logo uploaded and saved to Company.logoUrl",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
export { router as uploadRouter };
