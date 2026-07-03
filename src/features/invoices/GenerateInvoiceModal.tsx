import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiPost } from "@/lib/api";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { dateInputToIso } from "@/lib/format";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { SelectField, TextField } from "@/components/Field";
import type { Customer } from "@/features/customers/types";
import type { Invoice } from "./types";

const formSchema = z
  .object({
    customerId: z.string().min(1, "Pick a customer"),
    periodStart: z.string().min(1, "Pick a start date"),
    periodEnd: z.string().min(1, "Pick an end date"),
    dueAt: z.string().optional(),
  })
  .refine((v) => v.periodStart <= v.periodEnd, {
    message: "End date must be after the start date",
    path: ["periodEnd"],
  });
type FormValues = z.infer<typeof formSchema>;

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

export function GenerateInvoiceModal({
  open,
  onClose,
  customers,
  onGenerated,
}: {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  onGenerated: (invoice: Invoice) => void;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      periodStart: daysAgo(30),
      periodEnd: daysAgo(0),
      dueAt: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiPost<Invoice>("/invoices/generate", {
        customerId: values.customerId,
        periodStart: dateInputToIso(values.periodStart),
        // Include the whole end day.
        periodEnd: new Date(`${values.periodEnd}T23:59:59.999Z`).toISOString(),
        ...(values.dueAt ? { dueAt: dateInputToIso(values.dueAt) } : {}),
      }),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      if (invoice.lines.length === 0) {
        toast.info("No confirmed deliveries in that period. The invoice is empty.");
      } else {
        toast.success(`Draft invoice ${invoice.number} created.`);
      }
      reset();
      onClose();
      onGenerated(invoice);
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        toast.error(toMessage(err, "Couldn't generate the invoice."));
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate an invoice"
      description="We'll add up the customer's confirmed deliveries in the period you choose."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="generate-form" loading={isSubmitting || mutation.isPending}>
            Generate draft
          </Button>
        </>
      }
    >
      <form
        id="generate-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <SelectField label="Customer" error={errors.customerId?.message} {...register("customerId")}>
          <option value="">Choose a customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="From"
            type="date"
            error={errors.periodStart?.message}
            {...register("periodStart")}
          />
          <TextField
            label="To"
            type="date"
            error={errors.periodEnd?.message}
            {...register("periodEnd")}
          />
        </div>
        <TextField
          label="Due date (optional)"
          type="date"
          error={errors.dueAt?.message}
          {...register("dueAt")}
        />
      </form>
    </Modal>
  );
}
