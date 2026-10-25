import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { ApiFailure, ApiFieldError } from "@hireloop/shared";
import { AppError } from "../utils/AppError.js";
import type { Logger } from "../utils/logger.js";

export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiFailure = {
    success: false,
    error: { code: "NOT_FOUND", message: `No route matches ${req.method} ${req.path}` },
    meta: { requestId: res.locals["requestId"] as string | undefined },
  };
  res.status(404).json(body);
}

/**
 * Central error handler. Operational errors return their message. Anything
 * else is logged in full on the server and returned generically to the client.
 */
export function createErrorHandler(logger: Logger) {
  return function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    const requestId = res.locals["requestId"] as string | undefined;

    if (err instanceof ZodError) {
      const details: ApiFieldError[] = err.issues.map((issue) => ({
        field: issue.path.join(".") || "(root)",
        message: issue.message,
      }));
      sendFailure(res, 400, "VALIDATION_ERROR", "The request contains invalid data", details);
      return;
    }

    if (err instanceof AppError) {
      sendFailure(res, err.statusCode, err.code, err.message, err.details);
      return;
    }

    if (isBodyParserError(err)) {
      const status = err.status ?? 400;
      if (status === 413) {
        sendFailure(res, 413, "PAYLOAD_TOO_LARGE", "The request body is too large");
      } else {
        sendFailure(res, 400, "VALIDATION_ERROR", "The request body is not valid JSON");
      }
      return;
    }

    logger.error(
      {
        requestId,
        method: req.method,
        path: req.path,
        err:
          err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
      },
      "Unhandled error",
    );
    sendFailure(res, 500, "INTERNAL_ERROR", "An unexpected error occurred. Please try again.");
  };
}

function sendFailure(
  res: Response,
  status: number,
  code: ApiFailure["error"]["code"],
  message: string,
  details?: ApiFieldError[],
): void {
  const body: ApiFailure = {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
    meta: { requestId: res.locals["requestId"] as string | undefined },
  };
  res.status(status).json(body);
}

function isBodyParserError(err: unknown): err is { status?: number; type?: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    typeof (err as { type?: unknown }).type === "string" &&
    ((err as { type: string }).type === "entity.parse.failed" ||
      (err as { type: string }).type === "entity.too.large")
  );
}
