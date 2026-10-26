import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bell,
  CheckCheck,
  Calendar,
  Briefcase,
  CheckCircle2,
  Building2,
  Clock,
} from "lucide-react";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/features/notifications/hooks";
import { useCurrentUser } from "@/features/auth/hooks";
import { cn } from "@/lib/cn";
import type { NotificationType } from "@hireloop/shared";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "interview_scheduled":
      return <Calendar className="h-4 w-4 text-brand" />;
    case "application_submitted":
      return <Briefcase className="h-4 w-4 text-emerald-500" />;
    case "application_status_changed":
      return <CheckCircle2 className="h-4 w-4 text-amber-500" />;
    case "company_approved":
    case "company_rejected":
      return <Building2 className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const [open, setOpen] = useState(false);

  const { data } = useNotifications(10, false, Boolean(user));
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  if (!user) return null;

  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleNotificationClick = (item: (typeof notifications)[0]) => {
    if (!item.isRead) {
      markAsRead.mutate(item.id);
    }
    setOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative rounded-md p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground shadow-sm animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 sm:w-96 rounded-xl border border-border bg-surface shadow-raised focus:outline-none overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-3.5 bg-surface-muted/30">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-text">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p>No notifications yet</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Updates on applications and activity will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <DropdownMenu.Item
                  key={item.id}
                  onSelect={() => handleNotificationClick(item)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 text-sm cursor-pointer outline-none transition-colors",
                    !item.isRead ? "bg-brand-soft/20 font-medium" : "hover:bg-surface-muted",
                  )}
                >
                  <div className="mt-0.5 shrink-0 rounded-full bg-surface p-1.5 border border-border shadow-sm">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {item.body}
                    </p>
                  </div>
                  {!item.isRead && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand mt-1.5" />
                  )}
                </DropdownMenu.Item>
              ))
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

