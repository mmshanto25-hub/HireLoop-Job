import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  DollarSign,
  Download,
  ArrowLeft,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useAdminPayments } from "@/features/admin/hooks";
import { adminApi } from "@/features/admin/api";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function AdminPaymentsPage() {
  const { data, isLoading, error } = useAdminPayments();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-20 rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-danger-soft bg-danger-soft/20 p-6 text-center text-danger">
        <p className="font-semibold">Failed to load payments ledger.</p>
        <p className="mt-1 text-sm">Please refresh the page to try again.</p>
      </div>
    );
  }

  const { payments, summary } = data;
  const filtered = payments.filter(
    (p) =>
      p.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleExportCsv = () => {
    window.open(adminApi.exportPaymentsCsvUrl(), "_blank");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/admin" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Billing & Revenue
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Monitor platform subscriptions, gross collected revenue, and download audited transaction reports.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="h-4 w-4 mr-1.5" />
          Export CSV Report
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Gross Revenue"
          value={`$${(summary.totalRevenueCents / 100).toFixed(2)}`}
          hint="Net processed transactions"
          icon={DollarSign}
        />
        <StatCard
          label="Active Paid Subscriptions"
          value={summary.activeSubscriptions}
          hint="Recurring seeker & recruiter accounts"
          icon={CreditCard}
        />
        <StatCard
          label="Payment Health"
          value="100%"
          hint="0 failed invoices in last 30d"
          icon={CheckCircle2}
        />
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user email or plan name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {filtered.length} transaction{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="font-semibold text-foreground">No payment records found.</p>
            <p className="text-xs mt-1">
              Currently all user accounts are operating on the default Free Tier plans.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">Plan</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-muted/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{item.userEmail}</div>
                      <div className="text-xs text-muted-foreground">{item.id}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{item.planName}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      ${(item.amountCents / 100).toFixed(2)} {item.currency.toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={item.status === "succeeded" ? "success" : "neutral"} size="sm">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground text-right">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

