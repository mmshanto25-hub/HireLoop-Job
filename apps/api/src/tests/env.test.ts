import { describe, expect, it } from "vitest";
import { EnvValidationError, loadEnv } from "../config/env.js";

const secret = (char: string) => char.repeat(48);

const validDevEnv = {
  NODE_ENV: "development",
  PORT: "4000",
  WEB_URL: "http://localhost:5173/",
  API_URL: "http://localhost:4000",
  MONGODB_URI: "mongodb://127.0.0.1:27017/hireloop",
  SESSION_SECRET: secret("a"),
  ACCESS_TOKEN_SECRET: secret("b"),
  REFRESH_TOKEN_SECRET: secret("c"),
};

describe("loadEnv", () => {
  it("parses a valid development configuration and normalises trailing slashes", () => {
    const env = loadEnv(validDevEnv);
    expect(env.PORT).toBe(4000);
    expect(env.WEB_URL).toBe("http://localhost:5173");
    expect(env.NODE_ENV).toBe("development");
    expect(env.TRUST_PROXY).toBe(0);
  });

  it("reports every missing required variable at once", () => {
    let caught: unknown;
    try {
      loadEnv({ NODE_ENV: "development" });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(EnvValidationError);
    const issues = (caught as EnvValidationError).issues.join("\n");
    expect(issues).toContain("MONGODB_URI");
    expect(issues).toContain("SESSION_SECRET");
    expect(issues).toContain("ACCESS_TOKEN_SECRET");
    expect(issues).toContain("REFRESH_TOKEN_SECRET");
    expect(issues).toContain("WEB_URL");
  });

  it("rejects secrets shorter than 32 characters", () => {
    expect(() => loadEnv({ ...validDevEnv, ACCESS_TOKEN_SECRET: "short" })).toThrow(
      /ACCESS_TOKEN_SECRET must be at least 32 characters/,
    );
  });

  it("rejects identical token secrets", () => {
    expect(() => loadEnv({ ...validDevEnv, REFRESH_TOKEN_SECRET: secret("b") })).toThrow(
      /must all be different/,
    );
  });

  it("rejects a non-MongoDB connection string", () => {
    expect(() => loadEnv({ ...validDevEnv, MONGODB_URI: "postgres://localhost/db" })).toThrow(
      /MONGODB_URI must start with/,
    );
  });

  it("requires https public URLs in production", () => {
    expect(() =>
      loadEnv({
        ...validDevEnv,
        NODE_ENV: "production",
        WEB_URL: "http://hireloop.example",
        API_URL: "https://api.hireloop.example",
      }),
    ).toThrow(/WEB_URL must use https in production/);
  });

  it("accepts https URLs in production when Resend is configured", () => {
    const env = loadEnv({
      ...validDevEnv,
      NODE_ENV: "production",
      WEB_URL: "https://hireloop.example",
      API_URL: "https://api.hireloop.example",
      EMAIL_PROVIDER: "resend",
      EMAIL_API_KEY: "re_test_key",
    });
    expect(env.NODE_ENV).toBe("production");
  });

  it("refuses the console email sender in production", () => {
    expect(() =>
      loadEnv({
        ...validDevEnv,
        NODE_ENV: "production",
        WEB_URL: "https://hireloop.example",
        API_URL: "https://api.hireloop.example",
      }),
    ).toThrow(/EMAIL_PROVIDER must be resend in production/);
  });

  it("requires all three Google settings together", () => {
    expect(() => loadEnv({ ...validDevEnv, GOOGLE_CLIENT_ID: "client-id-only" })).toThrow(
      /GOOGLE_CLIENT_SECRET/,
    );
  });

  it("treats blank email settings from a copied .env.example as unset", () => {
    const env = loadEnv({ ...validDevEnv, EMAIL_PROVIDER: "", EMAIL_FROM: "" });
    expect(env.EMAIL_PROVIDER).toBe("console");
    expect(env.EMAIL_FROM).toBe("HireLoop <no-reply@localhost>");
  });
});
