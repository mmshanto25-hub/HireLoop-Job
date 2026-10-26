import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  Check,
  X,
  ArrowLeft,
  Globe,
  MapPin,
} from "lucide-react";
import { useAdminCompanies, useReviewCompany } from "@/features/admin/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import type { CompanyData } from "@hireloop/shared";

export function AdminCompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Review modal state
  const [reviewModalData, setReviewModalData] = useState<{
    company: CompanyData;
    action: "approved" | "rejected";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data, isLoading, error } = useAdminCompanies({
    q: debouncedSearch || undefined,
    status: statusFilter,
    page,
    limit: 15,
  });

  const reviewMutation = useReviewCompany();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPage(1);
  };

  const handleConfirmReview = async () => {
    if (!reviewModalData) return;
    await reviewMutation.mutateAsync({
      companyId: reviewModalData.company.id,
      status: reviewModalData.action,
      rejectionReason: reviewModalData.action === "rejected" ? rejectionReason : undefined,
    });
    setReviewModalData(null);
    setRejectionReason("");
  };

  const getCompanyTone = (st: string): BadgeTone => {
    if (st === "approved") return "success";
    if (st === "pending") return "warning";
    return "danger";
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
              Company Moderation
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Review employer profiles, approve legitimate organizations, and protect candidate safety.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <Button size="sm" onClick={handleSearchSubmit}>
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error || !data ? (
          <div className="p-8 text-center text-danger">
            Failed to load companies list. Please try again.
          </div>
        ) : data.companies.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No companies found matching the specified criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Company</th>
                  <th className="py-3.5 px-4 font-semibold">Industry & Size</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.companies.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-muted/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {c.name}
                        {c.website && (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-brand"
                            title="Visit website"
                          >
                            <Globe className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{c.slug}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-foreground">{c.industry}</div>
                      <div className="text-xs text-muted-foreground">{c.employeeRange} employees</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{c.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        tone={getCompanyTone(c.status)}
                        size="sm"
                      >
                        {c.status}
                      </Badge>
                      {c.status === "rejected" && c.rejectionReason && (
                        <p className="text-[11px] text-danger mt-0.5 max-w-xs truncate" title={c.rejectionReason}>
                          Reason: {c.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(c.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status !== "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 hover:bg-emerald-500/10"
                            onClick={() => setReviewModalData({ company: c, action: "approved" })}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                        {c.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-danger hover:bg-danger-soft/20"
                            onClick={() => {
                              setReviewModalData({ company: c, action: "rejected" });
                              setRejectionReason("");
                            }}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.total > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing page {data.page} of {Math.ceil(data.total / data.limit)} ({data.total} companies)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(data.total / data.limit)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalData && (
        <Modal
          open={true}
          onOpenChange={(open) => !open && setReviewModalData(null)}
          title={`${reviewModalData.action === "approved" ? "Approve" : "Reject"} Organization — ${reviewModalData.company.name}`}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              {reviewModalData.action === "approved"
                ? "Approving this company makes its profile visible to the public and allows the recruiter to publish active job listings."
                : "Rejecting this company will hide its profile from public search and close any currently active job listings published by this company."}
            </p>

            {reviewModalData.action === "rejected" && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Rejection Reason (Sent to recruiter)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why verification could not be completed..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setReviewModalData(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className={reviewModalData.action === "rejected" ? "bg-danger text-white hover:bg-danger/90" : ""}
                onClick={handleConfirmReview}
                disabled={reviewMutation.isPending}
              >
                {reviewModalData.action === "approved" ? "Confirm Approval" : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

