import type { Response } from "express";
import type { ApiSuccess, PaginationMeta } from "@hireloop/shared";

/** Sends a success envelope with the request ID attached for support tracing. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { status?: number; pagination?: PaginationMeta } = {},
): void {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    meta: {
      requestId: res.locals["requestId"] as string | undefined,
      ...(options.pagination ? { pagination: options.pagination } : {}),
    },
  };
  res.status(options.status ?? 200).json(body);
}
