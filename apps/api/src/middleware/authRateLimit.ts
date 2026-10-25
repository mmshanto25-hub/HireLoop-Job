import rateLimit from "express-rate-limit";

/**
 * Tighter limits for endpoints that can be abused for password guessing,
 * account discovery, or email flooding. Keys are per client IP, the same as the
 * general limiter, so behind a proxy TRUST_PROXY must be set correctly.
 */
const json = (code: string, message: string) => ({
  success: false,
  error: { code, message },
});

/** Sign-in attempts: 10 per 15 minutes per IP. Counts failures only. */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("RATE_LIMITED", "Too many sign-in attempts. Try again in a few minutes."),
});

/** Registration, resend, forgot and reset: 20 per hour per IP. */
export const sensitiveAuthRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("RATE_LIMITED", "Too many requests. Try again later."),
});

/** Refresh is called often by the web app, so the limit is higher. */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("RATE_LIMITED", "Too many requests. Please slow down."),
});
