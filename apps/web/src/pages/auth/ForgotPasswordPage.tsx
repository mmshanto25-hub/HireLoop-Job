import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@hireloop/shared";
import { AuthLayout, FormAlert } from "@/components/auth/AuthLayout";
import { Button, FormField, Input } from "@/components/ui";
import { authApi } from "@/features/auth/api";
import { applyServerErrors } from "@/features/auth/form-utils";

export function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(undefined);
    try {
      await authApi.forgotPassword(email);
      setDone(true);
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  if (done) {
    return (
      <AuthLayout
        title="Check your email"
        description="If an account exists for that address, a reset link is on its way. The link expires in 30 minutes."
      >
        <Link to="/login" className="text-sm font-semibold text-brand-text hover:underline">
          Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we will send you a link to choose a new password."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FormAlert message={formError} />
        <FormField label="Email" required error={errors.email?.message}>
          {(c) => <Input {...c} {...register("email")} type="email" autoComplete="email" />}
        </FormField>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
