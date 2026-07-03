import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { StatusBadge } from "@/components/StatusBadge";
import type { Referral, AdminFarm } from "./types";

const TONE: Record<string, "success" | "warning" | "neutral"> = {
  CREDITED: "success",
  QUALIFIED: "warning",
  PENDING: "neutral",
};

export function AdminReferralsPage() {
  const referrals = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: () => apiGet<Referral[]>("/admin/referrals"),
  });
  const farms = useQuery({
    queryKey: ["admin-farms"],
    queryFn: () => apiGet<AdminFarm[]>("/admin/farms"),
  });

  const farmName = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of farms.data ?? []) map.set(f.id, f.name);
    return (id: string) => map.get(id) ?? "Unknown farm";
  }, [farms.data]);

  return (
    <>
      <PageHeader
        title="Referrals"
        subtitle="Farms that invited others, and the bonus days they earned."
      />

      {referrals.isLoading ? (
        <LoadingState label="Loading referrals…" />
      ) : referrals.error ? (
        <Card>
          <ErrorState error={referrals.error} onRetry={() => referrals.refetch()} />
        </Card>
      ) : referrals.data && referrals.data.length > 0 ? (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {referrals.data.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-800">
                    <span className="font-medium">{farmName(r.referringFarmId)}</span>
                    <span className="text-slate-400"> invited </span>
                    <span className="font-medium">{farmName(r.referredFarmId)}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.rewardDays > 0 ? `${r.rewardDays} bonus days` : "No bonus yet"}
                    {r.creditedAt ? ` · credited ${formatDate(r.creditedAt)}` : ""}
                  </p>
                </div>
                <StatusBadge status={r.status} tone={TONE[r.status] ?? "neutral"} />
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No referrals yet"
            description="When a farm signs up with another farm's code, it shows here."
          />
        </Card>
      )}
    </>
  );
}
