import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@mdh/shared";
import { useAuth } from "@/lib/auth";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { TextField } from "@/components/Field";
import { Button } from "@/components/Button";
import { AuthLayout } from "./AuthLayout";

// Shown on first login (mustResetPassword): the manager/staff/customer replaces
// the temporary password they were given with one of their own.
export function SetPasswordPage() {
  const { changePassword } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordInput) {
    try {
      await changePassword(values);
    } catch (err) {
      if (!applyApiFieldErrors(err, setError)) {
        setError("root", { message: toMessage(err, "Couldn't update your password.") });
      }
    }
  }

  return (
    <AuthLayout
      title="Set your password"
      subtitle="For your security, please choose a new password to replace the temporary one."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          label="Temporary password"
          type="password"
          autoComplete="current-password"
          placeholder="The password you were given"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        {errors.root && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" size="lg" block loading={isSubmitting}>
          Save password
        </Button>
      </form>
    </AuthLayout>
  );
}
