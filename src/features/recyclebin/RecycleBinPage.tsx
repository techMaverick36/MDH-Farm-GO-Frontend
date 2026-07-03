import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Permission } from "@mdh/shared";
import { apiGet, apiPost } from "@/lib/api";
import { toMessage } from "@/lib/formErrors";
import { cx } from "@/lib/cx";
import { formatLitres, formatMoney, formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";

type Row = Record<string, unknown> & { id: string };

interface EntityConfig {
  key: string;
  label: string;
  restorePerm: string;
  render: (row: Row, currency: string) => { title: ReactNode; sub: string };
}

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
const num = (v: unknown): number => (typeof v === "number" ? v : 0);

const ENTITIES: EntityConfig[] = [
  {
    key: "cow",
    label: "Cows",
    restorePerm: Permission.COW_RESTORE,
    render: (r) => ({
      title: str(r.name) ?? `Cow ${str(r.tag) ?? ""}`.trim(),
      sub: [str(r.breed), str(r.tag) ? `Tag ${str(r.tag)}` : null].filter(Boolean).join(" · ") || "Cow",
    }),
  },
  {
    key: "milk-collection",
    label: "Milk",
    restorePerm: Permission.MILK_RESTORE,
    render: (r) => ({
      title: formatLitres(num(r.quantityMl)),
      sub: [str(r.session) === "MORNING" ? "Morning" : "Evening", formatDate(str(r.collectedAt))]
        .filter(Boolean)
        .join(" · "),
    }),
  },
  {
    key: "customer",
    label: "Customers",
    restorePerm: Permission.CUSTOMER_RESTORE,
    render: (r) => ({
      title: str(r.name) ?? "Customer",
      sub: [str(r.phone), str(r.zone)].filter(Boolean).join(" · ") || "Customer",
    }),
  },
  {
    key: "delivery",
    label: "Deliveries",
    restorePerm: Permission.DELIVERY_RESTORE,
    render: (r) => ({
      title: `Delivery · ${formatDate(str(r.recordedAt))}`,
      sub: `${Array.isArray(r.lines) ? r.lines.length : 0} item(s)`,
    }),
  },
  {
    key: "invoice",
    label: "Invoices",
    restorePerm: Permission.INVOICE_RESTORE,
    render: (r, currency) => ({
      title: str(r.number) ?? "Invoice",
      sub: formatMoney(num(r.totalMinor), str(r.currency) ?? currency),
    }),
  },
  {
    key: "payment",
    label: "Payments",
    restorePerm: Permission.PAYMENT_RESTORE,
    render: (r, currency) => ({
      title: formatMoney(num(r.amountMinor), str(r.currency) ?? currency),
      sub: [str(r.method), formatDate(str(r.recordedAt))].filter(Boolean).join(" · "),
    }),
  },
];

export function RecycleBinPage() {
  const { can, currency } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [active, setActive] = useState(ENTITIES[0]!.key);

  const entity = ENTITIES.find((e) => e.key === active)!;

  const deleted = useQuery({
    queryKey: ["recycle-bin", active],
    queryFn: () => apiGet<Row[]>(`/recycle-bin?entity=${active}&limit=100`),
  });

  const restore = useMutation({
    mutationFn: ({ id }: { id: string }) => apiPost(`/recycle-bin/${active}/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recycle-bin", active] });
      // The restored row reappears in its own list.
      queryClient.invalidateQueries({ queryKey: [`${active}s`] });
      queryClient.invalidateQueries({ queryKey: ["cows"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["milk-collections"] });
      toast.success("Restored.");
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't restore this item.")),
  });

  return (
    <>
      <PageHeader title="Recycle bin" subtitle="Deleted items. Restore anything you still need." />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {ENTITIES.map((e) => (
          <button
            key={e.key}
            onClick={() => setActive(e.key)}
            className={cx(
              "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
              e.key === active
                ? "bg-brand-500 text-white"
                : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      {deleted.isLoading ? (
        <LoadingState label="Loading deleted items…" />
      ) : deleted.error ? (
        <Card>
          <ErrorState error={deleted.error} onRetry={() => deleted.refetch()} />
        </Card>
      ) : deleted.data && deleted.data.length > 0 ? (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {deleted.data.map((row) => {
              const { title, sub } = entity.render(row, currency);
              return (
                <li key={row.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-700">{title}</p>
                    <p className="truncate text-sm text-slate-400">{sub}</p>
                  </div>
                  {can(entity.restorePerm) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={restore.isPending && restore.variables?.id === row.id}
                      onClick={() => restore.mutate({ id: row.id })}
                    >
                      Restore
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title={`No deleted ${entity.label.toLowerCase()}`}
            description="Items you delete show up here so you can bring them back."
          />
        </Card>
      )}
    </>
  );
}
