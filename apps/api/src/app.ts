import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import type { Env } from "./config/env.js";
import { createEmailSender, type EmailSender } from "./services/email.service.js";
import { csrfProtection } from "./middleware/csrf.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createAdminRouter } from "./routes/admin.routes.js";
import { createProfileRouter } from "./routes/profile.routes.js";
import { createCompanyRouter, createAdminCompanyRouter } from "./routes/company.routes.js";
import { createJobRouter } from "./routes/job.routes.js";
import { createApplicationRouter } from "./routes/application.routes.js";
import { createSavedJobRouter } from "./routes/saved-job.routes.js";
import { createNotificationRouter } from "./routes/notification.routes.js";
import { createDashboardRouter } from "./routes/dashboard.routes.js";
import { createUploadRouter } from "./routes/upload.routes.js";
import { createLogger, type Logger } from "./utils/logger.js";
import { requestId } from "./middleware/requestId.js";
import { createErrorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimit.js";
import { createHealthRouter } from "./routes/health.routes.js";

export const API_VERSION = "0.1.0";
export const API_PREFIX = "/api/v1";

export interface AppDependencies {
  env: Env;
  logger?: Logger;
  /** Tests inject a capturing sender. Production uses the one built from config. */
  email?: EmailSender;
}

/**
 * Builds the Express application. It takes dependencies as arguments so tests
 * can run it without starting a server or touching real infrastructure.
 */
export function createApp({ env, logger, email }: AppDependencies): Express {
  const log = logger ?? createLogger(env.LOG_LEVEL);
  const emailSender = email ?? createEmailSender(env, log);
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(requestId);
  app.use(
    pinoHttp({
      logger: log,
      genReqId: (req, res) => res.locals["requestId"] as string,
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      autoLogging: { ignore: (req) => req.url === `${API_PREFIX}/health` },
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          imgSrc: ["'self'", "data:", "blob:"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // Explicit origin allow-list. Credentials are enabled for the cookie-based
  // authentication added in Phase 2. Wildcard origins are never used.
  app.use(
    cors({
      origin: [env.WEB_URL],
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-Request-Id", "X-CSRF-Token"],
      exposedHeaders: ["X-Request-Id"],
      maxAge: 600,
    }),
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(cookieParser());

  app.use(API_PREFIX, apiRateLimiter);
  app.use(API_PREFIX, csrfProtection(env));
  app.use(API_PREFIX, createHealthRouter({ version: API_VERSION }));
  app.use(`${API_PREFIX}/auth`, createAuthRouter({ env, email: emailSender, logger: log }));
  app.use(`${API_PREFIX}/admin`, createAdminRouter({ env }));
  app.use(`${API_PREFIX}/admin/companies`, createAdminCompanyRouter({ env }));
  app.use(`${API_PREFIX}/profiles`, createProfileRouter({ env }));
  app.use(`${API_PREFIX}/companies`, createCompanyRouter({ env }));
  app.use(`${API_PREFIX}/jobs`, createJobRouter({ env, logger: log }));
  app.use(`${API_PREFIX}/applications`, createApplicationRouter({ env, logger: log }));
  app.use(`${API_PREFIX}/saved-jobs`, createSavedJobRouter({ env }));
  app.use(`${API_PREFIX}/notifications`, createNotificationRouter({ env }));
  app.use(`${API_PREFIX}/dashboard`, createDashboardRouter({ env }));
  app.use(`${API_PREFIX}/uploads`, createUploadRouter());

  app.use(notFoundHandler);
  app.use(createErrorHandler(log));

  return app;
}
