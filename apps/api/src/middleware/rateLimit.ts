import rateLimit from "express-rate-limit";

/**
 * General API limit. Stricter limiters for authentication, uploads and
 * applications are added in later phases alongside those routes.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many requests. Please slow down and try again." },
  },
});
