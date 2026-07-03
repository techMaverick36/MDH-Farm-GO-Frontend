import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { toMessage } from "@/lib/formErrors";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SelectField, TextField } from "@/components/Field";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import type { Plan } from "./types";

// Generate BEARER activation codes: any farm can redeem them. To grant a code to
// one specific farm, use Farms and "Issue activation code" instead.
export function AdminTokensPage() {
  const toast = useToast();
  const [planId, setPlanId] = useState("");
  const [count, setCount] = useState("1");
  const [codes, setCodes] = useState<string[]>([]);

  const plans = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => apiGet<Plan[]>("/admin/plans"),
  });

  const effectivePlanId = planId || plans.data?.[0]?.id || "";

  const generate = useMutation({
    mutationFn: () =>
      apiPost<{ codes: string[] }>("/admin/tokens", {
        planId: effectivePlanId,
        count: Math.min(Math.max(Number(count) || 1, 1), 500),
      }),
    onSuccess: (data) => setCodes(data.codes),
    onError: (err) => toast.error(toMessage(err, "Couldn't generate codes.")),
  });

  async function copyAll() {
    await navigator.clipboard.writeText(codes.join("\n")).catch(() => undefined);
    toast.success("Codes copied.");
  }

  return (
    <>
      <PageHeader
        title="Activation codes"
        subtitle="Generate bearer codes any farm can redeem. For one specific farm, use Farms."
      />

      {plans.isLoading ? (
        <LoadingState label="Loading plans…" />
      ) : plans.error ? (
        <Card>
          <ErrorState error={plans.error} onRetry={() => plans.refetch()} />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-800">Generate codes</h2>
            <div className="mt-4 space-y-3">
              <SelectField
                label="Plan"
                value={effectivePlanId}
                onChange={(e) => setPlanId(e.target.value)}
              >
                {(plans.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.durationDays} days ·{" "}
                    {p.priceMinor === 0 ? "Free" : formatMoney(p.priceMinor, p.currency)}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="How many"
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
              <Button
                block
                onClick={() => generate.mutate()}
                loading={generate.isPending}
                disabled={!effectivePlanId}
              >
                Generate
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Generated codes</h2>
              {codes.length > 0 && (
                <Button size="sm" variant="secondary" onClick={copyAll}>
                  Copy all
                </Button>
              )}
            </div>
            {codes.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                Codes you generate will appear here to copy and share.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {codes.map((c) => (
                  <li
                    key={c}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-center font-mono text-sm font-semibold tracking-widest text-slate-700 ring-1 ring-slate-100"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
