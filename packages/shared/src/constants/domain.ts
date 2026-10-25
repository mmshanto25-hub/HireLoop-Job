/**
 * Domain constants shared by the API and the web app.
 * These mirror the enumerations in the HireLoop data model. The database
 * schemas in apps/api import from here so the values cannot drift apart.
 */

export const USER_ROLES = ["seeker", "recruiter", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Roles a visitor may choose at public registration. Admin is never self-assignable. */
export const SELF_ASSIGNABLE_ROLES = ["seeker", "recruiter"] as const satisfies readonly UserRole[];

export const USER_STATUSES = ["active", "suspended", "deactivated"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const AUTH_PROVIDERS = ["password", "google"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const COMPANY_STATUSES = ["pending", "approved", "rejected"] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const JOB_TYPES = ["full-time", "part-time", "remote", "contract", "internship"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_STATUSES = ["active", "closed", "draft"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STATUSES = [
  "applied",
  "under_review",
  "shortlisted",
  "rejected",
  "offered",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const SUBSCRIPTION_STATUSES = [
  "incomplete",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "trialing",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const PLAN_AUDIENCES = ["seeker", "recruiter"] as const;
export type PlanAudience = (typeof PLAN_AUDIENCES)[number];

export const PAYMENT_STATUSES = ["succeeded", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Resume uploads are limited to 5 MB. Enforced server-side in later phases. */
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Password policy, shared so the form and the server enforce the same rules.
 * The maximum is 72 because bcrypt only uses the first 72 bytes of input;
 * a longer password would be silently truncated.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
