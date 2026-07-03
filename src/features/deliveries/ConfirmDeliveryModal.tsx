import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { toMessage } from "@/lib/formErrors";
import { baseToDisplayQty, displayQtyToBase, displayUnitLabel } from "@/lib/format";
import { newClientUuid } from "@/lib/clientUuid";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Field";
import type { Delivery, StockItem } from "./types";

// Lets the manager confirm a delivery by entering the customer's verification
// code. Received quantities default to what was sent; changing any of them marks
// the delivery DISPUTED on the server.
export function ConfirmDeliveryModal({
  open,
  onClose,
  delivery,
  stockItems,
}: {
  open: boolean;
  onClose: () => void;
  delivery: Delivery | null;
  stockItems: StockItem[];
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const clientUuid = useRef(newClientUuid());
  const [code, setCode] = useState("");
  const [received, setReceived] = useState<Record<string, string>>({});
  const [codeError, setCodeError] = useState<string | undefined>();

  const unitFor = (stockItemId: string) =>
    stockItems.find((s) => s.id === stockItemId)?.unit ?? "piece";
  const nameFor = (stockItemId: string) =>
    stockItems.find((s) => s.id === stockItemId)?.name ?? "Item";

  // Received defaults to what was sent (in display units). Local `received`
  // overrides per line; it's cleared when the modal closes.
  const initialReceived: Record<string, string> = {};
  for (const l of delivery?.lines ?? []) {
    initialReceived[l.id] = String(baseToDisplayQty(l.quantitySent, unitFor(l.stockItemId)));
  }

  const mutation = useMutation({
    mutationFn: () => {
      const lines = (delivery?.lines ?? []).map((l) => {
        const unit = unitFor(l.stockItemId);
        const raw = received[l.id] ?? initialReceived[l.id] ?? "0";
        return { lineId: l.id, quantityReceived: displayQtyToBase(Number(raw), unit) };
      });
      return apiPost<Delivery>(`/deliveries/${delivery!.id}/confirm`, {
        code: code.trim(),
        lines,
        clientUuid: clientUuid.current,
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      clientUuid.current = newClientUuid();
      if (updated.status === "DISPUTED") {
        toast.info("Delivery confirmed with a difference. Marked as disputed.");
      } else {
        toast.success("Delivery confirmed.");
      }
      handleClose();
    },
    onError: (err) => {
      // Surface code-specific errors next to the code field.
      setCodeError(toMessage(err, "Couldn't confirm the delivery."));
      toast.error(toMessage(err, "Couldn't confirm the delivery."));
    },
  });

  function handleClose() {
    setCode("");
    setReceived({});
    setCodeError(undefined);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Confirm delivery"
      description="Enter the code the customer gives, and the litres they confirm receiving. Adjust amounts only if they differ from what was sent."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!code.trim()}>
            Confirm
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <TextField
            label="Verification code"
            inputMode="numeric"
            autoComplete="off"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setCodeError(undefined);
            }}
            error={codeError}
          />
          {delivery?.verificationCode && code !== delivery.verificationCode && (
            <button
              type="button"
              onClick={() => {
                setCode(delivery.verificationCode);
                setCodeError(undefined);
              }}
              className="mt-1.5 text-sm font-medium text-brand-700 hover:underline"
            >
              Use this delivery&apos;s code ({delivery.verificationCode})
            </button>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Items received</p>
          {(delivery?.lines ?? []).map((l) => {
            const unit = unitFor(l.stockItemId);
            return (
              <div key={l.id} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-sm text-slate-600">
                  {nameFor(l.stockItemId)}
                </span>
                <div className="w-32">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    aria-label={`Received ${nameFor(l.stockItemId)}`}
                    className="h-10 w-full rounded-lg border-0 bg-white px-3 text-right text-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-brand-500"
                    value={received[l.id] ?? initialReceived[l.id] ?? ""}
                    onChange={(e) =>
                      setReceived((r) => ({ ...r, [l.id]: e.target.value }))
                    }
                  />
                </div>
                <span className="w-8 text-sm text-slate-400">{displayUnitLabel(unit)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
