import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  StaffType,
  createStaffSchema,
  updateStaffSchema,
  type CreateStaffInput,
  type UpdateStaffInput,
} from "@mdh/shared";
import { apiPost, apiPatch } from "@/lib/api";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { TextField, SelectField } from "@/components/Field";
import { STAFF_TYPE_LABELS, type Staff } from "./types";

function TypeOptions() {
  return (
    <>
      {Object.values(StaffType).map((t) => (
        <option key={t} value={t}>
          {STAFF_TYPE_LABELS[t] ?? t}
        </option>
      ))}
    </>
  );
}

export function StaffCreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { staffType: StaffType.GENERAL },
  });

  // Blank optional inputs must validate as absent (""  fails .email()/.min()).
  const optional = { setValueAs: (v: string) => (v?.trim() ? v.trim() : undefined) };

  const mutation = useMutation({
    mutationFn: (values: CreateStaffInput) => apiPost("/staff", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member added. Share the temporary password with them.");
      reset();
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) toast.error(toMessage(err, "Couldn't add the staff member."));
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add staff member"
      description="Create a login for someone on your team. They reset the password on first sign-in."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="staff-create-form" loading={isSubmitting || mutation.isPending}>
            Add staff
          </Button>
        </>
      }
    >
      <form
        id="staff-create-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField label="Name" placeholder="John Worker" error={errors.name?.message} {...register("name")} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Role" error={errors.staffType?.message} {...register("staffType")}>
            <TypeOptions />
          </SelectField>
          <TextField label="Zone (optional)" placeholder="North" error={errors.zone?.message} {...register("zone", optional)} />
        </div>
        <TextField label="Email" type="email" placeholder="worker@email.com" hint="Provide an email or a phone number." error={errors.email?.message} {...register("email", optional)} />
        <TextField label="Phone" type="tel" placeholder="+256…" error={errors.phone?.message} {...register("phone", optional)} />
        <TextField label="Temporary password" type="text" autoComplete="off" placeholder="At least 8 characters" error={errors.password?.message} {...register("password")} />
      </form>
    </Modal>
  );
}

export function StaffEditModal({
  open,
  onClose,
  staff,
}: {
  open: boolean;
  onClose: () => void;
  staff: Staff | null;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStaffInput>({
    resolver: zodResolver(updateStaffSchema),
    values: {
      name: staff?.name ?? "",
      staffType: (staff?.staffType as UpdateStaffInput["staffType"]) ?? StaffType.GENERAL,
      zone: staff?.zone ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: UpdateStaffInput) =>
      apiPatch(`/staff/${staff!.id}`, { ...values, zone: values.zone?.trim() || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member updated.");
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) toast.error(toMessage(err, "Couldn't update the staff member."));
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit staff member"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="staff-edit-form" loading={isSubmitting || mutation.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <form
        id="staff-edit-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField label="Name" error={errors.name?.message} {...register("name")} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Role" error={errors.staffType?.message} {...register("staffType")}>
            <TypeOptions />
          </SelectField>
          <TextField label="Zone (optional)" error={errors.zone?.message} {...register("zone")} />
        </div>
      </form>
    </Modal>
  );
}
