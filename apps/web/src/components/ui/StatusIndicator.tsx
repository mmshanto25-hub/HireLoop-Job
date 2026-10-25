import { Badge, type BadgeTone } from "./Badge";

/**
 * Maps every domain status to a label and tone in one place, so a status such
 * as "shortlisted" looks the same on every dashboard.
 */
const STATUS_MAP: Record<string, { label: string; tone: BadgeTone }> = {
  // Application
  applied: { label: "Applied", tone: "info" },
  under_review: { label: "Under review", tone: "warning" },
  shortlisted: { label: "Shortlisted", tone: "brand" },
  rejected: { label: "Rejected", tone: "danger" },
  offered: { label: "Offered", tone: "success" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
  // Job
  active: { label: "Active", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
  draft: { label: "Draft", tone: "accent" },
  // Company
  pending: { label: "Pending review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  // Account
  suspended: { label: "Suspended", tone: "danger" },
  deactivated: { label: "Deactivated", tone: "neutral" },
  // Subscription
  trialing: { label: "Trial", tone: "info" },
  past_due: { label: "Past due", tone: "warning" },
  canceled: { label: "Canceled", tone: "neutral" },
  unpaid: { label: "Unpaid", tone: "danger" },
  incomplete: { label: "Incomplete", tone: "warning" },
};

export function StatusIndicator({ status }: { status: string }) {
  const entry = STATUS_MAP[status] ?? {
    label: status.replace(/_/g, " "),
    tone: "neutral" as const,
  };
  return (
    <Badge tone={entry.tone} aria-label={`Status: ${entry.label}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {entry.label}
    </Badge>
  );
}
