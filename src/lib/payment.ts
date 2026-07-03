// Mobile-money payment instructions shown on the activation screen. Billing is
// manual for the MVP: the farmer pays out-of-band, then the admin issues a code.
// Override per deployment via Vite env vars.
export const PAYMENT_INFO = {
  method: import.meta.env.VITE_PAY_METHOD ?? "Mobile Money",
  payTo: import.meta.env.VITE_PAY_TO ?? "0700 000 000 (MDH Farm GO)",
  amountLabel: import.meta.env.VITE_PAY_AMOUNT ?? "your plan fee",
  contact: import.meta.env.VITE_PAY_CONTACT ?? "+256 700 000 000",
};
