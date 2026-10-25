import type { AuthUser } from "@hireloop/shared";

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth. Absent on public routes. */
      auth?: {
        userId: string;
        sessionId: string;
        user: AuthUser;
      };
    }
  }
}

export {};
