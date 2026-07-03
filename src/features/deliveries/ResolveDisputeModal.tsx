import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { toMessage } from "@/lib/formErrors";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import type { Delivery } from "./types";

// Manager accepts the received quantities on a disputed delivery, marking it
// CONFIRMED so it can be invoiced.
export function ResolveDisputeModal({
  open,
  onClose,
  delivery,
}: {
  open: boolean;
  onClose: () => void;
  delivery: Delivery | null;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<Delivery>(`/deliveries/${delivery!.id}/resolve`, {
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Dispute resolved. Delivery confirmed.");
      setNotes("");
      onClose();
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't resolve the dispute.")),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resolve dispute"
      description="Accept the quantities the customer reported. The delivery becomes confirmed and can be invoiced."
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
            Accept &amp; confirm
          </Button>
        </>
      }
    >
      <div>
        <label htmlFor="resolve-notes" className="mb-1.5 block text-sm font-medium text-slate-700">
          Notes (optional)
        </label>
        <textarea
          id="resolve-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Agreed with customer over the phone."
          className="block w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500"
        />
      </div>
    </Modal>
  );
}
