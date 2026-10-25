import { Router } from "express";
import { createAuthController, type AuthControllerDeps } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import {
  loginRateLimiter,
  refreshRateLimiter,
  sensitiveAuthRateLimiter,
} from "../middleware/authRateLimit.js";

/**
 * Mounted at /api/v1/auth. Every endpoint returns the standard envelope.
 * Sign-in and recovery endpoints have their own limiters on top of the general one.
 */
export function createAuthRouter(deps: AuthControllerDeps): Router {
  const c = createAuthController(deps);
  const router = Router();

  router.post("/register", sensitiveAuthRateLimiter, c.register);
  router.post("/verify-email", c.verifyEmail);
  router.post("/resend-verification", sensitiveAuthRateLimiter, c.resendVerification);
  router.post("/login", loginRateLimiter, c.login);
  router.post("/refresh", refreshRateLimiter, c.refresh);
  router.post("/logout", c.logout);
  router.post("/forgot-password", sensitiveAuthRateLimiter, c.forgotPassword);
  router.post("/reset-password", sensitiveAuthRateLimiter, c.resetPassword);
  router.post("/change-password", requireAuth(deps.env), c.changePassword);
  router.get("/me", requireAuth(deps.env), c.me);

  router.get("/google", c.googleStart);
  router.get("/google/callback", c.googleCallback);

  return router;
}
