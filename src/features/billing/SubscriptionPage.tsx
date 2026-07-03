import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { redeemTokenSchema, type RedeemTokenInput } from "@mdh/shared";
import { apiGet, apiPost } from "@/lib/api";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/toast";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Field";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";

interface Subscription {
  status: "TRIAL" | "ACTIVE" | "GRACE" | "EXPIRED";
  plan: { id: string; name: string } | null;
  startsAt: string | null;
  expiresAt: string | null;
}
interface Referral {
  referralCode: string;
  referredCount: number;
  creditedCount: number;
  totalRewardDays: number;
}

const STATUS_TONE = {
  TRIAL: "info",
  ACTIVE: "success",
  GRACE: "warning",
  EXPIRED: "danger",
} as const;

const STATUS_BLURB: Record<string, string> = {
  TRIAL: "You're on a free trial. Activate a plan with a code from your provider.",
  ACTIVE: "Your subscription is active. Thank you!",
  GRACE: "Your plan has lapsed. You're in a short grace period. Renew with a code to avoid losing access.",
  EXPIRED: "Your subscription has expired. Enter an activation code to restore full access.",
};

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export function SubscriptionPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { refresh, access } = useAuth();
  const trialDaysLeft = access.status === "TRIAL" ? daysUntil(access.trialEndsAt) : null;

  const sub = useQuery({
    queryKey: ["subscription"],
    queryFn: () => apiGet<Subscription>("/subscription"),
  });
  const referral = useQuery({
    queryKey: ["referral"],
    queryFn: () => apiGet<Referral>("/referral"),
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RedeemTokenInput>({
    resolver: zodResolver(redeemTokenSchema),
    defaultValues: { code: "" },
  });

  const redeem = useMutation({
    mutationFn: (values: RedeemTokenInput) =>
      apiPost<{ status: string; expiresAt: string }>("/subscription/redeem", {
        code: values.code.trim().toUpperCase(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });
      await queryClient.invalidateQueries({ queryKey: ["referral"] });
      // Farm status may have flipped TRIAL -> ACTIVE; refresh the profile.
      await refresh();
      toast.success("Your subscription is now active!");
      reset();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        setError("code", { message: toMessage(err, "That code couldn't be redeemed.") });
      }
    },
  });

  return (
    <>
      <PageHeader title="Subscription" subtitle="Your plan and how to keep your farm active." />

      {sub.isLoading ? (
        <LoadingState label="Loading your plan…" />
      ) : sub.error ? (
        <Card>
          <ErrorState error={sub.error} onRetry={() => sub.refetch()} />
        </Card>
      ) : sub.data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Current plan</h2>
              <StatusBadge status={sub.data.status} tone={STATUS_TONE[sub.data.status]} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {sub.data.plan?.name ?? "Free trial"}
            </p>
            {trialDaysLeft !== null ? (
              <p className="mt-1 text-sm text-slate-500">
                {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left
                {access.trialEndsAt ? ` · ends ${formatDate(access.trialEndsAt)}` : ""}
              </p>
            ) : (
              sub.data.expiresAt && (
                <p className="mt-1 text-sm text-slate-500">
                  {sub.data.status === "EXPIRED" ? "Expired" : "Renews / expires"} on{" "}
                  {formatDate(sub.data.expiresAt)}
                </p>
              )
            )}
            <p className="mt-4 text-sm text-slate-600">{STATUS_BLURB[sub.data.status]}</p>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-800">Activate with a code</h2>
            <p className="mt-1 text-sm text-slate-500">
              Paid for a plan? Enter the activation code your provider gave you.
            </p>
            <form
              onSubmit={handleSubmit((v) => redeem.mutateAsync(v).catch(() => undefined))}
              className="mt-4 space-y-3"
              noValidate
            >
              <TextField
                label="Activation code"
                placeholder="e.g. F60D9A8655F4"
                autoComplete="off"
                error={errors.code?.message}
                {...register("code")}
              />
              <Button type="submit" block loading={isSubmitting || redeem.isPending}>
                Activate
              </Button>
            </form>
          </Card>

          <Card className="p-5 lg:col-span-2">
            <h2 className="font-semibold text-slate-800">Refer another farm</h2>
            <p className="mt-1 text-sm text-slate-500">
              Share your code. When a farm you referred activates a plan, you earn bonus days.
            </p>
            {referral.data ? (
              <div className="mt-4 flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Your code</p>
                  <p className="font-mono text-lg font-bold tracking-widest text-brand-700">
                    {referral.data.referralCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Farms referred</p>
                  <p className="text-lg font-semibold text-slate-800">{referral.data.referredCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Bonus days earned</p>
                  <p className="text-lg font-semibold text-slate-800">{referral.data.totalRewardDays}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Referral details unavailable.</p>
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
