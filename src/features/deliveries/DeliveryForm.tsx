import { useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiPost } from "@/lib/api";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import {
  displayQtyToBase,
  displayPriceToBaseMinor,
  displayUnitLabel,
  localInputToIso,
} from "@/lib/format";
import { newClientUuid } from "@/lib/clientUuid";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { TextField, SelectField } from "@/components/Field";
import type { Customer } from "@/features/customers/types";
import type { StockItem, Delivery } from "./types";

const lineSchema = z.object({
  stockItemId: z.string().min(1, "Pick an item"),
  quantity: z.coerce.number().positive("Enter a quantity"),
  price: z.coerce.number().nonnegative().optional(),
});
const formSchema = z.object({
  customerId: z.string().min(1, "Pick a customer"),
  scheduledAt: z.string().optional(),
  lines: z.array(lineSchema).min(1, "Add at least one item"),
  sendCodeSms: z.boolean().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function DeliveryForm({
  open,
  onClose,
  customers,
  stockItems,
}: {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  stockItems: StockItem[];
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { currency } = useAuth();
  const clientUuid = useRef(newClientUuid());

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      scheduledAt: "",
      lines: [{ stockItemId: "", quantity: undefined as unknown as number, price: undefined }],
      sendCodeSms: false,
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const watchedLines = watch("lines");
  const watchedCustomerId = watch("customerId");
  const selectedCustomer = customers.find((c) => c.id === watchedCustomerId);
  const customerPhone = selectedCustomer?.phone ?? null;

  const itemById = (id: string) => stockItems.find((s) => s.id === id);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiPost<Delivery>("/deliveries", {
        customerId: values.customerId,
        ...(values.scheduledAt ? { scheduledAt: localInputToIso(values.scheduledAt) } : {}),
        lines: values.lines.map((l) => {
          const unit = itemById(l.stockItemId)?.unit ?? "piece";
          return {
            stockItemId: l.stockItemId,
            quantitySent: displayQtyToBase(l.quantity, unit),
            ...(l.price != null && !Number.isNaN(l.price)
              ? { unitPriceMinor: displayPriceToBaseMinor(l.price, unit) }
              : {}),
          };
        }),
        clientUuid: clientUuid.current,
        ...(values.sendCodeSms && customerPhone ? { sendCodeSms: true } : {}),
      }),
    onSuccess: (delivery) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success(`Delivery created. Code: ${delivery.verificationCode}`);
      clientUuid.current = newClientUuid();
      reset();
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        toast.error(toMessage(err, "Couldn't create the delivery."));
      }
    },
  });

  const noItems = stockItems.length === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New delivery"
      description="Record goods sent to a customer. A verification code is generated for them to confirm."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="delivery-form"
            loading={isSubmitting || mutation.isPending}
            disabled={noItems}
          >
            Create delivery
          </Button>
        </>
      }
    >
      <form
        id="delivery-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <SelectField
          label="Customer"
          error={errors.customerId?.message}
          {...register("customerId")}
        >
          <option value="">Choose a customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>

        <TextField
          label="Scheduled for (optional)"
          type="datetime-local"
          error={errors.scheduledAt?.message}
          {...register("scheduledAt")}
        />

        <label
          className={`flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 ${
            customerPhone ? "cursor-pointer" : "opacity-60"
          }`}
        >
          <input
            type="checkbox"
            disabled={!customerPhone}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            {...register("sendCodeSms")}
          />
          <span className="text-sm">
            <span className="font-medium text-slate-700">
              Text the secret code to the customer
            </span>
            <span className="block text-slate-500">
              {!watchedCustomerId
                ? "Pick a customer first."
                : customerPhone
                  ? `Sends the code by SMS to ${customerPhone}. Leave unticked to give it to them yourself.`
                  : "This customer has no phone number on file, so the code can't be texted."}
            </span>
          </span>
        </label>

        <div>
          <p className="mb-1.5 block text-sm font-medium text-slate-700">Items</p>
          {noItems ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              No stock items yet. Record some milk first so there's something to deliver.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, i) => {
                const unit = itemById(watchedLines?.[i]?.stockItemId ?? "")?.unit;
                const label = unit ? displayUnitLabel(unit) : "qty";
                return (
                  <div key={field.id} className="rounded-xl bg-slate-50 p-3">
                    <SelectField
                      label="Item"
                      error={errors.lines?.[i]?.stockItemId?.message}
                      {...register(`lines.${i}.stockItemId` as const)}
                    >
                      <option value="">Choose an item…</option>
                      {stockItems.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </SelectField>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <TextField
                        label="Quantity"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        suffix={label}
                        error={errors.lines?.[i]?.quantity?.message}
                        {...register(`lines.${i}.quantity` as const)}
                      />
                      <TextField
                        label="Price each (optional)"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        suffix={`${currency}/${label}`}
                        error={errors.lines?.[i]?.price?.message}
                        {...register(`lines.${i}.price` as const)}
                      />
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="mt-2 text-sm font-medium text-red-600 hover:underline"
                      >
                        Remove item
                      </button>
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ stockItemId: "", quantity: undefined as unknown as number })}
              >
                + Add another item
              </Button>
            </div>
          )}
          {errors.lines?.message && (
            <p className="mt-1.5 text-sm text-red-600">{errors.lines.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
