import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Object-level authorization. Role checks alone do not stop one seeker from
 * reading another seeker's record. Each route passes a loader that returns the
 * owner's user ID. Admins may access any record. A missing record and a record
 * owned by someone else both return 404, so IDs cannot be probed.
 */
export function requireOwnership(loadOwnerId: (req: Request) => Promise<string | null>) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) throw AppError.unauthenticated();

    const ownerId = await loadOwnerId(req);
    if (!ownerId) throw AppError.notFound();

    const isAdmin = req.auth.user.roles.includes("admin");
    if (!isAdmin && ownerId !== req.auth.userId) throw AppError.notFound();

    next();
  });
}
