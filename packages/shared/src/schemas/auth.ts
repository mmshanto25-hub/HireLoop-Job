import { z } from "zod";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  SELF_ASSIGNABLE_ROLES,
} from "../constants/domain.js";

/**
 * Auth request schemas. They are shared so the sign-up form and the API reject
 * exactly the same inputs. The server always re-validates; the client is only
 * a convenience.
 */

export const emailSchema = z
  .string({ error: "Enter your email address" })
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address")
  .max(254, "Email address is too long")
  .email("Enter a valid email address");

export const passwordSchema = z
  .string({ error: "Enter a password" })
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

const tokenSchema = z
  .string({ error: "The link is missing its token" })
  .min(20, "This link is not valid")
  .max(200, "This link is not valid");

export const registerSchema = z
  .object({
    fullName: z
      .string({ error: "Enter your full name" })
      .trim()
      .min(2, "Enter your full name")
      .max(100, "Name must be 100 characters or fewer"),
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(SELF_ASSIGNABLE_ROLES, { error: "Choose seeker or recruiter" }),
  })
  // Strict: unknown keys (for example "roles" or "status") are rejected, so a
  // client can never set authorization fields during sign-up.
  .strict();
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z
  .object({
    email: emailSchema,
    // Login does not enforce the password policy; old or imported passwords must still work.
    password: z.string({ error: "Enter your password" }).min(1, "Enter your password").max(128),
  })
  .strict();
export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({ token: tokenSchema }).strict();
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({ email: emailSchema }).strict();
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({ token: tokenSchema, password: passwordSchema })
  .strict();
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ error: "Enter your current password" }).min(1).max(128),
    newPassword: passwordSchema,
  })
  .strict()
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "Choose a password you have not used before",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/** Only these destinations may be used after sign-in. Blocks open redirects. */
export function isSafeInternalPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\") &&
    value.length <= 500 &&
    // Reject control characters, which browsers strip inconsistently.
    // eslint-disable-next-line no-control-regex
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}
