import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Permission, ErrorCode } from "@mdh/shared";
import { ApiError, apiGet, apiPost, apiDelete } from "@/lib/api";
import { toMessage } from "@/lib/formErrors";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RecordPaymentModal } from "./RecordPaymentModal";
import type { Invoice } from "./types";

const METHOD_LABELS: Record<string, string> = {
  MOBILE_MONEY: "Mobile money",
  CASH: "Cash",
  BANK: "Bank transfer",
  OTHER: "Other",
};

export function InvoiceDetailModal({
  invoiceId,
  customerName,
  onClose,
}: {
  invoiceId: string | null;
  customerName: string;
  onClose: () => void;
}) {
  const { can, currency } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [disputeWarning, setDisputeWarning] = useState(false);

  const invoiceQuery = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => apiGet<Invoice>(`/invoices/${invoiceId}`),
    enabled: Boolean(invoiceId),
  });
  const invoice = invoiceQuery.data;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
  }

  const approve = useMutation({
    mutationFn: () => apiPost<Invoice>(`/invoices/${invoiceId}/approve`),
    onSuccess: () => {
      invalidate();
      setDisputeWarning(false);
      toast.success("Invoice approved.");
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === ErrorCode.INVOICE_HAS_DISPUTES) {
        setDisputeWarning(true);
      }
      toast.error(toMessage(err, "Couldn't approve the invoice."));
    },
  });

  const send = useMutation({
    mutationFn: () => apiPost<Invoice>(`/invoices/${invoiceId}/send`),
    onSuccess: () => {
      invalidate();
      toast.success("Invoice sent to the customer.");
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't send the invoice.")),
  });

  const remove = useMutation({
    mutationFn: () => apiDelete(`/invoices/${invoiceId}`),
    onSuccess: () => {
      invalidate();
      toast.success("Invoice moved to the bin.");
      setDeleteOpen(false);
      onClose();
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't delete the invoice.")),
  });

  const open = Boolean(invoiceId);
  const status = invoice?.status;
  const canPay =
    invoice != null &&
    invoice.balanceMinor > 0 &&
    status !== "DRAFT" &&
    status !== "VOID" &&
    can(Permission.PAYMENT_RECORD);

  return (
    <>
      <Modal
        open={open && !payOpen}
        onClose={onClose}
        title={invoice ? `Invoice ${invoice.number}` : "Invoice"}
        description={customerName}
        footer={
          invoice ? (
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <div>
                {status !== "PAID" && status !== "VOID" && can(Permission.INVOICE_DELETE) && (
                  <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteOpen(true)}>
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
                {canPay && (
                  <Button variant="secondary" onClick={() => setPayOpen(true)}>
                    Record payment
                  </Button>
                )}
                {status === "DRAFT" && can(Permission.INVOICE_APPROVE) && (
                  <Button onClick={() => approve.mutate()} loading={approve.isPending}>
                    Approve
                  </Button>
                )}
                {status === "APPROVED" && can(Permission.INVOICE_SEND) && (
                  <Button onClick={() => send.mutate()} loading={send.isPending}>
                    Send to customer
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )
        }
      >
        {invoiceQuery.isLoading ? (
          <LoadingState label="Loading invoice…" />
        ) : invoiceQuery.error ? (
          <ErrorState error={invoiceQuery.error} onRetry={() => invoiceQuery.refetch()} />
        ) : invoice ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge status={invoice.status} />
              <span className="text-sm text-slate-500">
                {invoice.periodStart && invoice.periodEnd
                  ? `${formatDate(invoice.periodStart)} to ${formatDate(invoice.periodEnd)}`
                  : null}
              </span>
            </div>

            {disputeWarning && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                This invoice covers a delivery the customer disputed. Resolve the dispute on the
                Deliveries screen, then approve again.
              </p>
            )}

            <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Item</th>
                    <th className="px-3 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.lines.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-3 py-4 text-center text-slate-400">
                        No lines. There were no confirmed deliveries in this period.
                      </td>
                    </tr>
                  ) : (
                    invoice.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="px-3 py-2 text-slate-700">{l.description}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-800">
                          {formatMoney(l.lineTotalMinor, invoice.currency)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Total</span>
                <span className="font-semibold text-slate-900">
                  {formatMoney(invoice.totalMinor, invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Paid</span>
                <span>- {formatMoney(invoice.amountPaidMinor, invoice.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1.5 text-base font-bold text-slate-900">
                <span>Balance</span>
                <span>{formatMoney(invoice.balanceMinor, invoice.currency)}</span>
              </div>
              {invoice.dueAt && (
                <p className="pt-1 text-xs text-slate-400">Due {formatDate(invoice.dueAt)}</p>
              )}
            </div>

            {invoice.payments && invoice.payments.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">Payments</p>
                <ul className="space-y-1 text-sm">
                  {invoice.payments.map((p) => (
                    <li key={p.id} className="flex justify-between text-slate-600">
                      <span>
                        {METHOD_LABELS[p.method] ?? p.method}
                        {p.reference ? ` · ${p.reference}` : ""} · {formatDateTime(p.recordedAt)}
                      </span>
                      <span className="font-medium text-slate-800">
                        {formatMoney(p.amountMinor, p.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      <RecordPaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        invoice={invoice ?? null}
        currency={invoice?.currency ?? currency}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this invoice?"
        message="The invoice will move to the recycle bin. Its deliveries can be invoiced again."
        confirmLabel="Delete"
        destructive
        onConfirm={() => remove.mutateAsync()}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
