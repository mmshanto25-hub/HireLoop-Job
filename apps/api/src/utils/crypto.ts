import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/** Random URL-safe token. 32 bytes gives 256 bits of entropy. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** One-way hash used before storing any secret. The plaintext is never persisted. */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function hmacHex(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value, "utf8").digest("hex");
}

/** Constant-time string comparison. Returns false for different lengths without leaking content. */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
