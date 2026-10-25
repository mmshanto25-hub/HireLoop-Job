import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{8,100}$/;

/**
 * Attaches a request ID to every request. A client-supplied ID is accepted
 * only when it matches a safe format, which prevents log injection.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header("x-request-id");
  const id = incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.locals["requestId"] = id;
  res.setHeader("X-Request-Id", id);
  next();
}
