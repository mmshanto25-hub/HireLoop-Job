import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight, Info, AlertTriangle, CheckCircle, Flame } from "lucide-react";
import type { AnnouncementSettings } from "@hireloop/shared";

interface AnnouncementBannerProps {
  settings: AnnouncementSettings;
}

export function AnnouncementBanner({ settings }: AnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed this exact message
    if (typeof sessionStorage !== "undefined") {
      const dismissedMessage = sessionStorage.getItem("hl_announcement_dismissed");
      if (dismissedMessage === settings.message) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    }
  }, [settings.message]);

  if (!settings.enabled || isDismissed || !settings.message) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("hl_announcement_dismissed", settings.message);
    }
  };

  const variantStyles = {
    info: "bg-brand/10 border-brand/20 text-brand dark:bg-brand/15 dark:text-brand-light",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    danger: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
  };

  const VariantIcon = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    danger: Flame,
  }[settings.variant] || Info;

  return (
    <div
      role="region"
      aria-label="Announcement"
      className={`relative z-40 border-b px-4 py-2 text-xs sm:text-sm font-medium transition-all ${variantStyles[settings.variant]}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex flex-1 items-center justify-center gap-2 text-center">
          <VariantIcon className="h-4 w-4 shrink-0 hidden sm:inline-block" aria-hidden="true" />
          <span>{settings.message}</span>
          {settings.linkUrl && (
            <Link
              to={settings.linkUrl}
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              {settings.linkLabel || "Learn more"}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {settings.dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
