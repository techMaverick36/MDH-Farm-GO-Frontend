import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { MilkSession } from "@mdh/shared";
import { apiPost } from "@/lib/api";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { litresToMl, localInputToIso, nowForInput } from "@/lib/format";
import { newClientUuid } from "@/lib/clientUuid";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { TextField, SelectField } from "@/components/Field";
import type { Cow } from "@/features/cows/types";
import type { MilkCollection } from "./types";

const formSchema = z.object({
  litres: z.coerce
    .number({ invalid_type_error: "Enter how many litres" })
    .positive("Enter how many litres"),
  session: z.nativeEnum(MilkSession),
  collectedAt: z.string().min(1, "Pick a date and time"),
  cowId: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function MilkForm({
  open,
  onClose,
  cows,
}: {
  open: boolean;
  onClose: () => void;
  cows: Cow[];
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  // One idempotency key per open form; reused across retries of the same record.
  const clientUuid = useRef(newClientUuid());

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      session: MilkSession.MORNING,
      collectedAt: nowForInput(),
      cowId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiPost<MilkCollection>("/dairy/milk-collections", {
        quantityMl: litresToMl(values.litres),
        session: values.session,
        collectedAt: localInputToIso(values.collectedAt),
        ...(values.cowId ? { cowId: values.cowId } : {}),
        clientUuid: clientUuid.current,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milk-collections"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      toast.success("Milk recorded.");
      clientUuid.current = newClientUuid();
      reset({ session: MilkSession.MORNING, collectedAt: nowForInput(), cowId: "" });
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        toast.error(toMessage(err, "Couldn't record the milk."));
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record milk"
      description="Log a milk collection. Enter the amount in litres."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="milk-form" loading={isSubmitting || mutation.isPending}>
            Record milk
          </Button>
        </>
      }
    >
      <form
        id="milk-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField
          label="Amount"
          type="number"
          step="0.1"
          min="0"
          inputMode="decimal"
          suffix="litres"
          placeholder="0.0"
          error={errors.litres?.message}
          {...register("litres")}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Session" error={errors.session?.message} {...register("session")}>
            <option value={MilkSession.MORNING}>Morning</option>
            <option value={MilkSession.EVENING}>Evening</option>
          </SelectField>
          <TextField
            label="When"
            type="datetime-local"
            error={errors.collectedAt?.message}
            {...register("collectedAt")}
          />
        </div>
        <SelectField
          label="Cow (optional)"
          hint="Leave blank for a bulk / tank collection."
          error={errors.cowId?.message}
          {...register("cowId")}
        >
          <option value="">Whole tank / not specified</option>
          {cows.map((cow) => (
            <option key={cow.id} value={cow.id}>
              {cow.name ? `${cow.name} (${cow.tag})` : `Cow ${cow.tag}`}
            </option>
          ))}
        </SelectField>
      </form>
    </Modal>
  );
}
