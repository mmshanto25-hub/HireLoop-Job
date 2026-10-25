import mongoose from "mongoose";
import type { Logger } from "../utils/logger.js";

export interface DatabaseOptions {
  uri: string;
  logger: Logger;
  serverSelectionTimeoutMS?: number;
}

/**
 * Connects Mongoose once at startup. Mongoose buffers commands while
 * connecting, so routes must not run before this resolves.
 */
export async function connectDatabase({
  uri,
  logger,
  serverSelectionTimeoutMS = 10_000,
}: DatabaseOptions): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, { serverSelectionTimeoutMS });
  logger.info({ database: mongoose.connection.name }, "MongoDB connected");

  // Listen for runtime changes only after the first successful connection, so a
  // failed initial connect is reported once, by the caller, not as "connection lost".
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB connection lost"));
  mongoose.connection.on("reconnected", () => logger.info("MongoDB connection restored"));
  mongoose.connection.on("error", (err: Error) =>
    logger.error({ err: err.message }, "MongoDB connection error"),
  );
  return mongoose;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

/** Maps Mongoose readyState to the value exposed by the readiness endpoint. */
export function getDatabaseState(): "connected" | "disconnected" | "connecting" {
  switch (mongoose.connection.readyState) {
    case 1:
      return "connected";
    case 2:
      return "connecting";
    default:
      return "disconnected";
  }
}
