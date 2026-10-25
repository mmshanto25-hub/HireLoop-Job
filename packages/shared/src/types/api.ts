import type { PaginationMeta } from "../schemas/pagination.js";

/**
 * Response envelopes used by every API route. Keeping one shape lets the web
 * client handle success and failure uniformly.
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { requestId?: string; pagination?: PaginationMeta };
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiFieldError[];
  };
  meta?: { requestId?: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const API_ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "PAYLOAD_TOO_LARGE",
  "INTERNAL_ERROR",
  "SERVICE_UNAVAILABLE",
  "EMAIL_NOT_VERIFIED",
  "ACCOUNT_SUSPENDED",
  "TOKEN_INVALID",
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface HealthStatus {
  status: "ok";
  service: string;
  version: string;
  timestamp: string;
}

export interface ReadinessStatus {
  status: "ready" | "not_ready";
  checks: {
    database: "connected" | "disconnected" | "connecting";
  };
  timestamp: string;
}
