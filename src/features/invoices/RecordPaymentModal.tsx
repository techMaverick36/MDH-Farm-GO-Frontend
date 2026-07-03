import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { PaymentMethod } from "@mdh/shared";
import { apiPost } from "@/lib/api";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { majorToMinor, minorToMajor, formatMoney } from "@/lib/format";
import { newClientUuid } from "@/lib/clientUuid";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { SelectField, TextField } from "@/components/Field";
import type { Invoice, Payment } from "./types";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  MOBILE_MONEY: "Mobile money",
  CASH: "Cash",
  BANK: "Bank transfer",
  OTHER: "Other",
};

const formSchema = z.object({
  amount: z.coerce.number().positive("Enter an amount"),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().max(120).optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function RecordPaymentModal({
  open,
  onClose,
  invoice,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  currency: string;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const clientUuid = useRef(newClientUuid());

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      amount: invoice ? minorToMajor(invoice.balanceMinor) : 0,
      method: PaymentMethod.MOBILE_MONEY,
      reference: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiPost<Payment>("/payments", {
        customerId: invoice!.customerId,
        invoiceId: invoice!.id,
        amountMinor: majorToMinor(values.amount),
        method: values.method,
        ...(values.reference?.trim() ? { reference: values.reference.trim() } : {}),
        clientUuid: clientUuid.current,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", invoice?.id] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      toast.success("Payment recorded.");
      clientUuid.current = newClientUuid();
      reset();
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        toast.error(toMessage(err, "Couldn't record the payment."));
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record a payment"
      description={
        invoice
          ? `For invoice ${invoice.number}. Balance ${formatMoney(invoice.balanceMinor, currency)}.`
          : undefined
      }
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form" loading={isSubmitting || mutation.isPending}>
            Record payment
          </Button>
        </>
      }
    >
      <form
        id="payment-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField
          label="Amount received"
          type="number"
          step="0.01"
          inputMode="decimal"
          suffix={currency}
          error={errors.amount?.message}
          {...register("amount")}
        />
        <SelectField label="Method" error={errors.method?.message} {...register("method")}>
          {Object.values(PaymentMethod).map((m) => (
            <option key={m} value={m}>
              {METHOD_LABELS[m]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Reference (optional)"
          placeholder="e.g. M-Pesa code"
          error={errors.reference?.message}
          {...register("reference")}
        />
      </form>
    </Modal>
  );
}
