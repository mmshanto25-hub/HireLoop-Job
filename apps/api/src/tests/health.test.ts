import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { createLogger } from "../utils/logger.js";
import { testEnv } from "./testEnv.js";

const env = testEnv();

const app = createApp({ env, logger: createLogger("silent") });

describe("GET /api/v1/health", () => {
  it("returns a successful liveness envelope without touching the database", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
    expect(res.body.data.service).toBe("hireloop-api");
    expect(typeof res.body.meta.requestId).toBe("string");
  });

  it("echoes a safe incoming request ID and generates one for unsafe values", async () => {
    const safe = await request(app).get("/api/v1/health").set("X-Request-Id", "abc-12345678");
    expect(safe.headers["x-request-id"]).toBe("abc-12345678");

    const unsafe = await request(app).get("/api/v1/health").set("X-Request-Id", "bad id;<script>");
    expect(unsafe.headers["x-request-id"]).not.toBe("bad id;<script>");
    expect(unsafe.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("GET /api/v1/ready", () => {
  it("reports not ready when no database connection exists", async () => {
    const res = await request(app).get("/api/v1/ready");
    expect(res.status).toBe(503);
    expect(res.body.data.status).toBe("not_ready");
    expect(res.body.data.checks.database).toBe("disconnected");
  });
});

describe("error handling", () => {
  it("returns a structured 404 for unknown routes", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("does not expose the framework signature header", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("applies security headers", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["content-security-policy"]).toContain("default-src 'none'");
  });

  it("rejects malformed JSON with a validation error", async () => {
    const res = await request(app)
      .post("/api/v1/unknown")
      .set("Content-Type", "application/json")
      .send("{bad json");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects oversized bodies", async () => {
    const huge = JSON.stringify({ data: "x".repeat(150 * 1024) });
    const res = await request(app)
      .post("/api/v1/unknown")
      .set("Content-Type", "application/json")
      .send(huge);
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });
});

describe("CORS", () => {
  it("allows only the configured web origin with credentials", async () => {
    const allowed = await request(app).get("/api/v1/health").set("Origin", "http://localhost:5173");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(allowed.headers["access-control-allow-credentials"]).toBe("true");

    const denied = await request(app).get("/api/v1/health").set("Origin", "https://evil.example");
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
