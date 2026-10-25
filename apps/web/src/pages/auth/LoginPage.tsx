import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@hireloop/shared";
import { toast } from "sonner";
import { AuthLayout, FormAlert } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button, FormField, Input } from "@/components/ui";
import { authApi, googleSignInUrl } from "@/features/auth/api";
import { useLogin } from "@/features/auth/hooks";
import { applyServerErrors, safeNext } from "@/features/auth/form-utils";
import { ApiClientError } from "@/lib/api";

const OAUTH_MESSAGES: Record<string, string> = {
  google_failed: "Google sign-in did not complete. Please try again.",
  google_state: "Your sign-in session expired. Start again.",
  google_unavailable: "Google sign-in is not available right now.",
  suspended: "This account has been suspended. Contact support for help.",
};

export function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const login = useLogin();
  const next = safeNext(params.get("next"));
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const oauthError = params.get("error");
  const [formError, setFormError] = useState<string | undefined>(
    oauthError ? (OAUTH_MESSAGES[oauthError] ?? "Sign-in failed. Please try again.") : undefined,
  );

  useEffect(() => {
    if (params.get("reset") === "1")
      toast.success("Password updated. Sign in with your new password.");
  }, [params]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);
    setUnverifiedEmail(null);
    try {
      await login.mutateAsync(values);
      navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(values.email);
        setFormError(err.message);
        return;
      }
      setFormError(applyServerErrors(err, setError));
    }
  });

  async function resend() {
    const email = unverifiedEmail ?? getValues("email");
    try {
      await authApi.resendVerification(email);
      toast.success("If your account needs verification, we sent a new link.");
    } catch {
      toast.error("Could not send the email. Try again shortly.");
    }
  }

  return (
    <AuthLayout
      title="Sign in to HireLoop"
      description="Welcome back. Enter your details to continue."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FormAlert message={formError} />
        {unverifiedEmail ? (
          <Button type="button" variant="outline" className="w-full" onClick={resend}>
            Resend verification email
          </Button>
        ) : null}

        <FormField label="Email" required error={errors.email?.message}>
          {(control) => (
            <Input {...control} {...register("email")} type="email" autoComplete="email" />
          )}
        </FormField>

        <FormField label="Password" required error={errors.password?.message}>
          {(control) => (
            <PasswordInput {...control} {...register("password")} autoComplete="current-password" />
          )}
        </FormField>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-brand-text hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-subtle-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <a
        href={googleSignInUrl({ role: "seeker", next })}
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-surface text-sm font-semibold text-foreground hover:bg-surface-muted"
      >
        Continue with Google
      </a>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to HireLoop?{" "}
        <Link
          to={`/signup?next=${encodeURIComponent(next)}`}
          className="font-semibold text-brand-text hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
