import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import type { Customer, CustomerStatement } from "./types";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className={strong ? "font-semibold text-slate-800" : "text-slate-600"}>{label}</span>
      <span className={strong ? "font-bold text-slate-900" : "font-medium text-slate-700"}>
        {value}
      </span>
    </div>
  );
}

export function StatementModal({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}) {
  const { currency } = useAuth();
  const statement = useQuery({
    queryKey: ["statement", customer?.id],
    queryFn: () => apiGet<CustomerStatement>(`/customers/${customer!.id}/statement`),
    enabled: open && Boolean(customer),
  });

  const s = statement.data;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Statement for ${customer?.name ?? ""}`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {statement.isLoading ? (
        <LoadingState label="Loading statement…" />
      ) : statement.error ? (
        <ErrorState error={statement.error} onRetry={() => statement.refetch()} />
      ) : s ? (
        <div className="divide-y divide-slate-100">
          <Row label="Opening balance" value={formatMoney(s.openingBalMinor, currency)} />
          <Row
            label={`Invoiced (${s.invoiceCount})`}
            value={formatMoney(s.invoicedMinor, currency)}
          />
          <Row label={`Paid (${s.paymentCount})`} value={`- ${formatMoney(s.paidMinor, currency)}`} />
          <Row label="Balance owed" value={formatMoney(s.balanceMinor, currency)} strong />
        </div>
      ) : null}
    </Modal>
  );
}
