import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerSchema, type RegisterInput } from "@mdh/shared";
import { apiPost } from "@/lib/api";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Field";

// Admin onboards a new farm + its first manager. The manager receives the temp
// password here and must reset it on first login.
export function OnboardFarmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { currency: "UGX", country: "" },
  });

  // Blank optional inputs must validate as absent (""  fails .email()/.min()).
  const optional = { setValueAs: (v: string) => (v?.trim() ? v.trim() : undefined) };

  const mutation = useMutation({
    mutationFn: (values: RegisterInput) => apiPost("/admin/farms", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-farms"] });
      toast.success("Farm created. Share the temporary password with the manager.");
      reset();
      onClose();
    },
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        toast.error(toMessage(err, "Couldn't create the farm."));
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Onboard a new farm"
      description="Create the farm and its manager. The manager signs in with these details and finishes setup themselves."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="onboard-form" loading={isSubmitting || mutation.isPending}>
            Create farm
          </Button>
        </>
      }
    >
      <form
        id="onboard-form"
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField label="Farm name" placeholder="Green Valley Dairy" error={errors.farmName?.message} {...register("farmName")} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Country" placeholder="Uganda" error={errors.country?.message} {...register("country")} />
          <TextField label="Currency" placeholder="UGX" maxLength={3} hint="3-letter code" error={errors.currency?.message} {...register("currency")} />
        </div>
        <hr className="border-slate-100" />
        <p className="text-sm font-medium text-slate-700">Manager account</p>
        <TextField label="Manager name" placeholder="Jane Manager" error={errors.managerName?.message} {...register("managerName")} />
        <TextField label="Email" type="email" inputMode="email" placeholder="manager@farm.com" hint="Provide an email or a phone number." error={errors.email?.message} {...register("email", optional)} />
        <TextField label="Phone" type="tel" inputMode="tel" placeholder="+256…" error={errors.phone?.message} {...register("phone", optional)} />
        <TextField label="Temporary password" type="text" autoComplete="off" placeholder="At least 8 characters" hint="The manager resets this on first login." error={errors.password?.message} {...register("password")} />
      </form>
    </Modal>
  );
}
