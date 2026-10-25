import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Skeleton } from "@/components/ui";
import { authApi } from "@/features/auth/api";
import { ApiClientError } from "@/lib/api";

type State = "pending" | "done" | "failed";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>(token ? "pending" : "failed");
  const [message, setMessage] = useState("");
  // React StrictMode runs effects twice in development. A single-use token must be spent only once.
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setState("done"))
      .catch((err: unknown) => {
        setState("failed");
        setMessage(err instanceof ApiClientError ? err.message : "We could not verify this link.");
      });
  }, [token]);

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
          className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground"
        >
          Sign in
        </Link>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout
      title="Link not valid"
      description={message || "This link is invalid or has expired."}
    >
      <Link to="/login" className="text-sm font-semibold text-brand-text hover:underline">
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
