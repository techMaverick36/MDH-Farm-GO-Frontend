import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { redeemTokenSchema, type RedeemTokenInput } from "@mdh/shared";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { useToast } from "@/components/toast";
import { TextField } from "@/components/Field";
import { Button } from "@/components/Button";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { PAYMENT_INFO } from "@/lib/payment";

// Shown when a farm's trial (or paid plan) has lapsed. The manager pays the
// provider via mobile money out-of-band, then enters the activation code the
// admin issues for their farm. Staff without redeem permission see a hand-off.
export function ActivationPage() {
  const { farm, can, refresh, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const canRedeem = can("token.redeem");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RedeemTokenInput>({
    resolver: zodResolver(redeemTokenSchema),
    defaultValues: { code: "" },
  });

  const redeem = useMutation({
    mutationFn: (values: RedeemTokenInput) =>
      apiPost("/subscription/redeem", { code: values.code.trim().toUpperCase() }),
    onSuccess: async () => {
      toast.success("Your farm is active again. Welcome back!");
      await refresh();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        setError("code", { message: toMessage(err, "That code couldn't be redeemed.") });
      }
    },
  });

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <AuthLayout
      title="Your free trial has ended"
      subtitle={`Activate ${farm?.name ?? "your farm"} to keep recording milk, deliveries and payments.`}
      footer={
        <button onClick={handleLogout} className="text-slate-500 hover:text-slate-700 hover:underline">
          Sign out
        </button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-900 ring-1 ring-brand-100">
          <p className="font-semibold">How to activate</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>
              Pay <strong>{PAYMENT_INFO.amountLabel}</strong> to{" "}
              <strong>{PAYMENT_INFO.payTo}</strong> ({PAYMENT_INFO.method}).
            </li>
            <li>
              Send your payment reference and farm name to{" "}
              <strong>{PAYMENT_INFO.contact}</strong>.
            </li>
            <li>We'll send you an activation code, then enter it below.</li>
          </ol>
        </div>

        {canRedeem ? (
          <form
            onSubmit={handleSubmit((v) => redeem.mutateAsync(v).catch(() => undefined))}
            className="space-y-3"
            noValidate
          >
            <TextField
              label="Activation code"
              placeholder="e.g. 91FD0321D880"
              autoComplete="off"
              error={errors.code?.message}
              {...register("code")}
            />
            <Button type="submit" size="lg" block loading={isSubmitting || redeem.isPending}>
              Activate my farm
            </Button>
          </form>
        ) : (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Ask your farm manager to renew the subscription. Only they can enter the
            activation code.
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
