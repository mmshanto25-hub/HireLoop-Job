import type { NotificationItem } from "@hireloop/shared";
import { apiRequest } from "@/lib/api";

export const notificationsApi = {
  getNotifications: (limit = 20, unreadOnly = false) => {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    if (unreadOnly) params.set("unreadOnly", "true");
    const query = params.toString();
    return apiRequest<{ items: NotificationItem[]; unreadCount: number }>(
      `/notifications${query ? `?${query}` : ""}`,
    );
  },

  getUnreadCount: () => apiRequest<{ unreadCount: number }>("/notifications/unread-count"),

  markAsRead: (notificationId: string) =>
    apiRequest<{ marked: boolean }>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    apiRequest<{ count: number }>("/notifications/read-all", {
      method: "POST",
    }),
};

