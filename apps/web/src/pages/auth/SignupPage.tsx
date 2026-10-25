import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@hireloop/shared";
import { AuthLayout, FormAlert } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button, FormField, Input, RadioGroup, ValidationMessage } from "@/components/ui";
import { authApi, googleSignInUrl } from "@/features/auth/api";
import { applyServerErrors, safeNext } from "@/features/auth/form-utils";

const ROLE_OPTIONS = [
  {
    value: "seeker",
    label: "I'm looking for a job",
    description: "Build a profile and apply to roles.",
  },
  { value: "recruiter", label: "I'm hiring", description: "Post jobs and review applicants." },
] as const;

export function SignupPage() {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const initialRole = params.get("role") === "recruiter" ? "recruiter" : "seeker";
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", role: initialRole },
  });
  const [formError, setFormError] = useState<string | undefined>();

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);
    try {
      await authApi.register(values);
      // The response is the same whether or not the email exists, so the screen does not reveal it.
      setSentTo(values.email);
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your inbox"
        description={`If ${sentTo} can be used for a new account, we sent a verification link. It expires in 24 hours.`}
      >
        <p className="text-sm text-muted-foreground">
          Didn't get it? Check your spam folder, or{" "}
          <Link to="/login" className="font-semibold text-brand-text hover:underline">
            go to sign in
          </Link>{" "}
          once you have verified.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Free to start. Verify your email to sign in."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FormAlert message={formError} />

        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <RadioGroup
                label="I want to"
                name="role"
                value={field.value}
                onValueChange={field.onChange}
                options={ROLE_OPTIONS.map((o) => ({ ...o }))}
              />
              <ValidationMessage message={errors.role?.message} />
            </div>
          )}
        />

        <FormField label="Full name" required error={errors.fullName?.message}>
          {(c) => <Input {...c} {...register("fullName")} autoComplete="name" />}
        </FormField>

        <FormField label="Email" required error={errors.email?.message}>
          {(c) => <Input {...c} {...register("email")} type="email" autoComplete="email" />}
        </FormField>

        <FormField
          label="Password"
          required
          hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message}
        >
          {(c) => <PasswordInput {...c} {...register("password")} autoComplete="new-password" />}
        </FormField>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-subtle-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <a
        href={googleSignInUrl({ role: initialRole, next })}
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-surface text-sm font-semibold text-foreground hover:bg-surface-muted"
      >
        Sign up with Google
      </a>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-brand-text hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
