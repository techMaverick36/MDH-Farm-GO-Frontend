import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { toMessage } from "@/lib/formErrors";
import { formatMoney } from "@/lib/format";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { SelectField } from "@/components/Field";
import { LoadingState } from "@/components/Spinner";
import type { AdminFarm } from "./types";

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  priceMinor: number;
  currency: string;
}
interface IssuedToken {
  code: string;
  planName: string;
  farmName: string;
}

// Admin issues a farm-bound activation code: pick a plan, generate the code,
// then copy/share it with the farmer who paid. Only that farm can redeem it.
export function IssueTokenModal({
  open,
  onClose,
  farm,
}: {
  open: boolean;
  onClose: () => void;
  farm: AdminFarm | null;
}) {
  const toast = useToast();
  const [planId, setPlanId] = useState("");
  const [issued, setIssued] = useState<IssuedToken | null>(null);

  const plans = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => apiGet<Plan[]>("/admin/plans"),
    enabled: open,
  });

  const issue = useMutation({
    mutationFn: (selectedPlanId: string) =>
      apiPost<IssuedToken>(`/admin/farms/${farm!.id}/token`, { planId: selectedPlanId }),
    onSuccess: (data) => setIssued(data),
    onError: (err) => toast.error(toMessage(err, "Couldn't issue the code.")),
  });

  function handleClose() {
    setIssued(null);
    setPlanId("");
    onClose();
  }

  async function copy() {
    if (issued) {
      await navigator.clipboard.writeText(issued.code).catch(() => undefined);
      toast.success("Code copied.");
    }
  }

  const effectivePlanId = planId || plans.data?.[0]?.id || "";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={issued ? "Activation code ready" : "Issue activation code"}
      description={
        issued
          ? `Share this code with ${issued.farmName}. Only this farm can redeem it.`
          : `Generate a code bound to ${farm?.name ?? "this farm"} after they've paid.`
      }
      footer={
        issued ? (
          <Button onClick={handleClose}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={() => effectivePlanId && issue.mutate(effectivePlanId)}
              loading={issue.isPending}
              disabled={!effectivePlanId}
            >
              Generate code
            </Button>
          </>
        )
      }
    >
      {issued ? (
        <div className="space-y-3">
          <div className="rounded-xl bg-brand-50 p-4 text-center ring-1 ring-brand-100">
            <p className="text-xs uppercase tracking-wide text-brand-700">{issued.planName}</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-brand-800">
              {issued.code}
            </p>
          </div>
          <Button variant="secondary" block onClick={copy}>
            Copy code
          </Button>
        </div>
      ) : plans.isLoading ? (
        <LoadingState label="Loading plans…" />
      ) : plans.data && plans.data.length > 0 ? (
        <SelectField
          label="Plan"
          value={effectivePlanId}
          onChange={(e) => setPlanId(e.target.value)}
        >
          {plans.data.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.durationDays} days · {formatMoney(p.priceMinor, p.currency)}
            </option>
          ))}
        </SelectField>
      ) : (
        <p className="text-sm text-slate-500">
          No plans exist yet. Create a plan first, then issue a code.
        </p>
      )}
    </Modal>
  );
}
