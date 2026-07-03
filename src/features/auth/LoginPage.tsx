import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginSchema, type LoginInput } from "@mdh/shared";
import { useAuth } from "@/lib/auth";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { TextField } from "@/components/Field";
import { Button } from "@/components/Button";
import { AuthLayout } from "./AuthLayout";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      if (!applyApiFieldErrors(err, setError)) {
        setError("root", { message: toMessage(err, "Couldn't sign you in.") });
      }
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your farm."
      footer={
        <span className="text-slate-600">
          New to MDH Farm GO?{" "}
          <Link to="/signup" className="font-semibold text-brand-700 hover:underline">
            Create your farm
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          label="Email or phone"
          autoComplete="username"
          inputMode="email"
          placeholder="you@farm.com"
          error={errors.identifier?.message}
          {...register("identifier")}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        {errors.root && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" size="lg" block loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
