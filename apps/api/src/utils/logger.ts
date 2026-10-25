import pino from "pino";

/**
 * Structured JSON logger. Sensitive fields are redacted so credentials,
 * cookies and authorization headers never reach log output.
 */
export function createLogger(level: string = "info") {
  return pino({
    level,
    base: { service: "hireloop-api" },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers['set-cookie']",
        "password",
        "passwordHash",
        "token",
        "refreshToken",
        "accessToken",
        "*.password",
        "*.passwordHash",
        "*.token",
      ],
      censor: "[REDACTED]",
    },
  });
}

export type Logger = ReturnType<typeof createLogger>;
