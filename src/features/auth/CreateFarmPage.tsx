import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema, type RegisterInput } from "@mdh/shared";
import { useAuth } from "@/lib/auth";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { TextField } from "@/components/Field";
import { Button } from "@/components/Button";
import { AuthLayout } from "./AuthLayout";

// Public self-signup. Phone-first (mobile-money + SMS reality); email optional.
// On success the farmer is signed straight into a 14-day free trial.
export function CreateFarmPage() {
  const { register: registerFarm } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { currency: "UGX", country: "" },
  });

  // Empty optional fields must validate as absent, not "" (which fails .email()
  // / .min()). Coerce blank inputs to undefined before zod runs.
  const optional = { setValueAs: (v: string) => (v?.trim() ? v.trim() : undefined) };

  async function onSubmit(values: RegisterInput) {
    try {
      await registerFarm(values);
      navigate("/", { replace: true });
    } catch (err) {
      if (!applyApiFieldErrors(err, setError)) {
        setError("root", { message: toMessage(err, "Couldn't create your farm.") });
      }
    }
  }

  return (
    <AuthLayout
      title="Create your farm"
      subtitle="Set up your farm in a minute and start your free 14-day trial. No payment needed yet."
      footer={
        <span className="text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          label="Farm name"
          placeholder="Sunrise Dairy"
          error={errors.farmName?.message}
          {...register("farmName")}
        />
        <TextField
          label="Your name"
          placeholder="Peter Mwangi"
          autoComplete="name"
          error={errors.managerName?.message}
          {...register("managerName")}
        />
        <TextField
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+256 7XX XXX XXX"
          hint="We'll use this to sign you in and reach you."
          error={errors.phone?.message}
          {...register("phone", optional)}
        />
        <TextField
          label="Email (optional)"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@farm.com"
          error={errors.email?.message}
          {...register("email", optional)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Country"
            placeholder="Uganda"
            error={errors.country?.message}
            {...register("country")}
          />
          <TextField
            label="Currency"
            placeholder="UGX"
            maxLength={3}
            hint="3-letter code"
            error={errors.currency?.message}
            {...register("currency")}
          />
        </div>
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <TextField
          label="Referral code (optional)"
          placeholder="From a farm that invited you"
          error={errors.referralCode?.message}
          {...register("referralCode", optional)}
        />
        {errors.root && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" size="lg" block loading={isSubmitting}>
          Start free trial
        </Button>
      </form>
    </AuthLayout>
  );
}
