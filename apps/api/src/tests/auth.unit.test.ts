import { describe, expect, it } from "vitest";
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { isSafeInternalPath, passwordSchema, registerSchema } from "@hireloop/shared";
import { hashPassword, verifyPassword } from "../services/password.service.js";
import { signAccessToken, verifyAccessToken } from "../services/token.service.js";
import { signOauthState, verifyOauthState } from "../utils/oauthState.js";
import { csrfProtection } from "../middleware/csrf.js";
import { requireRole } from "../middleware/auth.js";
import { escapeHtml, verificationEmail } from "../emails/templates.js";
import { generateToken, safeEqual, sha256Hex } from "../utils/crypto.js";
import { testEnv } from "./testEnv.js";

const SECRET = "x".repeat(40);

describe("password hashing", () => {
  it("verifies the right password and rejects the wrong one", async () => {
    const hash = await hashPassword("correct-horse-1");
    expect(hash).not.toContain("correct-horse-1");
    expect(await verifyPassword("correct-horse-1", hash)).toBe(true);
    expect(await verifyPassword("wrong-horse-2", hash)).toBe(false);
  });
});

describe("password policy", () => {
  it("requires a letter and a number and at least 8 characters", () => {
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false);
    expect(passwordSchema.safeParse("12345678").success).toBe(false);
    expect(passwordSchema.safeParse("abcdefg1").success).toBe(true);
    expect(passwordSchema.safeParse("a1".repeat(40)).success).toBe(false);
  });
});

describe("register schema", () => {
  it("rejects admin self-registration and unknown fields", () => {
    const base = { fullName: "Ada Lovelace", email: "ada@example.com", password: "abcdefg1" };
    expect(registerSchema.safeParse({ ...base, role: "seeker" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, role: "admin" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, role: "seeker", isAdmin: true }).success).toBe(
      false,
    );
  });
});

describe("access tokens", () => {
  it("round-trips the user and session claims", async () => {
    const token = await signAccessToken({ userId: "u1", sessionId: "s1" }, SECRET);
    expect(await verifyAccessToken(token, SECRET)).toEqual({ userId: "u1", sessionId: "s1" });
  });

  it("rejects a token signed with another key", async () => {
    const token = await signAccessToken({ userId: "u1", sessionId: "s1" }, SECRET);
    expect(await verifyAccessToken(token, "y".repeat(40))).toBeNull();
  });

  it("rejects garbage", async () => {
    expect(await verifyAccessToken("not-a-jwt", SECRET)).toBeNull();
  });
});

describe("OAuth state cookie", () => {
  const payload = {
    state: "st",
    nonce: "no",
    role: "seeker" as const,
    next: "/dashboard",
    exp: Date.now() + 60_000,
  };

  it("verifies a fresh, untampered value", () => {
    const value = signOauthState(payload, SECRET);
    expect(verifyOauthState(value, SECRET)).toEqual(payload);
  });

  it("rejects a tampered payload", () => {
    const value = signOauthState(payload, SECRET);
    const [, sig] = value.split(".");
    const forged = Buffer.from(JSON.stringify({ ...payload, role: "recruiter" })).toString(
      "base64url",
    );
    expect(verifyOauthState(`${forged}.${sig}`, SECRET)).toBeNull();
  });

  it("rejects an expired value and a value signed with another secret", () => {
    const expired = signOauthState({ ...payload, exp: Date.now() - 1 }, SECRET);
    expect(verifyOauthState(expired, SECRET)).toBeNull();
    const value = signOauthState(payload, SECRET);
    expect(verifyOauthState(value, "z".repeat(40))).toBeNull();
    expect(verifyOauthState(undefined, SECRET)).toBeNull();
  });
});

describe("safe internal redirect paths", () => {
  it.each(["/dashboard", "/jobs?page=2"])("accepts %s", (value) => {
    expect(isSafeInternalPath(value)).toBe(true);
  });
  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "dashboard", "/a\nb", ""])(
    "rejects %j",
    (value) => {
      expect(isSafeInternalPath(value)).toBe(false);
    },
  );
});

describe("crypto helpers", () => {
  it("hashes deterministically and never stores the raw value", () => {
    expect(sha256Hex("abc")).toBe(sha256Hex("abc"));
    expect(sha256Hex("abc")).not.toContain("abc");
  });
  it("generates unique high-entropy tokens", () => {
    const a = generateToken();
    expect(a).not.toBe(generateToken());
    expect(a.length).toBeGreaterThanOrEqual(40);
  });
  it("compares in constant-length fashion and rejects different lengths", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("email templates", () => {
  it("escapes user-supplied names in HTML but not in plain text", () => {
    const hostile = '<img src=x onerror="alert(1)">';
    const email = verificationEmail({ fullName: hostile, url: "https://example.com/v?t=1" });
    expect(email.html).not.toContain("<img");
    expect(email.html).toContain("&lt;img");
    expect(email.text).toContain(hostile);
    expect(escapeHtml(`"'&`)).toBe("&quot;&#39;&amp;");
  });
});

describe("csrfProtection", () => {
  const env = testEnv();
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(csrfProtection(env));
  app.post("/write", (_req, res) => res.json({ ok: true }));
  app.get("/read", (_req, res) => res.json({ ok: true }));

  it("allows safe methods without a token", async () => {
    const res = await request(app).get("/read").set("Cookie", "hl_access=abc");
    expect(res.status).toBe(200);
  });

  it("allows unauthenticated POSTs without cookies", async () => {
    const res = await request(app).post("/write").send({});
    expect(res.status).toBe(200);
  });

  it("rejects a cookie-authenticated POST without the matching header", async () => {
    const res = await request(app)
      .post("/write")
      .set("Cookie", "hl_access=abc; hl_csrf=t1")
      .send({});
    expect(res.status).toBe(403);
  });

  it("accepts the matching header", async () => {
    const res = await request(app)
      .post("/write")
      .set("Cookie", "hl_access=abc; hl_csrf=t1")
      .set("X-CSRF-Token", "t1")
      .send({});
    expect(res.status).toBe(200);
  });

  it("rejects a request from an untrusted origin", async () => {
    const res = await request(app).post("/write").set("Origin", "https://evil.example").send({});
    expect(res.status).toBe(403);
  });
});

describe("requireRole", () => {
  const app = express();
  app.use((req, _res, next) => {
    const roles = req.get("x-test-roles")?.split(",") ?? [];
    if (roles.length) req.auth = { userId: "u", sessionId: "s", user: { roles } as never };
    next();
  });
  app.get("/admin", requireRole("admin"), (_req, res) => res.json({ ok: true }));

  it("forbids a seeker", async () => {
    const res = await request(app).get("/admin").set("x-test-roles", "seeker");
    expect(res.status).toBe(403);
  });
  it("allows an admin", async () => {
    const res = await request(app).get("/admin").set("x-test-roles", "seeker,admin");
    expect(res.status).toBe(200);
  });
  it("forbids a request with no auth context", async () => {
    const res = await request(app).get("/admin");
    expect(res.status).toBe(403);
  });
});
