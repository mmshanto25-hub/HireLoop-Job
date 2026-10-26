import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  ArrowLeft,
} from "lucide-react";
import {
  useAdminUsers,
  useUpdateUserStatus,
  useUpdateUserRoles,
} from "@/features/admin/hooks";
import { useCurrentUser } from "@/features/auth/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export function AdminUsersPage() {
  const { data: currentUser } = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modal states
  const [statusModalUser, setStatusModalUser] = useState<{ id: string; fullName: string; currentStatus: string } | null>(null);
  const [rolesModalUser, setRolesModalUser] = useState<{ id: string; fullName: string; roles: string[] } | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { data, isLoading, error } = useAdminUsers({
    q: debouncedSearch || undefined,
    role: roleFilter,
    status: statusFilter,
    page,
    limit: 15,
  });

  const updateStatusMutation = useUpdateUserStatus();
  const updateRolesMutation = useUpdateUserRoles();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPage(1);
  };

  const openRolesModal = (u: { id: string; fullName: string; roles: string[] }) => {
    setRolesModalUser(u);
    setSelectedRoles([...u.roles]);
  };

  const handleToggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) return; // Must have at least one role
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSaveRoles = async () => {
    if (!rolesModalUser) return;
    await updateRolesMutation.mutateAsync({
      id: rolesModalUser.id,
      roles: selectedRoles,
    });
    setRolesModalUser(null);
  };

  const handleSaveStatus = async (newStatus: "active" | "suspended" | "deactivated") => {
    if (!statusModalUser) return;
    await updateStatusMutation.mutateAsync({
      id: statusModalUser.id,
      status: newStatus,
    });
    setStatusModalUser(null);
  };

  const getRoleTone = (r: string): BadgeTone => {
    if (r === "admin") return "danger";
    if (r === "recruiter") return "info";
    return "success";
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
              User Management
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Search, moderate accounts, adjust permissions, and enforce security policies.
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
              placeholder="Search by full name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="all">All Roles</option>
              <option value="seeker">Job Seeker</option>
              <option value="recruiter">Recruiter</option>
              <option value="admin">Administrator</option>
            </select>

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
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>

            <Button size="sm" onClick={handleSearchSubmit}>
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error || !data ? (
          <div className="p-8 text-center text-danger">
            Failed to load users list. Please try again.
          </div>
        ) : data.users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No users match the specified search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">Roles</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Registered</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          {u.fullName}
                          {isSelf && (
                            <Badge tone="brand" size="sm">You</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge
                              key={r}
                              tone={getRoleTone(r)}
                              size="sm"
                            >
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          tone={
                            u.status === "active"
                              ? "success"
                              : u.status === "suspended"
                                ? "danger"
                                : "neutral"
                          }
                          size="sm"
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRolesModal(u)}
                            disabled={isSelf}
                            title={isSelf ? "You cannot modify your own roles" : "Change roles"}
                          >
                            <Shield className="h-3.5 w-3.5 mr-1" />
                            Roles
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={u.status === "active" ? "text-danger hover:bg-danger-soft/20" : "text-emerald-600 hover:bg-emerald-500/10"}
                            onClick={() => setStatusModalUser({ id: u.id, fullName: u.fullName, currentStatus: u.status })}
                            disabled={isSelf}
                            title={isSelf ? "You cannot suspend your own account" : "Change status"}
                          >
                            {u.status === "active" ? (
                              <>
                                <UserX className="h-3.5 w-3.5 mr-1" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.total > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing page {data.page} of {Math.ceil(data.total / data.limit)} ({data.total} total users)
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

      {/* Edit Roles Modal */}
      {rolesModalUser && (
        <Modal
          open={true}
          onOpenChange={(open) => !open && setRolesModalUser(null)}
          title={`Edit Roles — ${rolesModalUser.fullName}`}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Select all authorized permissions assigned to this user. At least one role is required.
            </p>

            <div className="space-y-2 pt-2">
              {[
                { role: "seeker", label: "Job Seeker", desc: "Can search jobs, save listings, and submit applications." },
                { role: "recruiter", label: "Recruiter", desc: "Can manage company, publish job openings, and review applicants." },
                { role: "admin", label: "Administrator", desc: "Full administrative access to moderation, users, and platform settings." },
              ].map((item) => (
                <label
                  key={item.role}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-surface-muted/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(item.role)}
                    onChange={() => handleToggleRole(item.role)}
                    className="mt-1 rounded border-border text-brand focus:ring-brand"
                  />
                  <div>
                    <div className="font-semibold text-sm text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setRolesModalUser(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRoles}
                disabled={updateRolesMutation.isPending || selectedRoles.length === 0}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Status Modal */}
      {statusModalUser && (
        <Modal
          open={true}
          onOpenChange={(open) => !open && setStatusModalUser(null)}
          title={`Update Status — ${statusModalUser.fullName}`}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Changing account status will immediately revoke active sessions if suspended.
            </p>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSaveStatus("active")}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  statusModalUser.currentStatus === "active"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-border hover:bg-surface-muted"
                }`}
              >
                <div className="font-semibold text-sm">Active</div>
                <div className="text-xs text-muted-foreground">Normal platform access enabled.</div>
              </button>

              <button
                type="button"
                onClick={() => handleSaveStatus("suspended")}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  statusModalUser.currentStatus === "suspended"
                    ? "border-danger bg-danger-soft/20 text-danger"
                    : "border-border hover:bg-surface-muted"
                }`}
              >
                <div className="font-semibold text-sm">Suspended</div>
                <div className="text-xs text-muted-foreground">
                  User is locked out and cannot log in or perform actions.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSaveStatus("deactivated")}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  statusModalUser.currentStatus === "deactivated"
                    ? "border-neutral-500 bg-surface-muted text-foreground"
                    : "border-border hover:bg-surface-muted"
                }`}
              >
                <div className="font-semibold text-sm">Deactivated</div>
                <div className="text-xs text-muted-foreground">Account disabled per user request or policy.</div>
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setStatusModalUser(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

