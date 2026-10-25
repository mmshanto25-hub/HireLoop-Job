import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema } from "@hireloop/shared";
import { z } from "zod";
import { AuthLayout, FormAlert } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button, FormField } from "@/components/ui";
import { authApi } from "@/features/auth/api";
import { applyServerErrors } from "@/features/auth/form-utils";

/** Confirmation is checked only in the browser. The API receives just the new password. */
const resetFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type ResetForm = z.infer<typeof resetFormSchema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [formError, setFormError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <AuthLayout
        title="Link not valid"
        description="This reset link is incomplete. Request a new one."
      >
        <Link
          to="/forgot-password"
          className="text-sm font-semibold text-brand-text hover:underline"
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  const onSubmit = handleSubmit(async ({ password }) => {
    setFormError(undefined);
    try {
      await authApi.resetPassword({ token, password });
      navigate("/login?reset=1", { replace: true });
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <AuthLayout
      title="Choose a new password"
      description="Resetting your password signs you out on every device."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FormAlert message={formError} />
        <FormField
          label="New password"
          required
          hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message}
        >
          {(c) => <PasswordInput {...c} {...register("password")} autoComplete="new-password" />}
        </FormField>
        <FormField label="Confirm new password" required error={errors.confirmPassword?.message}>
          {(c) => (
            <PasswordInput {...c} {...register("confirmPassword")} autoComplete="new-password" />
          )}
        </FormField>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
