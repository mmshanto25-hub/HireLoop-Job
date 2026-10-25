import type { AuthUser, RegisterInput, UserRole } from "@hireloop/shared";
import type { Env } from "../config/env.js";
import { OneTimeTokenModel, UserModel, UserRoleModel, type UserDocument } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { generateToken, sha256Hex } from "../utils/crypto.js";
import type { Logger } from "../utils/logger.js";
import { accountExistsEmail, passwordResetEmail, verificationEmail } from "../emails/templates.js";
import { sendEmailSafely, type EmailSender } from "./email.service.js";
import { burnPasswordCheck, hashPassword, verifyPassword } from "./password.service.js";
import {
  createSession,
  revokeAllSessions,
  revokeSession,
  rotateSession,
  type IssuedSession,
} from "./session.service.js";

/**
 * Authentication use cases. Routes call these functions and never touch the
 * models directly. Anything that reveals whether an account exists returns the
 * same response either way.
 */

export interface AuthDeps {
  env: Env;
  email: EmailSender;
  logger: Logger;
}

export const EMAIL_VERIFICATION_TTL_MINUTES = 24 * 60;
export const PASSWORD_RESET_TTL_MINUTES = 30;

type OneTimePurpose = "email_verification" | "password_reset";

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
}

export interface LoginResult {
  user: AuthUser;
  session: IssuedSession;
}

export function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === 11000;
}

export async function loadRoles(userId: string): Promise<UserRole[]> {
  const rows = await UserRoleModel.find({ userId }).select("role").lean();
  return rows.map((row) => row.role as UserRole);
}

export function toAuthUser(user: UserDocument, roles: UserRole[]): AuthUser {
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    status: user.status,
    emailVerified: Boolean(user.emailVerifiedAt),
    avatarUrl: user.avatarUrl ?? null,
    roles,
    providers: user.authProviders.map((provider) => provider.provider),
    createdAt: user.createdAt.toISOString(),
  };
}

export async function loadAuthUser(userId: string): Promise<AuthUser | null> {
  const user = await UserModel.findById(userId);
  if (!user) return null;
  return toAuthUser(user, await loadRoles(userId));
}

/** Creates a single-use token. Earlier unused tokens of the same purpose are removed first. */
async function issueOneTimeToken(
  userId: string,
  purpose: OneTimePurpose,
  ttlMinutes: number,
): Promise<string> {
  await OneTimeTokenModel.deleteMany({ userId, purpose, consumedAt: null });
  const raw = generateToken(32);
  await OneTimeTokenModel.create({
    userId,
    purpose,
    tokenHash: sha256Hex(raw),
    expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
  });
  return raw;
}

/** Atomically consumes a token. Returns the user ID, or null if the token is unknown, used, or expired. */
async function consumeOneTimeToken(raw: string, purpose: OneTimePurpose): Promise<string | null> {
  const consumed = await OneTimeTokenModel.findOneAndUpdate(
    {
      tokenHash: sha256Hex(raw),
      purpose,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { consumedAt: new Date() } },
  ).lean();
  return consumed ? String(consumed.userId) : null;
}

