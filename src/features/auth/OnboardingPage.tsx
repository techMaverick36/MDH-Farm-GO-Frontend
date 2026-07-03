import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { updateFarmSchema, type UpdateFarmInput } from "@mdh/shared";
import { apiPatch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { applyApiFieldErrors, toMessage } from "@/lib/formErrors";
import { TextField } from "@/components/Field";
import { Button } from "@/components/Button";
import { AuthLayout } from "./AuthLayout";

// Shown on a manager's first login (needsOnboarding): complete the farm profile.
// Submitting it marks onboarding complete on the server.
export function OnboardingPage() {
  const { farm, refresh } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateFarmInput>({
    resolver: zodResolver(updateFarmSchema),
    defaultValues: {
      name: farm?.name ?? "",
      country: farm?.country ?? "",
      currency: farm?.currency ?? "UGX",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: UpdateFarmInput) => apiPatch("/farm", values),
    onSuccess: () => refresh(),
    onError: (err) => {
      if (!applyApiFieldErrors(err, setError)) {
        setError("root", { message: toMessage(err, "Couldn't save your farm details.") });
      }
    },
  });

  return (
    <AuthLayout
      title="Tell us about your farm"
      subtitle="Just a few details to finish setting up. You can change these later in settings."
    >
      <form
        onSubmit={handleSubmit((v) => mutation.mutateAsync(v).catch(() => undefined))}
        className="space-y-4"
        noValidate
      >
        <TextField
          label="Farm name"
          placeholder="Green Valley Dairy"
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Country"
            placeholder="Uganda"
            error={errors.country?.message}
            {...register("country")}
          />
          <TextField
            label="Currency"
            placeholder="UGX"
            maxLength={3}
            hint="3-letter code"
            error={errors.currency?.message}
            {...register("currency")}
          />
        </div>
        {errors.root && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" size="lg" block loading={mutation.isPending}>
          Finish setup
        </Button>
      </form>
    </AuthLayout>
  );
}
