import type { NextFunction, Request, Response } from "express";

/**
 * Express 4 does not forward rejected promises from route handlers to the error
 * middleware. This wrapper makes every async handler's failure reach the
 * central error handler.
 */
export function asyncHandler<R extends Request = Request>(
  fn: (req: R, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: R, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
