import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Permission } from "@mdh/shared";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { toMessage } from "@/lib/formErrors";
import { formatDateTime, formatUnitQty } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DeliveryForm } from "./DeliveryForm";
import { ConfirmDeliveryModal } from "./ConfirmDeliveryModal";
import { ResolveDisputeModal } from "./ResolveDisputeModal";
import type { Delivery, StockItem } from "./types";
import type { Customer } from "@/features/customers/types";

export function DeliveriesPage() {
  const { can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [confirming, setConfirming] = useState<Delivery | null>(null);
  const [resolving, setResolving] = useState<Delivery | null>(null);
  const [deleting, setDeleting] = useState<Delivery | null>(null);

  const deliveries = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => apiGet<Delivery[]>("/deliveries?limit=100"),
    // While any delivery is still awaiting confirmation, poll so a confirmation
    // made on the delivery person's app shows up here within a few seconds
    // without a manual refresh. Stops polling once nothing is pending.
    refetchInterval: (query) =>
      (query.state.data ?? []).some((d) => d.status === "PENDING") ? 12_000 : false,
    refetchOnWindowFocus: true,
  });
  const customers = useQuery({
    queryKey: ["customers"],
    queryFn: () => apiGet<Customer[]>("/customers"),
    enabled: can(Permission.CUSTOMER_VIEW),
  });
  const stockItems = useQuery({
    queryKey: ["stock-items"],
    queryFn: () => apiGet<StockItem[]>("/inventory/stock-items"),
    enabled: can(Permission.STOCK_VIEW),
  });

  const customerName = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of customers.data ?? []) map.set(c.id, c.name);
    return map;
  }, [customers.data]);
  const customersById = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const c of customers.data ?? []) map.set(c.id, c);
    return map;
  }, [customers.data]);
  const items = stockItems.data ?? [];
  const itemById = useMemo(() => {
    const map = new Map<string, StockItem>();
    for (const s of items) map.set(s.id, s);
    return map;
  }, [items]);

  const remove = useMutation({
    mutationFn: (d: Delivery) => apiDelete(`/deliveries/${d.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Delivery moved to the bin.");
      setDeleting(null);
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't delete the delivery.")),
  });

  // On-demand code SMS: the manager chooses when (and whether) the customer
  // gets the code by text. Works as a resend too.
  const sendCode = useMutation({
    mutationFn: (d: Delivery) => apiPost<{ sent: boolean }>(`/deliveries/${d.id}/send-code`),
    onSuccess: (result, d) => {
      const phone = customersById.get(d.customerId)?.phone;
      if (result.sent) {
        toast.success(`Code sent by SMS${phone ? ` to ${phone}` : ""}.`);
      } else {
        toast.error("The SMS could not be delivered. Give the customer the code yourself.");
      }
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't send the code.")),
  });

  const newButton = can(Permission.DELIVERY_CREATE) ? (
    <Button onClick={() => setCreateOpen(true)}>+ New delivery</Button>
  ) : undefined;

  return (
    <>
      <PageHeader
        title="Deliveries"
        subtitle="Goods sent to customers and their confirmation status."
        action={newButton}
      />

      {deliveries.isLoading ? (
        <LoadingState label="Loading deliveries…" />
      ) : deliveries.error ? (
        <Card>
          <ErrorState error={deliveries.error} onRetry={() => deliveries.refetch()} />
        </Card>
      ) : deliveries.data && deliveries.data.length > 0 ? (
        <div className="space-y-3">
          {deliveries.data.map((d) => (
            <Card key={d.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800">
                      {customerName.get(d.customerId) ?? "Customer"}
                    </h3>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(d.recordedAt)}</p>
                </div>

                {d.status === "PENDING" && (
                  <div className="rounded-xl bg-brand-50 px-3 py-2 text-center">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-brand-700">
                      Verification code
                    </p>
                    <p className="font-mono text-xl font-bold tracking-widest text-brand-800">
                      {d.verificationCode}
                    </p>
                  </div>
                )}
              </div>

              <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl ring-1 ring-slate-100">
                {d.lines.map((l) => {
                  const item = itemById.get(l.stockItemId);
                  const unit = item?.unit ?? "piece";
                  const shortfall =
                    l.quantityReceived != null && l.quantityReceived < l.quantitySent;
                  return (
                    <li key={l.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span className="min-w-0 truncate text-slate-700">{item?.name ?? "Item"}</span>
                      <span className="flex items-center gap-3 whitespace-nowrap">
                        <span className="text-slate-500">Sent {formatUnitQty(l.quantitySent, unit)}</span>
                        {l.quantityReceived != null && (
                          <span className={shortfall ? "font-semibold text-red-600" : "font-medium text-brand-700"}>
                            Got {formatUnitQty(l.quantityReceived, unit)}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {d.status === "PENDING" && (
                <p className="mt-2 text-xs text-slate-500">
                  Give this code to the customer. At delivery they enter it, with the litres they
                  received, on the delivery person's phone to confirm. That is your proof against
                  disputes.
                </p>
              )}
              {d.status === "CONFIRMED" && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Customer confirmed they received this delivery.
                </p>
              )}
              {d.status === "DISPUTED" && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  Customer says they received less than was sent. Review and resolve.
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {d.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await navigator.clipboard.writeText(d.verificationCode).catch(() => undefined);
                      toast.success("Code copied. Share it with the customer.");
                    }}
                  >
                    Copy code
                  </Button>
                )}
                {d.status === "PENDING" &&
                  can(Permission.DELIVERY_CREATE) &&
                  customersById.get(d.customerId)?.phone && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={sendCode.isPending && sendCode.variables?.id === d.id}
                      onClick={() => sendCode.mutate(d)}
                    >
                      Text code to customer
                    </Button>
                  )}
                {d.status === "PENDING" && can(Permission.DELIVERY_CONFIRM) && (
                  <Button size="sm" onClick={() => setConfirming(d)}>
                    Enter customer code
                  </Button>
                )}
                {d.status === "DISPUTED" && can(Permission.DELIVERY_DISPUTE_RESOLVE) && (
                  <Button size="sm" onClick={() => setResolving(d)}>
                    Resolve dispute
                  </Button>
                )}
                {d.status === "PENDING" && can(Permission.DELIVERY_DELETE) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeleting(d)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No deliveries yet"
            description="Create your first delivery to send goods to a customer."
            action={newButton}
          />
        </Card>
      )}

      <DeliveryForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        customers={customers.data ?? []}
        stockItems={items}
      />
      <ConfirmDeliveryModal
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        delivery={confirming}
        stockItems={items}
      />
      <ResolveDisputeModal
        open={Boolean(resolving)}
        onClose={() => setResolving(null)}
        delivery={resolving}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this delivery?"
        message="This pending delivery will move to the recycle bin."
        confirmLabel="Delete"
        destructive
        onConfirm={() => (deleting ? remove.mutateAsync(deleting) : undefined)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
