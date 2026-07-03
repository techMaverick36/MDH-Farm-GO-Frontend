import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiPost, apiPatch } from "@/lib/api";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { majorToMinor, minorToMajor } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Field";
import type { Customer } from "./types";

const formSchema = z.object({
  name: z.string().min(1, "Enter a name").max(120),
  phone: z.string().max(32).optional(),
  zone: z.string().max(80).optional(),
  openingBalance: z.coerce.number().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function CustomerForm({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}) {
  const editing = Boolean(customer);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { currency } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      zone: customer?.zone ?? "",
      openingBalance: customer ? minorToMajor(customer.openingBalMinor) : 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const openingBalMinor = majorToMinor(values.openingBalance ?? 0);
      if (editing && customer) {
        return apiPatch<Customer>(`/customers/${customer.id}`, {
          name: values.name.trim(),
          phone: values.phone?.trim() || null,
          zone: values.zone?.trim() || null,
          openingBalMinor,
        });
      }
      return apiPost<Customer>("/customers", {
        name: values.name.trim(),
        ...(values.phone?.trim() ? { phone: values.phone.trim() } : {}),
        ...(values.zone?.trim() ? { zone: values.zone.trim() } : {}),
        openingBalMinor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(editing ? "Customer updated." : "Customer added.");
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        toast.error(toMessage(err, "Couldn't save the customer."));
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit customer" : "Add a customer"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" loading={isSubmitting || mutation.isPending}>
            {editing ? "Save changes" : "Add customer"}
          </Button>
        </>
      }
    >
      <form
        id="customer-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField
          label="Name"
          placeholder="e.g. Mary's Shop"
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Phone (optional)"
            type="tel"
            inputMode="tel"
            placeholder="+256…"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <TextField
            label="Area / zone (optional)"
            placeholder="e.g. Eastside"
            error={errors.zone?.message}
            {...register("zone")}
          />
        </div>
        <TextField
          label="Opening balance owed"
          type="number"
          step="0.01"
          inputMode="decimal"
          suffix={currency}
          hint="What this customer already owes you, if anything."
          error={errors.openingBalance?.message}
          {...register("openingBalance")}
        />
      </form>
    </Modal>
  );
}
