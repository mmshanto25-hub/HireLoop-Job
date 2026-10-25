/**
 * End-to-end auth flow against a real MongoDB. Skipped unless TEST_MONGODB_URI
 * is set, so it never touches a production or shared database. The database
 * is dropped before the run.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../app.js";
import type { EmailMessage, EmailSender } from "../services/email.service.js";
import { UserModel } from "../models/index.js";
import { createLogger } from "../utils/logger.js";
import { testEnv } from "./testEnv.js";

const uri = process.env["TEST_MONGODB_URI"];

class CapturingSender implements EmailSender {
  messages: EmailMessage[] = [];
  async send(message: EmailMessage) {
    this.messages.push(message);
  }
  tokenFor(to: string, path: string): string {
    const msg = [...this.messages].reverse().find((m) => m.to === to && m.text.includes(path));
    const match = msg?.text.match(new RegExp(`${path}\\?token=([^\\s]+)`));
    if (!match?.[1]) throw new Error(`No ${path} token captured for ${to}`);
    return decodeURIComponent(match[1]);
  }
}

function cookieValue(res: request.Response, name: string): string | undefined {
  const raw = res.headers["set-cookie"] as unknown as string[] | undefined;
  const found = raw?.find((c) => c.startsWith(`${name}=`));
  return found?.split(";")[0]?.slice(name.length + 1);
}

describe.skipIf(!uri)("auth flow (integration, real MongoDB)", () => {
  let app: Express;
  let email: CapturingSender;
  const origin = "http://localhost:5173";
  const seeker = {
    fullName: "Ada Seeker",
    email: "ada@example.com",
    password: "abcdefg1",
    role: "seeker",
  };

  beforeAll(async () => {
    await mongoose.connect(uri!, { dbName: "hireloop_auth_test" });
    await mongoose.connection.dropDatabase();
    await UserModel.syncIndexes();
    email = new CapturingSender();
    app = createApp({
      env: testEnv({ MONGODB_URI: uri! }),
      logger: createLogger("silent"),
      email,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it("returns the same response for a new and an existing email (no enumeration)", async () => {
    const first = await request(app)
      .post("/api/v1/auth/register")
      .set("Origin", origin)
      .send(seeker);
    const second = await request(app)
      .post("/api/v1/auth/register")
      .set("Origin", origin)
      .send(seeker);
    expect(first.status).toBe(202);
    expect(second.status).toBe(202);
    expect(first.body.data).toEqual(second.body.data);
  });

  it("refuses admin self-registration", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .set("Origin", origin)
      .send({ ...seeker, email: "x@example.com", role: "admin" });
    expect(res.status).toBe(400);
  });

  it("blocks login until the email is verified", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", origin)
      .send({ email: seeker.email, password: seeker.password });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("verifies, signs in, and returns the current user", async () => {
    const token = email.tokenFor(seeker.email, "/verify-email");
    const verified = await request(app)
      .post("/api/v1/auth/verify-email")
      .set("Origin", origin)
      .send({ token });
    expect(verified.status).toBe(200);

    const reused = await request(app)
      .post("/api/v1/auth/verify-email")
      .set("Origin", origin)
      .send({ token });
    expect(reused.status).toBe(400);

    const login = await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", origin)
      .send({ email: seeker.email, password: seeker.password });
    expect(login.status).toBe(200);
    expect(login.body.data.user.roles).toEqual(["seeker"]);
    expect(cookieValue(login, "hl_access")).toBeTruthy();
    expect(cookieValue(login, "hl_refresh")).toBeTruthy();

    const access = cookieValue(login, "hl_access")!;
    const me = await request(app).get("/api/v1/auth/me").set("Cookie", `hl_access=${access}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(seeker.email);
  });

  it("rotates refresh tokens and revokes the session when an old one is reused", async () => {
    const login = await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", origin)
      .send({ email: seeker.email, password: seeker.password });
    const oldRefresh = cookieValue(login, "hl_refresh")!;
    const csrf = cookieValue(login, "hl_csrf")!;

    const rotated = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Origin", origin)
      .set("Cookie", `hl_refresh=${oldRefresh}; hl_csrf=${csrf}`)
      .set("X-CSRF-Token", csrf);
    expect(rotated.status).toBe(200);
    const newRefresh = cookieValue(rotated, "hl_refresh")!;
    expect(newRefresh).not.toBe(oldRefresh);

    const reuse = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Origin", origin)
      .set("Cookie", `hl_refresh=${oldRefresh}; hl_csrf=${csrf}`)
      .set("X-CSRF-Token", csrf);
    expect(reuse.status).toBe(401);

    const afterReuse = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Origin", origin)
      .set("Cookie", `hl_refresh=${newRefresh}; hl_csrf=${csrf}`)
      .set("X-CSRF-Token", csrf);
    expect(afterReuse.status).toBe(401);
  });

  it("denies sign-in for a suspended account with the suspension message", async () => {
    await UserModel.updateOne({ email: seeker.email }, { $set: { status: "suspended" } });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", origin)
      .send({ email: seeker.email, password: seeker.password });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCOUNT_SUSPENDED");
    await UserModel.updateOne({ email: seeker.email }, { $set: { status: "active" } });
  });

  it("returns the same generic response for forgot-password on unknown and known emails", async () => {
    const known = await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("Origin", origin)
      .send({ email: seeker.email });
    const unknown = await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("Origin", origin)
      .send({ email: "nobody@example.com" });
    expect(known.status).toBe(202);
    expect(unknown.status).toBe(202);
    expect(known.body.data).toEqual(unknown.body.data);
  });

  it("rejects login with the wrong password using the generic message", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", origin)
      .send({ email: seeker.email, password: "wrongpass9" });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Invalid email or password.");
  });

  it("rejects cookie-authenticated writes without the CSRF header", async () => {
    const login = await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", origin)
      .send({ email: seeker.email, password: seeker.password });
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Origin", origin)
      .set(
        "Cookie",
        `hl_access=${cookieValue(login, "hl_access")}; hl_csrf=${cookieValue(login, "hl_csrf")}`,
      );
    expect(res.status).toBe(403);
  });
});