async function sendVerificationEmail(
  deps: AuthDeps,
  user: { id: string; fullName: string; email: string },
) {
  const token = await issueOneTimeToken(
    user.id,
    "email_verification",
    EMAIL_VERIFICATION_TTL_MINUTES,
  );
  const url = `${deps.env.WEB_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmailSafely(
    deps.email,
    { to: user.email, ...verificationEmail({ fullName: user.fullName, url }) },
    deps.logger,
  );
}

async function notifyExistingAccount(deps: AuthDeps, fullName: string, email: string) {
  await sendEmailSafely(
    deps.email,
    {
      to: email,
      ...accountExistsEmail({ fullName, loginUrl: `${deps.env.WEB_URL}/login` }),
    },
    deps.logger,
  );
}

/**
 * Registers a new account. The response is identical whether or not the email
 * is already registered, so the endpoint cannot be used to discover accounts.
 */
export async function register(deps: AuthDeps, input: RegisterInput): Promise<void> {
  // Hash for every request, including duplicates, so timing does not reveal existing accounts.
  const passwordHash = await hashPassword(input.password);

  const existing = await UserModel.exists({ email: input.email });
  if (existing) {
    await notifyExistingAccount(deps, input.fullName, input.email);
    return;
  }

  let user: UserDocument;
  try {
    user = await UserModel.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      status: "active",
      authProviders: [{ provider: "password", providerUserId: null }],
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      // A concurrent registration for the same email won the race.
      await notifyExistingAccount(deps, input.fullName, input.email);
      return;
    }
    throw err;
  }

  try {
    await UserRoleModel.create({ userId: user._id, role: input.role });
  } catch (err) {
    // Do not leave an account without a role. Remove it so the user can try again.
    await UserModel.deleteOne({ _id: user._id });
    throw err;
  }

  await sendVerificationEmail(deps, {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
  });
  deps.logger.info({ userId: String(user._id), role: input.role }, "Account registered");
}

export async function verifyEmail(deps: AuthDeps, token: string): Promise<void> {
  const userId = await consumeOneTimeToken(token, "email_verification");
  if (!userId) throw AppError.tokenInvalid();

  await UserModel.updateOne(
    { _id: userId, emailVerifiedAt: null },
    { $set: { emailVerifiedAt: new Date() } },
  );
  deps.logger.info({ userId }, "Email verified");
}

/** Always resolves the same way. A new message is sent only for an unverified, active account. */
export async function resendVerification(deps: AuthDeps, email: string): Promise<void> {
  const user = await UserModel.findOne({ email }).select("fullName email status emailVerifiedAt");
  if (!user || user.emailVerifiedAt || user.status !== "active") return;
  await sendVerificationEmail(deps, {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
  });
}

/**
 * Signs in with email and password. Unknown emails, wrong passwords and
 * deactivated accounts all return the same error. Suspension and unverified
 * email are reported only after the password is correct.
 */
export async function login(
  deps: AuthDeps,
  input: { email: string; password: string },
  userAgent: string | undefined,
): Promise<LoginResult> {
  const user = await UserModel.findOne({ email: input.email }).select("+passwordHash");

  if (!user || !user.passwordHash || user.status === "deactivated") {
    await burnPasswordCheck(input.password);
    throw AppError.invalidCredentials();
  }

  const passwordOk = await verifyPassword(input.password, user.passwordHash);
  if (!passwordOk) {
    deps.logger.warn({ userId: String(user._id) }, "Failed sign-in attempt");
    throw AppError.invalidCredentials();
  }

  if (user.status === "suspended") throw AppError.accountSuspended();
  if (!user.emailVerifiedAt) throw AppError.emailNotVerified();

  return completeSignIn(deps, user, userAgent);
}

async function completeSignIn(
  deps: AuthDeps,
  user: UserDocument,
  userAgent: string | undefined,
): Promise<LoginResult> {
  await UserModel.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
  const roles = await loadRoles(String(user._id));
  const session = await createSession(deps.env, String(user._id), userAgent);
  deps.logger.info({ userId: String(user._id), sessionId: session.sessionId }, "Signed in");
  return { user: toAuthUser(user, roles), session };
}

export async function logout(deps: AuthDeps, sessionId: string | undefined): Promise<void> {
  if (sessionId) await revokeSession(sessionId, "logout");
  deps.logger.info({ sessionId }, "Signed out");
}

/** Rotates the refresh secret and returns new tokens. Any failure is reported as a single generic error. */
export async function refresh(
  deps: AuthDeps,
  refreshValue: string | undefined,
): Promise<IssuedSession> {
  const sessionError = () =>
    new AppError(401, "UNAUTHENTICATED", "Your session has ended. Sign in again.");

  if (!refreshValue) throw sessionError();
  const session = await rotateSession(deps.env, refreshValue);
  if (!session) throw sessionError();

  const user = await UserModel.findById(session.userId).select("status");
  if (!user || user.status !== "active") {
    await revokeSession(session.sessionId, "suspended");
    throw sessionError();
  }
  return session;
}

export async function forgotPassword(deps: AuthDeps, email: string): Promise<void> {
  const user = await UserModel.findOne({ email }).select("fullName email status");
  if (!user || user.status !== "active") return;

  const token = await issueOneTimeToken(
    String(user._id),
    "password_reset",
    PASSWORD_RESET_TTL_MINUTES,
  );
  const url = `${deps.env.WEB_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmailSafely(
    deps.email,
    { to: user.email, ...passwordResetEmail({ fullName: user.fullName, url }) },
    deps.logger,
  );
}

export async function resetPassword(
  deps: AuthDeps,
  token: string,
  password: string,
): Promise<void> {
  const userId = await consumeOneTimeToken(token, "password_reset");
  if (!userId) throw AppError.tokenInvalid();

  const user = await UserModel.findById(userId).select("status");
  if (!user || user.status === "deactivated") throw AppError.tokenInvalid();
  if (user.status === "suspended") throw AppError.accountSuspended();

  const passwordHash = await hashPassword(password);
  const now = new Date();
  await UserModel.updateOne(
    { _id: userId },
    { $set: { passwordHash, emailVerifiedAt: user.emailVerifiedAt ?? now } },
  );
  // A completed reset proves control of the inbox, so it also verifies the email.
  await UserModel.updateOne(
    { _id: userId, "authProviders.provider": { $ne: "password" } },
    { $push: { authProviders: { provider: "password", providerUserId: null } } },
  );

  await OneTimeTokenModel.deleteMany({ userId, purpose: "password_reset", consumedAt: null });
  await revokeAllSessions(userId, "password_reset");
  deps.logger.info({ userId }, "Password reset completed");
}

export async function changePassword(
  deps: AuthDeps,
  userId: string,
  currentSessionId: string,
  input: { currentPassword: string; newPassword: string },
): Promise<void> {
  const user = await UserModel.findById(userId).select("+passwordHash status");
  if (!user || user.status !== "active") throw AppError.unauthenticated();
  if (!user.passwordHash) {
    throw AppError.forbidden(
      "This account signs in with Google. Use Forgot password to add a password.",
    );
  }

  const ok = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!ok) {
    throw AppError.badRequest("Current password is incorrect", [
      { field: "currentPassword", message: "Current password is incorrect" },
    ]);
  }

  await UserModel.updateOne(
    { _id: userId },
    { $set: { passwordHash: await hashPassword(input.newPassword) } },
  );
  // Sign out every other device. The current session stays signed in.
  await revokeAllSessions(userId, "password_changed", currentSessionId);
  deps.logger.info({ userId }, "Password changed");
}

