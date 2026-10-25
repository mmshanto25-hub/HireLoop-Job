/**
 * Creates the first administrator. Admin cannot be self-registered, so this
 * script is the only way to create one. It is idempotent: if the user exists,
 * it adds the admin role and leaves the password unchanged.
 *
 * Usage (values come from the environment, never from command-line arguments,
 * so they do not end up in shell history):
 *   ADMIN_EMAIL=you@example.com ADMIN_FULL_NAME="Your Name" \
 *   ADMIN_PASSWORD='a long passphrase' npm run bootstrap:admin -w @hireloop/api
 */
import { loadEnv } from "../config/env.js";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { UserModel, UserRoleModel, AuditLogModel } from "../models/index.js";
import { hashPassword } from "../services/password.service.js";
import { createLogger } from "../utils/logger.js";
import { emailSchema, passwordSchema } from "@hireloop/shared";

async function main(): Promise<void> {
  const env = loadEnv();
  const logger = createLogger(env.LOG_LEVEL);

  const email = emailSchema.parse(process.env["ADMIN_EMAIL"] ?? "");
  const fullName = (process.env["ADMIN_FULL_NAME"] ?? "").trim();
  const password = process.env["ADMIN_PASSWORD"] ?? "";

  if (fullName.length < 2) throw new Error("ADMIN_FULL_NAME must be at least 2 characters");
  if (!passwordSchema.safeParse(password).success) {
    throw new Error("ADMIN_PASSWORD must be 8-72 characters with a letter and a number");
  }

  await connectDatabase({ uri: env.MONGODB_URI, logger });
  try {
    const existing = await UserModel.findOne({ email }).select("_id");
    if (existing) {
      await UserRoleModel.updateOne(
        { userId: existing._id, role: "admin" },
        { $setOnInsert: { assignedBy: null } },
        { upsert: true },
      );
      logger.info({ email }, "Existing user granted the admin role (password unchanged)");
      return;
    }

    const user = await UserModel.create({
      fullName,
      email,
      passwordHash: await hashPassword(password),
      status: "active",
      emailVerifiedAt: new Date(),
      authProviders: [{ provider: "password", providerUserId: null }],
    });
    await UserRoleModel.create({ userId: user._id, role: "admin" });
    await AuditLogModel.create({
      actorId: user._id,
      action: "user.bootstrap_admin",
      targetType: "user",
      targetId: String(user._id),
      details: null,
    });
    logger.info({ email }, "Administrator created");
  } finally {
    await disconnectDatabase();
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Bootstrap failed: ${message}`);
  process.exit(1);
});
