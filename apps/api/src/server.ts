import { createApp } from "./app.js";
import { EnvValidationError, loadEnv } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { createLogger } from "./utils/logger.js";

/**
 * Process entry point. Validates configuration, connects to MongoDB, starts
 * HTTP, and shuts down cleanly on SIGINT/SIGTERM.
 */
async function main(): Promise<void> {
  let env;
  try {
    env = loadEnv();
  } catch (err) {
    if (err instanceof EnvValidationError) {
      // Logger is not created yet, so plain stderr is the right channel here.
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  }

  const logger = createLogger(env.LOG_LEVEL);

  try {
    await connectDatabase({ uri: env.MONGODB_URI, logger });
  } catch (err) {
    logger.fatal({ err: err instanceof Error ? err.message : err }, "Could not connect to MongoDB");
    process.exit(1);
  }

  const app = createApp({ env, logger });
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "HireLoop API listening");
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, "Shutting down");
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Force exit if connections do not drain in time.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

void main();
