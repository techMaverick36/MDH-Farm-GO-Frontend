import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { CreatePlanModal } from "./CreatePlanModal";
import type { Plan } from "./types";

export function AdminPlansPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const plans = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => apiGet<Plan[]>("/admin/plans"),
  });

  const newButton = <Button onClick={() => setCreateOpen(true)}>+ Create plan</Button>;

  return (
    <>
      <PageHeader
        title="Plans"
        subtitle="Subscription plans farms can activate with a token."
        action={newButton}
      />

      {plans.isLoading ? (
        <LoadingState label="Loading plans…" />
      ) : plans.error ? (
        <Card>
          <ErrorState error={plans.error} onRetry={() => plans.refetch()} />
        </Card>
      ) : plans.data && plans.data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.data.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-800">{p.name}</h3>
                {!p.isActive && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    Inactive
                  </span>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-700">
                {p.priceMinor === 0 ? "Free" : formatMoney(p.priceMinor, p.currency)}
              </p>
              <p className="mt-1 text-sm text-slate-500">{p.durationDays} days</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No plans yet"
            description="Create your first plan so farms have something to activate."
            action={newButton}
          />
        </Card>
      )}

      <CreatePlanModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
