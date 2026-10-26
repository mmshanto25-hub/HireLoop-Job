import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";
import { createNotificationService } from "../services/notification.service.js";

export function createNotificationController() {
  const service = createNotificationService();

  return {
    list: asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth?.userId;
      if (!userId) throw AppError.unauthenticated();

      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
      const unreadOnly = req.query.unreadOnly === "true";

      const result = await service.listNotifications(userId, limit, unreadOnly);
      sendSuccess(res, result);
    }),

    markAsRead: asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth?.userId;
      if (!userId) throw AppError.unauthenticated();

      const { notificationId } = req.params;
      if (!notificationId) throw AppError.badRequest("Missing notification ID");

      await service.markAsRead(userId, notificationId);
      sendSuccess(res, { marked: true });
    }),

    markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth?.userId;
      if (!userId) throw AppError.unauthenticated();

      const count = await service.markAllAsRead(userId);
      sendSuccess(res, { count });
    }),

    unreadCount: asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth?.userId;
      if (!userId) throw AppError.unauthenticated();

      const count = await service.getUnreadCount(userId);
      sendSuccess(res, { unreadCount: count });
    }),
  };
}

