import type { ApiErrorCode, ApiFieldError } from "@hireloop/shared";

/**
 * Operational errors that are safe to show to clients. Anything that is not
 * an AppError is treated as an internal error and reported generically.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: ApiFieldError[],
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message: string, details?: ApiFieldError[]) {
    return new AppError(400, "VALIDATION_ERROR", message, details);
  }

  static unauthenticated(message = "Authentication is required") {
    return new AppError(401, "UNAUTHENTICATED", message);
  }

  static forbidden(message = "You do not have permission to perform this action") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(message = "The requested resource was not found") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new AppError(409, "CONFLICT", message);
  }

  static payloadTooLarge(message = "The request body is too large") {
    return new AppError(413, "PAYLOAD_TOO_LARGE", message);
  }

  static serviceUnavailable(message = "The service is temporarily unavailable") {
    return new AppError(503, "SERVICE_UNAVAILABLE", message);
  }

  static emailNotVerified(message = "Verify your email address before signing in") {
    return new AppError(403, "EMAIL_NOT_VERIFIED", message);
  }

  static accountSuspended(message = "This account has been suspended. Contact support for help.") {
    return new AppError(403, "ACCOUNT_SUSPENDED", message);
  }

  static tokenInvalid(message = "This link is invalid or has expired. Request a new one.") {
    return new AppError(400, "TOKEN_INVALID", message);
  }

  /** Generic sign-in failure. Deliberately identical for unknown email and wrong password. */
  static invalidCredentials() {
    return new AppError(401, "UNAUTHENTICATED", "Invalid email or password");
  }
}