/**
 * Signs in (or creates an account) from a verified Google identity. Google
 * accounts are linked to an existing password account only when Google reports
 * the email as verified, which prevents takeover through an unverified address.
 */
export async function signInWithGoogle(
  deps: AuthDeps,
  profile: GoogleProfile,
  role: UserRole,
  userAgent: string | undefined,
): Promise<LoginResult> {
  if (!profile.emailVerified) {
    throw new AppError(403, "FORBIDDEN", "Your Google email address is not verified.");
  }

  let user = await UserModel.findOne({
    authProviders: { $elemMatch: { provider: "google", providerUserId: profile.sub } },
  });

  if (!user) {
    const existing = await UserModel.findOne({ email: profile.email });
    if (existing) {
      await UserModel.updateOne(
        { _id: existing._id, "authProviders.provider": { $ne: "google" } },
        { $push: { authProviders: { provider: "google", providerUserId: profile.sub } } },
      );
      await UserModel.updateOne(
        { _id: existing._id, emailVerifiedAt: null },
        { $set: { emailVerifiedAt: new Date() } },
      );
      user = await UserModel.findById(existing._id);
    } else {
      try {
        user = await UserModel.create({
          fullName: profile.name?.trim() || profile.email.split("@")[0] || "HireLoop member",
          email: profile.email,
          avatarUrl: profile.picture,
          status: "active",
          emailVerifiedAt: new Date(),
          authProviders: [{ provider: "google", providerUserId: profile.sub }],
        });
        await UserRoleModel.create({ userId: user._id, role });
      } catch (err) {
        if (isDuplicateKeyError(err)) {
          throw AppError.conflict("Could not complete Google sign-in. Please try again.");
        }
        throw err;
      }
    }
  }

  if (!user) throw AppError.conflict("Could not complete Google sign-in. Please try again.");
  if (user.status === "suspended") throw AppError.accountSuspended();
  if (user.status === "deactivated") {
    throw new AppError(403, "FORBIDDEN", "This account is no longer available.");
  }

  return completeSignIn(deps, user, userAgent);
}
