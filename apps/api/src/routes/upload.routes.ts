import { Router } from "express";
import { getPublicAssetPath } from "../services/storage.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export function createUploadRouter(): Router {
  const router = Router();

  router.get(
    "/public/:key",
    asyncHandler(async (req, res) => {
      const key = req.params["key"];
      if (!key) throw AppError.notFound("Asset key required");
      const filePath = await getPublicAssetPath(key);
      res.sendFile(filePath);
    }),
  );

  return router;
}

