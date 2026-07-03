import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateManagerSchema,
  resetManagerPasswordSchema,
  type UpdateManagerInput,
  type ResetManagerPasswordInput,
} from "@mdh/shared";
import { apiPatch, apiPost } from "@/lib/api";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Field";
import type { AdminFarm } from "./types";

// Admin edits a farm's MANAGER only. Staff/customers are the manager's job.
export function EditManagerModal({
  open,
  onClose,
  farm,
}: {
  open: boolean;
  onClose: () => void;
  farm: AdminFarm | null;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateManagerInput>({ resolver: zodResolver(updateManagerSchema) });

  const mutation = useMutation({
    mutationFn: (values: UpdateManagerInput) =>
      apiPatch(`/admin/farms/${farm!.id}/manager`, {
        ...(values.name?.trim() ? { name: values.name.trim() } : {}),
        ...(values.email?.trim() ? { email: values.email.trim() } : {}),
        ...(values.phone?.trim() ? { phone: values.phone.trim() } : {}),
        ...(values.isActive !== undefined ? { isActive: values.isActive } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-farms"] });
      toast.success("Manager updated.");
      reset();
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) toast.error(toMessage(err, "Couldn't update the manager."));
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit manager"
      description={`Update the manager for ${farm?.name ?? "this farm"}. Leave a field blank to keep it unchanged.`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-manager-form" loading={isSubmitting || mutation.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <form
        id="edit-manager-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField label="Name" placeholder="New name" error={errors.name?.message} {...register("name")} />
        <TextField label="Email" type="email" placeholder="new@email.com" error={errors.email?.message} {...register("email")} />
        <TextField label="Phone" type="tel" placeholder="+256…" error={errors.phone?.message} {...register("phone")} />
      </form>
    </Modal>
  );
}

export function ResetManagerPasswordModal({
  open,
  onClose,
  farm,
}: {
  open: boolean;
  onClose: () => void;
  farm: AdminFarm | null;
}) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetManagerPasswordInput>({ resolver: zodResolver(resetManagerPasswordSchema) });

  const mutation = useMutation({
    mutationFn: (values: ResetManagerPasswordInput) =>
      apiPost(`/admin/farms/${farm!.id}/manager/reset-password`, values),
    onSuccess: () => {
      toast.success("Password reset. Share the temporary password with the manager.");
      reset();
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) toast.error(toMessage(err, "Couldn't reset the password."));
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset manager password"
      description={`Set a temporary password for ${farm?.name ?? "this farm"}'s manager. They'll be asked to choose a new one on next login.`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="reset-pw-form" loading={isSubmitting || mutation.isPending}>
            Reset password
          </Button>
        </>
      }
    >
      <form
        id="reset-pw-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField
          label="Temporary password"
          type="text"
          autoComplete="off"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
      </form>
    </Modal>
  );
}
