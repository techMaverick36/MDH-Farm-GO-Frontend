import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlanSchema, type CreatePlanInput } from "@mdh/shared";
import { apiPost } from "@/lib/api";
import { majorToMinor } from "@/lib/format";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Field";

// Create a subscription plan. Price is typed in major units and stored as minor
// (value x 100), matching how money is stored everywhere.
export function CreatePlanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreatePlanInput>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { currency: "UGX" },
  });

  const mutation = useMutation({
    mutationFn: (values: CreatePlanInput) => apiPost("/admin/plans", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success("Plan created.");
      reset({ currency: "UGX" });
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        toast.error(toMessage(err, "Couldn't create the plan."));
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a plan"
      description="Define a subscription plan farms can activate with a token."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="plan-form" loading={isSubmitting || mutation.isPending}>
            Create plan
          </Button>
        </>
      }
    >
      <form
        id="plan-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField
          label="Plan name"
          placeholder="Standard Monthly"
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Duration (days)"
            type="number"
            inputMode="numeric"
            placeholder="30"
            error={errors.durationDays?.message}
            {...register("durationDays", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
          />
          <TextField
            label="Currency"
            placeholder="UGX"
            maxLength={3}
            error={errors.currency?.message}
            {...register("currency")}
          />
        </div>
        <TextField
          label="Price"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0"
          hint="Amount a farm pays for this plan. Use 0 for a free plan."
          error={errors.priceMinor?.message}
          {...register("priceMinor", {
            setValueAs: (v) => (v === "" ? undefined : majorToMinor(Number(v))),
          })}
        />
      </form>
    </Modal>
  );
}
