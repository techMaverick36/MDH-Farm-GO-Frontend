import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMoney, formatLitres, formatQuantity } from "@/lib/format";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import type {
  ProductionReport,
  SalesReport,
  OutstandingPaymentsReport,
  InventorySnapshot,
} from "./types";

const RAW_MILK_CATEGORY = "milk";

function StatCard({
  label,
  value,
  sub,
  tone = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "brand" | "sky" | "amber" | "slate";
}) {
  const toneClass = {
    brand: "text-brand-700",
    sky: "text-sky-700",
    amber: "text-amber-700",
    slate: "text-slate-800",
  }[tone];
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${toneClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </Card>
  );
}

export function HomePage() {
  const { user, farm, currency, can, hasModule } = useAuth();
  const canReport = can("report.view");

  const production = useQuery({
    queryKey: ["report", "production"],
    queryFn: () => apiGet<ProductionReport>("/reports/production?granularity=daily"),
    enabled: canReport && hasModule("dairy"),
  });
  const sales = useQuery({
    queryKey: ["report", "sales"],
    queryFn: () => apiGet<SalesReport>("/reports/sales"),
    enabled: canReport,
  });
  const outstanding = useQuery({
    queryKey: ["report", "outstanding"],
    queryFn: () => apiGet<OutstandingPaymentsReport>("/reports/outstanding-payments"),
    enabled: canReport,
  });
  const inventory = useQuery({
    queryKey: ["report", "inventory"],
    queryFn: () => apiGet<InventorySnapshot>("/reports/inventory"),
    enabled: canReport,
  });

  if (!canReport) {
    return (
      <>
        <PageHeader title={`Hello, ${user?.name?.split(" ")[0] ?? "there"}`} />
        <Card>
          <EmptyState
            title="No dashboard reports"
            description="Your account doesn't have access to farm reports."
          />
        </Card>
      </>
    );
  }

  const loading =
    production.isLoading || sales.isLoading || outstanding.isLoading || inventory.isLoading;
  const error =
    production.error || sales.error || outstanding.error || inventory.error;

  const milkMl = production.data?.series.reduce((s, r) => s + r.quantity, 0) ?? 0;
  const collections = production.data?.series.reduce((s, r) => s + r.entries, 0) ?? 0;
  const salesMinor = sales.data?.series.reduce((s, r) => s + r.totalMinor, 0) ?? 0;
  const deliveries = sales.data?.series.reduce((s, r) => s + r.deliveries, 0) ?? 0;
  const rawMilk = inventory.data?.items.find((i) => i.category === RAW_MILK_CATEGORY);

  function retryAll() {
    production.refetch();
    sales.refetch();
    outstanding.refetch();
    inventory.refetch();
  }

  return (
    <>
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] ?? "there"}`}
        subtitle={`Here's how ${farm?.name ?? "your farm"} is doing over the last 30 days.`}
      />

      {loading ? (
        <LoadingState label="Loading your farm summary…" />
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={retryAll} />
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {hasModule("dairy") && (
              <StatCard
                label="Milk collected"
                value={formatLitres(milkMl)}
                sub={`${collections} collection${collections === 1 ? "" : "s"}`}
                tone="brand"
              />
            )}
            <StatCard
              label="Sales (delivered)"
              value={formatMoney(salesMinor, sales.data?.currency ?? currency)}
              sub={`${deliveries} confirmed deliver${deliveries === 1 ? "y" : "ies"}`}
              tone="sky"
            />
            <StatCard
              label="Money owed to you"
              value={formatMoney(
                outstanding.data?.totalOutstandingMinor ?? 0,
                outstanding.data?.currency ?? currency,
              )}
              sub={`${outstanding.data?.customers.length ?? 0} customer${
                (outstanding.data?.customers.length ?? 0) === 1 ? "" : "s"
              } with a balance`}
              tone="amber"
            />
            {hasModule("dairy") && (
              <StatCard
                label="Milk in store"
                value={rawMilk ? formatLitres(rawMilk.quantity) : "-"}
                sub={`${inventory.data?.items.length ?? 0} stock item${
                  (inventory.data?.items.length ?? 0) === 1 ? "" : "s"
                }`}
                tone="slate"
              />
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <OwedCard report={outstanding.data} />
            <InventoryCard report={inventory.data} />
          </div>
        </div>
      )}
    </>
  );
}

function OwedCard({ report }: { report?: OutstandingPaymentsReport }) {
  const top = report?.customers.slice(0, 5) ?? [];
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-800">Who owes you the most</h2>
        <Link to="/invoices" className="text-sm font-medium text-brand-700 hover:underline">
          Invoices
        </Link>
      </div>
      {top.length === 0 ? (
        <EmptyState title="All settled up" description="No customer has an outstanding balance." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {top.map((c) => (
            <li key={c.customerId} className="flex items-center justify-between px-5 py-3">
              <span className="truncate text-sm font-medium text-slate-700">{c.name}</span>
              <span className="text-sm font-semibold text-amber-700">
                {formatMoney(c.balanceMinor, report?.currency ?? "UGX")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function InventoryCard({ report }: { report?: InventorySnapshot }) {
  const items = report?.items ?? [];
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-800">What's in store</h2>
      </div>
      {items.length === 0 ? (
        <EmptyState
          title="Nothing in store yet"
          description="Stock appears here as you record milk and other goods."
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.slice(0, 6).map((i) => (
            <li key={i.id} className="flex items-center justify-between px-5 py-3">
              <span className="truncate text-sm font-medium text-slate-700">{i.name}</span>
              <span className="text-sm text-slate-500">
                {i.category === RAW_MILK_CATEGORY
                  ? formatLitres(i.quantity)
                  : formatQuantity(i.quantity, i.unit)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
