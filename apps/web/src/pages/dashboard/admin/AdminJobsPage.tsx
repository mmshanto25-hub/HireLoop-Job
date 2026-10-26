import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Search,
  Star,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import {
  useAdminJobs,
  useToggleJobFeatured,
  useDeleteJobAdmin,
} from "@/features/admin/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import type { AdminJobListItem } from "@hireloop/shared";

export function AdminJobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [deleteModalJob, setDeleteModalJob] = useState<AdminJobListItem | null>(null);

  const { data, isLoading, error } = useAdminJobs({
    q: debouncedSearch || undefined,
    category: categoryFilter,
    status: statusFilter,
    page,
    limit: 15,
  });

  const toggleFeaturedMutation = useToggleJobFeatured();
  const deleteJobMutation = useDeleteJobAdmin();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalJob) return;
    await deleteJobMutation.mutateAsync(deleteModalJob.id);
    setDeleteModalJob(null);
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
              Job Listing Moderation
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Feature prominent positions, review listings, or administratively close policy-violating roles.
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
              placeholder="Search by job title..."
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
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>

            <Button size="sm" onClick={handleSearchSubmit}>
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error || !data ? (
          <div className="p-8 text-center text-danger">
            Failed to load jobs list. Please try again.
          </div>
        ) : data.jobs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No job listings found matching the specified search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Job Title</th>
                  <th className="py-3.5 px-4 font-semibold">Company & Recruiter</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Applicants</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface-muted/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <Link to={`/jobs/${job.slug}`} className="hover:text-brand transition-colors">
                          {job.title}
                        </Link>
                        {job.isFeatured && (
                          <Badge tone="brand" size="sm" className="gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{job.jobType}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-foreground font-medium">{job.companyName}</div>
                      <div className="text-xs text-muted-foreground">{job.recruiterEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <Badge tone="neutral" size="sm">
                        {job.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        tone={
                          job.status === "active"
                            ? "success"
                            : job.status === "closed"
                              ? "danger"
                              : "neutral"
                        }
                        size="sm"
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-foreground">
                      {job.applicantsCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={job.isFeatured ? "text-amber-500 border-amber-500/30" : ""}
                          onClick={() => toggleFeaturedMutation.mutate(job.id)}
                          disabled={toggleFeaturedMutation.isPending}
                          title={job.isFeatured ? "Remove featured status" : "Feature listing"}
                        >
                          <Star className={`h-3.5 w-3.5 mr-1 ${job.isFeatured ? "fill-current" : ""}`} />
                          {job.isFeatured ? "Unfeature" : "Feature"}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-danger hover:bg-danger-soft/20"
                          onClick={() => setDeleteModalJob(job)}
                          disabled={job.status === "closed"}
                          title="Close listing"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Remove
                        </Button>
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
              Showing page {data.page} of {Math.ceil(data.total / data.limit)} ({data.total} jobs)
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

      {/* Delete/Close Confirmation Modal */}
      {deleteModalJob && (
        <Modal
          open={true}
          onOpenChange={(open) => !open && setDeleteModalJob(null)}
          title={`Remove Job — ${deleteModalJob.title}`}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to administratively close this job posting?
            </p>
            <div className="rounded-xl border border-danger-soft bg-danger-soft/20 p-3 text-xs text-danger">
              This action marks the job as <strong>closed</strong>. Candidates can no longer submit
              new applications. Existing application records and resumes are safely preserved.
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setDeleteModalJob(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-danger text-white hover:bg-danger/90"
                onClick={handleConfirmDelete}
                disabled={deleteJobMutation.isPending}
              >
                Confirm Removal
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

