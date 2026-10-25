import { z } from "zod";

/**
 * Environment validation. Runs once at startup. If anything required is
 * missing or malformed, the process exits with a readable list of problems
 * instead of failing later in a confusing way.
 */

const requiredString = (name: string) => z.string({ error: `${name} is required` });

const secretSchema = (name: string) =>
  requiredString(name).min(32, `${name} must be at least 32 characters`);

const urlSchema = (name: string) =>
  requiredString(name)
    .url(`${name} must be a valid URL`)
    .transform((value) => value.replace(/\/+$/, ""));

/** Empty strings from a copied .env.example mean "not set", so the default applies. */
const blankAsUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_URL: urlSchema("WEB_URL"),
  API_URL: urlSchema("API_URL"),
  MONGODB_URI: requiredString("MONGODB_URI").regex(
    /^mongodb(\+srv)?:\/\//,
    "MONGODB_URI must start with mongodb:// or mongodb+srv://",
  ),
  /** Number of reverse-proxy hops in front of the API. Keep 0 for local development. */
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
  /** Signs the Google OAuth state cookie. */
  SESSION_SECRET: secretSchema("SESSION_SECRET"),
  ACCESS_TOKEN_SECRET: secretSchema("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: secretSchema("REFRESH_TOKEN_SECRET"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  // Email. "console" prints messages to the terminal and is only allowed outside production.
  EMAIL_PROVIDER: blankAsUndefined(z.enum(["console", "resend"]).default("console")),
  EMAIL_API_KEY: optionalString,
  EMAIL_FROM: blankAsUndefined(z.string().trim().default("HireLoop <no-reply@localhost>")),

  // Google sign-in. All three are required together; see the refinement below.
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  GOOGLE_CALLBACK_URL: optionalString,
});

export const envSchema = baseSchema.superRefine((env, ctx) => {
  if (env.NODE_ENV === "production") {
    if (!env.WEB_URL.startsWith("https://")) {
      ctx.addIssue({
        code: "custom",
        path: ["WEB_URL"],
        message: "WEB_URL must use https in production",
        input: env.WEB_URL,
      });
    }
    if (!env.API_URL.startsWith("https://")) {
      ctx.addIssue({
        code: "custom",
        path: ["API_URL"],
        message: "API_URL must use https in production",
        input: env.API_URL,
      });
    }
    if (env.EMAIL_PROVIDER !== "resend") {
      ctx.addIssue({
        code: "custom",
        path: ["EMAIL_PROVIDER"],
        message: "EMAIL_PROVIDER must be resend in production",
        input: env.EMAIL_PROVIDER,
      });
    }
  }

  if (env.EMAIL_PROVIDER === "resend" && !env.EMAIL_API_KEY) {
    ctx.addIssue({
      code: "custom",
      path: ["EMAIL_API_KEY"],
      message: "EMAIL_API_KEY is required when EMAIL_PROVIDER is resend",
      input: undefined,
    });
  }

  const googleValues = [env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_CALLBACK_URL];
  const googleSet = googleValues.filter(Boolean).length;
  if (googleSet > 0 && googleSet < 3) {
    ctx.addIssue({
      code: "custom",
      path: ["GOOGLE_CLIENT_ID"],
      message:
        "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_CALLBACK_URL must be set together (or all left empty)",
      input: undefined,
    });
  }

  const secrets = [env.ACCESS_TOKEN_SECRET, env.REFRESH_TOKEN_SECRET, env.SESSION_SECRET];
  if (new Set(secrets).size !== secrets.length) {
    ctx.addIssue({
      code: "custom",
      path: ["ACCESS_TOKEN_SECRET"],
      message: "SESSION_SECRET, ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must all be different",
      input: undefined,
    });
  }
});

export type Env = z.infer<typeof envSchema>;

/** True when Google sign-in has been configured. */
export function isGoogleConfigured(env: Pick<Env, "GOOGLE_CLIENT_ID">): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID);
}

export class EnvValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid environment configuration:\n  - ${issues.join("\n  - ")}`);
    this.name = "EnvValidationError";
  }
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => {
      const field = issue.path.join(".") || "(root)";
      return `${field}: ${issue.message}`;
    });
    throw new EnvValidationError(issues);
  }
  return result.data;
}
