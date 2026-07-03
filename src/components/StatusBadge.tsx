import { cx } from "@/lib/cx";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-brand-50 text-brand-700 ring-brand-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
};

// Maps domain statuses to a tone + friendly label.
const STATUS_TONE: Record<string, Tone> = {
  // Delivery
  PENDING: "warning",
  CONFIRMED: "success",
  DISPUTED: "danger",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
  // Invoice
  DRAFT: "neutral",
  APPROVED: "info",
  SENT: "info",
  OVERDUE: "danger",
  PAID: "success",
  VOID: "neutral",
  // Cow
  ACTIVE: "success",
  DRY: "warning",
  SOLD: "neutral",
  DECEASED: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  DRAFT: "Draft",
  APPROVED: "Approved",
  SENT: "Sent",
  OVERDUE: "Overdue",
  PAID: "Paid",
  VOID: "Void",
  ACTIVE: "Active",
  DRY: "Dry",
  SOLD: "Sold",
  DECEASED: "Deceased",
};

export function StatusBadge({ status, tone }: { status: string; tone?: Tone }) {
  const resolved = tone ?? STATUS_TONE[status] ?? "neutral";
  const label = STATUS_LABEL[status] ?? status;
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[resolved],
      )}
    >
      {label}
    </span>
  );
}
