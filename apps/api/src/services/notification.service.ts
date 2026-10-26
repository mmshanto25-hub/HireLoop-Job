import { NotificationModel, type NotificationDocument } from "../models/index.js";
import type { NotificationItem, NotificationType } from "@hireloop/shared";
import { AppError } from "../utils/AppError.js";

export class NotificationService {
  async createNotification(
    userId: string,
    payload: {
      type: NotificationType;
      title: string;
      body: string;
      link?: string | null;
    },
  ): Promise<NotificationDocument> {
    return NotificationModel.create({
      userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link ?? null,
    });
  }

  async listNotifications(
    userId: string,
    limit = 20,
    unreadOnly = false,
  ): Promise<{ items: NotificationItem[]; unreadCount: number }> {
    const filter: Record<string, any> = { userId };
    if (unreadOnly) {
      filter.readAt = null;
    }

    const [docs, unreadCount] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 50))
        .lean(),
      NotificationModel.countDocuments({ userId, readAt: null }),
    ]);

    const items: NotificationItem[] = docs.map((doc) => ({
      id: doc._id.toString(),
      type: doc.type as NotificationType,
      title: doc.title,
      body: doc.body,
      link: doc.link ?? null,
      readAt: doc.readAt ? doc.readAt.toISOString() : null,
      isRead: Boolean(doc.readAt),
      createdAt: (doc as any).createdAt?.toISOString() ?? new Date().toISOString(),
    }));

    return { items, unreadCount };
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw AppError.notFound("Notification not found");
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await notification.save();
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await NotificationModel.updateMany(
      { userId, readAt: null },
      { $set: { readAt: new Date() } },
    );
    return result.modifiedCount;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, readAt: null });
  }
}

export function createNotificationService(): NotificationService {
  return new NotificationService();
}
