import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { AppError } from "../utils/AppError.js";
import { RESUME_MAX_BYTES } from "@hireloop/shared";

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
const PUBLIC_DIR = path.join(UPLOADS_ROOT, "public");
const PRIVATE_DIR = path.join(UPLOADS_ROOT, "private");

// Ensure upload directories exist at module load
async function ensureDirs() {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.mkdir(PRIVATE_DIR, { recursive: true });
}
void ensureDirs();

/**
 * Validates PDF file header signature (%PDF- at byte offset 0).
 * Prevents disguised executable files.
 */
export function isValidPdfSignature(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  // %PDF- magic bytes: 0x25 0x50 0x44 0x46 0x2D
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

/**
 * Validates common image header signatures (JPEG, PNG, WebP).
 */
export function isValidImageSignature(buffer: Buffer, mimetype: string): boolean {
  if (buffer.length < 8) return false;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }
  // WebP: RIFF ... WEBP
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return true;
  }
  // SVG (XML or svg tag text)
  if (mimetype === "image/svg+xml" && buffer.toString("utf8", 0, 100).includes("<svg")) {
    return true;
  }
  return false;
}

export interface StoredFile {
  objectKey: string;
  url: string;
  filename: string;
  size: number;
}

/**
 * Stores a public image (avatar or company logo).
 * Returns random object key and access URL.
 */
export async function storePublicImage(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string,
): Promise<StoredFile> {
  if (buffer.length > 2 * 1024 * 1024) {
    throw AppError.badRequest("Image size must be 2 MB or smaller");
  }
  if (!isValidImageSignature(buffer, mimetype)) {
    throw AppError.badRequest("Invalid image file format. Supported: PNG, JPEG, WebP, SVG");
  }

  await ensureDirs();
  const ext = path.extname(originalFilename).toLowerCase() || ".png";
  const objectKey = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(PUBLIC_DIR, objectKey);

  await fs.writeFile(filePath, buffer);

  return {
    objectKey,
    url: `/api/v1/uploads/public/${objectKey}`,
    filename: originalFilename,
    size: buffer.length,
  };
}

/**
 * Stores a private document (e.g. resume) in private storage.
 * Does not expose a public URL. Access is governed by authorization endpoints.
 */
export async function storePrivateResume(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string,
): Promise<StoredFile> {
  if (buffer.length > RESUME_MAX_BYTES) {
    throw AppError.badRequest("Resume size must be 5 MB or smaller");
  }
  if (mimetype !== "application/pdf" || !isValidPdfSignature(buffer)) {
    throw AppError.badRequest("Only genuine PDF documents are accepted for resumes");
  }

  await ensureDirs();
  const objectKey = `${crypto.randomUUID()}.pdf`;
  const filePath = path.join(PRIVATE_DIR, objectKey);

  await fs.writeFile(filePath, buffer);

  return {
    objectKey,
    url: "", // private!
    filename: originalFilename,
    size: buffer.length,
  };
}

/**
 * Reads a private document by object key.
 */
export async function getPrivateResumeStream(objectKey: string): Promise<Buffer> {
  // Prevent path traversal
  const safeKey = path.basename(objectKey);
  const filePath = path.join(PRIVATE_DIR, safeKey);
  try {
    return await fs.readFile(filePath);
  } catch {
    throw AppError.notFound("Resume file not found");
  }
}

/**
 * Deletes a private document.
 */
export async function deletePrivateResume(objectKey: string): Promise<void> {
  const safeKey = path.basename(objectKey);
  const filePath = path.join(PRIVATE_DIR, safeKey);
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore if already deleted
  }
}

/**
 * Reads a public asset by object key.
 */
export async function getPublicAssetPath(objectKey: string): Promise<string> {
  const safeKey = path.basename(objectKey);
  const filePath = path.join(PUBLIC_DIR, safeKey);
  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    throw AppError.notFound("Asset not found");
  }
}

