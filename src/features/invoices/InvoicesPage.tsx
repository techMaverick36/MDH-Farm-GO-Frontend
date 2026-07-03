import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Permission } from "@mdh/shared";
import { apiGet } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { GenerateInvoiceModal } from "./GenerateInvoiceModal";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import type { Invoice } from "./types";
import type { Customer } from "@/features/customers/types";

export function InvoicesPage() {
  const { can } = useAuth();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const invoices = useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiGet<Invoice[]>("/invoices?limit=100"),
  });
  const customers = useQuery({
    queryKey: ["customers"],
    queryFn: () => apiGet<Customer[]>("/customers"),
    enabled: can(Permission.CUSTOMER_VIEW),
  });

  const customerName = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of customers.data ?? []) map.set(c.id, c.name);
    return map;
  }, [customers.data]);

  const nameFor = (id: string) => customerName.get(id) ?? "Customer";

  const generateButton = can(Permission.INVOICE_GENERATE) ? (
    <Button onClick={() => setGenerateOpen(true)}>+ Generate invoice</Button>
  ) : undefined;

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Bills built from confirmed deliveries, and the money owed."
        action={generateButton}
      />

      {invoices.isLoading ? (
        <LoadingState label="Loading invoices…" />
      ) : invoices.error ? (
        <Card>
          <ErrorState error={invoices.error} onRetry={() => invoices.refetch()} />
        </Card>
      ) : invoices.data && invoices.data.length > 0 ? (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {invoices.data.map((inv) => (
              <li key={inv.id}>
                <button
                  onClick={() => setOpenId(inv.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate font-medium text-slate-800">
                      {nameFor(inv.customerId)}
                      <span className="text-xs font-normal text-slate-400">{inv.number}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {inv.balanceMinor > 0
                        ? `${formatMoney(inv.balanceMinor, inv.currency)} owed`
                        : "Settled"}
                      {inv.dueAt ? ` · due ${formatDate(inv.dueAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-slate-800">
                      {formatMoney(inv.totalMinor, inv.currency)}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No invoices yet"
            description="Generate an invoice from a customer's confirmed deliveries to bill them."
            action={generateButton}
          />
        </Card>
      )}

      <GenerateInvoiceModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        customers={customers.data ?? []}
        onGenerated={(inv) => setOpenId(inv.id)}
      />
      <InvoiceDetailModal
        invoiceId={openId}
        customerName={openId ? nameFor(invoices.data?.find((i) => i.id === openId)?.customerId ?? "") : ""}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}
