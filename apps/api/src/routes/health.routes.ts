import { Router } from "express";
import type { HealthStatus, ReadinessStatus } from "@hireloop/shared";
import { getDatabaseState } from "../config/database.js";
import { sendSuccess } from "../utils/response.js";

export interface HealthRouteOptions {
  version: string;
}

/**
 * /health  — liveness: the process is running. Never touches the database.
 * /ready   — readiness: the database is connected, so traffic can be served.
 */
export function createHealthRouter({ version }: HealthRouteOptions): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    const body: HealthStatus = {
      status: "ok",
      service: "hireloop-api",
      version,
      timestamp: new Date().toISOString(),
    };
    sendSuccess(res, body);
  });

  router.get("/ready", (_req, res) => {
    const database = getDatabaseState();
    const ready = database === "connected";
    const body: ReadinessStatus = {
      status: ready ? "ready" : "not_ready",
      checks: { database },
      timestamp: new Date().toISOString(),
    };
    if (ready) {
      sendSuccess(res, body);
    } else {
      res.status(503).json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "The service is not ready to serve requests",
        },
        data: body,
        meta: { requestId: res.locals["requestId"] as string | undefined },
      });
    }
  });

  return router;
}
