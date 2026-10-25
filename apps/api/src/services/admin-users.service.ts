import type { UserRole, UserStatus } from "@hireloop/shared";
import { AuditLogModel, UserModel, UserRoleModel } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { revokeAllSessions } from "./session.service.js";
import { loadRoles } from "./auth.service.js";

/**
 * Administrative changes to user accounts. Every change is audited. Two guards
 * protect the platform: an admin cannot suspend or demote themselves, and the
 * last active admin cannot be removed.
 */

async function countActiveAdmins(excludeUserId?: string): Promise<number> {
  const adminRows = await UserRoleModel.find({ role: "admin" }).select("userId").lean();
  const ids = adminRows.map((row) => String(row.userId)).filter((id) => id !== excludeUserId);
  if (ids.length === 0) return 0;
  return UserModel.countDocuments({ _id: { $in: ids }, status: "active" });
}

async function audit(
  actorId: string,
  action: string,
  targetId: string,
  details: Record<string, unknown>,
): Promise<void> {
  await AuditLogModel.create({ actorId, action, targetType: "user", targetId, details });
}

export async function changeUserStatus(
  actorId: string,
  targetId: string,
  status: UserStatus,
): Promise<{ id: string; status: UserStatus }> {
  const user = await UserModel.findById(targetId).select("status");
  if (!user) throw AppError.notFound("User not found");

  if (targetId === actorId && status !== "active") {
    throw AppError.conflict("You cannot suspend or deactivate your own account.");
  }

  if (status !== "active" && user.status === "active") {
    const roles = await loadRoles(targetId);
    if (roles.includes("admin") && (await countActiveAdmins(targetId)) === 0) {
      throw AppError.conflict("This is the last active admin. Assign another admin first.");
    }
  }

  const previous = user.status;
  await UserModel.updateOne({ _id: targetId }, { $set: { status } });
  if (status !== "active") {
    await revokeAllSessions(targetId, "suspended");
  }
  await audit(actorId, "user.status_changed", targetId, { from: previous, to: status });
  return { id: targetId, status };
}

export async function changeUserRoles(
  actorId: string,
  targetId: string,
  roles: UserRole[],
): Promise<{ id: string; roles: UserRole[] }> {
  const user = await UserModel.exists({ _id: targetId });
  if (!user) throw AppError.notFound("User not found");

  const unique = [...new Set(roles)];
  const before = await loadRoles(targetId);

  if (targetId === actorId && before.includes("admin") && !unique.includes("admin")) {
    throw AppError.conflict("You cannot remove your own admin role.");
  }
  if (
    before.includes("admin") &&
    !unique.includes("admin") &&
    (await countActiveAdmins(targetId)) === 0
  ) {
    throw AppError.conflict("This is the last active admin. Assign another admin first.");
  }

  await UserRoleModel.deleteMany({ userId: targetId, role: { $nin: unique } });
  for (const role of unique) {
    await UserRoleModel.updateOne(
      { userId: targetId, role },
      { $setOnInsert: { assignedBy: actorId } },
      { upsert: true },
    );
  }

  await audit(actorId, "user.roles_changed", targetId, { from: before, to: unique });
  return { id: targetId, roles: unique };
}
