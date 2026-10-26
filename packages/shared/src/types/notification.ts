import type { NotificationType } from "../constants/domain.js";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  isRead: boolean;
  createdAt: string;
}

