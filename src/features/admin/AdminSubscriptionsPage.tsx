import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { StatusBadge } from "@/components/StatusBadge";
import type { AdminSubscription } from "./types";

const TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  ACTIVE: "success",
  GRACE: "warning",
  TRIAL: "neutral",
  EXPIRED: "danger",
};

export function AdminSubscriptionsPage() {
  const subs = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: () => apiGet<AdminSubscription[]>("/admin/subscriptions"),
  });

  return (
    <>
      <PageHeader title="Subscriptions" subtitle="Paid subscriptions across all farms." />

      {subs.isLoading ? (
        <LoadingState label="Loading subscriptions…" />
      ) : subs.error ? (
        <Card>
          <ErrorState error={subs.error} onRetry={() => subs.refetch()} />
        </Card>
      ) : subs.data && subs.data.length > 0 ? (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {subs.data.map((s) => (
              <li key={s.farmId} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">{s.farm}</p>
                  <p className="truncate text-sm text-slate-500">{s.plan}</p>
                </div>
                <span className="hidden text-sm text-slate-500 sm:block">
                  {s.expiresAt ? `Expires ${formatDate(s.expiresAt)}` : "No expiry"}
                </span>
                <StatusBadge status={s.status} tone={TONE[s.status] ?? "neutral"} />
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No subscriptions yet"
            description="Farms appear here once they redeem an activation token."
          />
        </Card>
      )}
    </>
  );
}
