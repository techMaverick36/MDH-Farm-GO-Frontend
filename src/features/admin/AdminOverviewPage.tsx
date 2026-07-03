import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import type { Analytics } from "./types";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
    </Card>
  );
}

export function AdminOverviewPage() {
  const analytics = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => apiGet<Analytics>("/admin/analytics"),
  });

  return (
    <>
      <PageHeader title="Overview" subtitle="Platform health at a glance." />
      {analytics.isLoading ? (
        <LoadingState label="Loading analytics…" />
      ) : analytics.error ? (
        <Card>
          <ErrorState error={analytics.error} onRetry={() => analytics.refetch()} />
        </Card>
      ) : analytics.data ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Total farms" value={analytics.data.farmCount} />
            {analytics.data.farmsByStatus.map((s) => (
              <Stat key={s.status} label={`Farms · ${s.status.toLowerCase()}`} value={s.count} />
            ))}
          </div>
          <Card className="p-5">
            <p className="mb-3 text-sm font-medium text-slate-700">Subscriptions by status</p>
            {analytics.data.subscriptionsByStatus.length === 0 ? (
              <p className="text-sm text-slate-500">No subscriptions yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {analytics.data.subscriptionsByStatus.map((s) => (
                  <li key={s.status} className="flex justify-between text-sm">
                    <span className="text-slate-600">{s.status.toLowerCase()}</span>
                    <span className="font-medium text-slate-900">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
