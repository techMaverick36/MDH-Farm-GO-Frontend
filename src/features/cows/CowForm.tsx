import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { CowStatus } from "@mdh/shared";
import { apiPost, apiPatch } from "@/lib/api";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { dateInputToIso, isoToDateInput } from "@/lib/format";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { TextField, SelectField } from "@/components/Field";
import type { Cow } from "./types";

// A small form-only schema (date input is YYYY-MM-DD; we convert to ISO on
// submit). The server validates with the shared createCow/updateCow schemas.
const formSchema = z.object({
  tag: z.string().min(1, "Give the cow a tag").max(40),
  name: z.string().max(80).optional(),
  breed: z.string().max(80).optional(),
  dateOfBirth: z.string().optional(),
  status: z.nativeEnum(CowStatus),
});
type FormValues = z.infer<typeof formSchema>;

const STATUS_LABELS: Record<CowStatus, string> = {
  ACTIVE: "Milking / Active",
  DRY: "Dry",
  SOLD: "Sold",
  DECEASED: "Deceased",
};

export function CowForm({
  open,
  onClose,
  cow,
}: {
  open: boolean;
  onClose: () => void;
  cow?: Cow | null;
}) {
  const editing = Boolean(cow);
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
    values: {
      tag: cow?.tag ?? "",
      name: cow?.name ?? "",
      breed: cow?.breed ?? "",
      dateOfBirth: isoToDateInput(cow?.dateOfBirth),
      status: cow?.status ?? CowStatus.ACTIVE,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        tag: values.tag.trim(),
        name: values.name?.trim() || null,
        breed: values.breed?.trim() || null,
        dateOfBirth: values.dateOfBirth ? dateInputToIso(values.dateOfBirth) : null,
        status: values.status,
      };
      if (editing && cow) {
        return apiPatch<Cow>(`/dairy/cows/${cow.id}`, payload);
      }
      // Create rejects null name/breed/dob — omit instead.
      return apiPost<Cow>("/dairy/cows", {
        tag: payload.tag,
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.breed ? { breed: payload.breed } : {}),
        ...(payload.dateOfBirth ? { dateOfBirth: payload.dateOfBirth } : {}),
        status: payload.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cows"] });
      toast.success(editing ? "Cow updated." : "Cow added.");
      reset();
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        toast.error(toMessage(err, "Couldn't save the cow."));
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit cow" : "Add a cow"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            form="cow-form"
            loading={isSubmitting || mutation.isPending}
          >
            {editing ? "Save changes" : "Add cow"}
          </Button>
        </>
      }
    >
      <form
        id="cow-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField
          label="Tag / number"
          placeholder="e.g. 042"
          error={errors.tag?.message}
          {...register("tag")}
        />
        <TextField
          label="Name (optional)"
          placeholder="e.g. Daisy"
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Breed (optional)"
            placeholder="e.g. Friesian"
            error={errors.breed?.message}
            {...register("breed")}
          />
          <TextField
            label="Date of birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register("dateOfBirth")}
          />
        </div>
        <SelectField label="Status" error={errors.status?.message} {...register("status")}>
          {Object.values(CowStatus).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </SelectField>
      </form>
    </Modal>
  );
}
