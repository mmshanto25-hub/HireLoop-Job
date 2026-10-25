import type { Env } from "../config/env.js";
import type { Logger } from "../utils/logger.js";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Anything that can deliver a message. Tests inject a capturing implementation. */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

/**
 * Sends through the Resend HTTP API. It uses fetch directly, so there is one
 * integration and no extra SDK. Failures are thrown so the caller can log them.
 */
export class ResendEmailSender implements EmailSender {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly logger: Logger,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      // Log only the status. The response body may echo recipient details.
      this.logger.error(
        { status: response.status, subject: message.subject },
        "Email provider rejected a message",
      );
      throw new Error(`Email provider responded with HTTP ${response.status}`);
    }
    this.logger.info({ subject: message.subject }, "Email accepted by provider");
  }
}

/**
 * Development-only sender. It prints messages to the terminal so you can click
 * the verification and reset links without an email provider. Creating it in
 * production is refused in config validation.
 */
export class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.log(`\n[DEV EMAIL] To: ${message.to}\nSubject: ${message.subject}\n${message.text}\n`);
  }
}

export function createEmailSender(
  env: Pick<Env, "EMAIL_PROVIDER" | "EMAIL_API_KEY" | "EMAIL_FROM">,
  logger: Logger,
): EmailSender {
  if (env.EMAIL_PROVIDER === "resend" && env.EMAIL_API_KEY) {
    return new ResendEmailSender(env.EMAIL_API_KEY, env.EMAIL_FROM, logger);
  }
  return new ConsoleEmailSender();
}

/**
 * Sends without throwing. Email is not part of the database transaction, so a
 * provider outage must not roll back a registration. The failure is logged and
 * the user can request another message.
 */
export async function sendEmailSafely(
  sender: EmailSender,
  message: EmailMessage,
  logger: Logger,
): Promise<void> {
  try {
    await sender.send(message);
  } catch (err) {
    logger.error(
      { err: err instanceof Error ? err.message : String(err), subject: message.subject },
      "Failed to send email",
    );
  }
}
