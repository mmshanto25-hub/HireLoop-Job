import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Input, Skeleton } from "@/components/ui";
import { authApi } from "@/features/auth/api";
import { ApiClientError } from "@/lib/api";

type State = "pending" | "done" | "failed" | "awaiting_token";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const tokenFromUrl = params.get("token") ?? "";
  const emailFromUrl = params.get("email") ?? "";

  const [state, setState] = useState<State>(
    tokenFromUrl ? "pending" : emailFromUrl ? "awaiting_token" : "failed",
  );
  const [manualToken, setManualToken] = useState("");
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const started = useRef(false);

  const performVerification = (tokenToVerify: string) => {
    setState("pending");
    setMessage("");
    authApi
      .verifyEmail(tokenToVerify)
      .then(() => setState("done"))
      .catch((err: unknown) => {
        setState("failed");
        setMessage(err instanceof ApiClientError ? err.message : "We could not verify this token.");
      });
  };

  useEffect(() => {
    if (!tokenFromUrl || started.current) return;
    started.current = true;
    performVerification(tokenFromUrl);
  }, [tokenFromUrl]);

  const handleResend = async () => {
    if (!emailFromUrl) return;
    setResendStatus("sending");
    try {
      await authApi.resendVerification(emailFromUrl);
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  };

  if (state === "pending") {
    return (
      <AuthLayout title="Verifying your email">
        <Skeleton className="h-6 w-2/3" />
      </AuthLayout>
    );
  }

  if (state === "done") {
    return (
      <AuthLayout title="Email verified" description="Your account is ready. You can sign in now.">
        <Link
          to="/login"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-brand-foreground shadow hover:bg-brand-hover"
        >
          Sign in
        </Link>
      </AuthLayout>
    );
  }

  if (state === "awaiting_token") {
    return (
      <AuthLayout
        title="Check your inbox"
        description={`We sent a verification link to ${emailFromUrl || "your email"}. Click the link in the message to activate your account.`}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-muted/50 p-4 text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or request a new verification link below.
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Paste token or code if received"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
            />
            <Button
              type="button"
              disabled={!manualToken.trim()}
              onClick={() => performVerification(manualToken.trim())}
            >
              Verify
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === "sending" || resendStatus === "sent"}
              className="text-xs font-semibold text-brand hover:underline disabled:opacity-50"
            >
              {resendStatus === "sent"
                ? "Verification email resent!"
                : resendStatus === "sending"
                  ? "Sending..."
                  : "Resend email"}
            </button>
            <Link to="/login" className="text-xs font-semibold text-muted-foreground hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verification failed"
      description={message || "This verification link is invalid or has expired."}
    >
      <div className="space-y-3">
        <Link
          to="/login"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground shadow hover:bg-brand-hover"
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
