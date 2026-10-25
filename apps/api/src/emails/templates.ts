/**
 * Transactional email templates. Each returns an HTML version and a plain-text
 * alternative. All user-supplied text is escaped before it reaches the HTML.
 */

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(title)}</title></head>
  <body style="margin:0;padding:24px;background:#f5f7f8;font-family:Manrope,Arial,sans-serif;color:#0f1c24;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8ec;border-radius:12px;padding:28px;">
      <p style="margin:0 0 16px;font-family:Sora,Arial,sans-serif;font-size:18px;font-weight:600;color:#0f766e;">HireLoop</p>
      ${bodyHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#6b7c87;">If you did not expect this email, you can ignore it.</p>
    </div>
  </body>
</html>`;
}

function button(url: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(url)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px;">${escapeHtml(label)}</a></p>
      <p style="font-size:12px;color:#6b7c87;word-break:break-all;">Or paste this link into your browser:<br />${escapeHtml(url)}</p>`;
}

export function verificationEmail(input: { fullName: string; url: string }): RenderedEmail {
  const name = escapeHtml(input.fullName);
  return {
    subject: "Verify your HireLoop email address",
    html: layout(
      "Verify your email",
      `<p>Hi ${name},</p><p>Confirm your email address to finish setting up your HireLoop account.</p>${button(input.url, "Verify email")}<p style="font-size:13px;">This link expires in 24 hours.</p>`,
    ),
    text: `Hi ${input.fullName},\n\nConfirm your email address to finish setting up your HireLoop account:\n${input.url}\n\nThis link expires in 24 hours.\nIf you did not expect this email, you can ignore it.`,
  };
}

export function passwordResetEmail(input: { fullName: string; url: string }): RenderedEmail {
  const name = escapeHtml(input.fullName);
  return {
    subject: "Reset your HireLoop password",
    html: layout(
      "Reset your password",
      `<p>Hi ${name},</p><p>We received a request to reset your password. Choose a new one using the button below.</p>${button(input.url, "Reset password")}<p style="font-size:13px;">This link expires in 30 minutes. If you did not request a reset, no action is needed and your password stays the same.</p>`,
    ),
    text: `Hi ${input.fullName},\n\nWe received a request to reset your HireLoop password:\n${input.url}\n\nThis link expires in 30 minutes.\nIf you did not request a reset, no action is needed and your password stays the same.`,
  };
}

export function accountExistsEmail(input: { fullName: string; loginUrl: string }): RenderedEmail {
  const name = escapeHtml(input.fullName);
  return {
    subject: "Someone tried to create a HireLoop account with your email",
    html: layout(
      "Account already exists",
      `<p>Hi ${name},</p><p>Someone tried to create a HireLoop account using this email address, but an account already exists.</p>${button(input.loginUrl, "Sign in")}<p style="font-size:13px;">If you forgot your password, use "Forgot password" on the sign-in page.</p>`,
    ),
    text: `Hi ${input.fullName},\n\nSomeone tried to create a HireLoop account using this email address, but an account already exists.\nSign in here: ${input.loginUrl}\n\nIf you forgot your password, use "Forgot password" on the sign-in page.`,
  };
}
