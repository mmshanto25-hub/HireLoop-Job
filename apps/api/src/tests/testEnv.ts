import { envSchema, type Env } from "../config/env.js";

/** A complete, valid configuration for tests. Overrides are applied after validation. */
export function testEnv(overrides: Partial<Record<keyof Env, unknown>> = {}): Env {
  return envSchema.parse({
    NODE_ENV: "test",
    PORT: 4000,
    WEB_URL: "http://localhost:5173",
    API_URL: "http://localhost:4000",
    MONGODB_URI: "mongodb://127.0.0.1:27017/hireloop_test",
    TRUST_PROXY: 0,
    SESSION_SECRET: "s".repeat(40),
    ACCESS_TOKEN_SECRET: "a".repeat(40),
    REFRESH_TOKEN_SECRET: "r".repeat(40),
    LOG_LEVEL: "silent",
    EMAIL_PROVIDER: "console",
    ...overrides,
  });
}
