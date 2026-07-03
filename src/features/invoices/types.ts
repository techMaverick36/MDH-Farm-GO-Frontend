import type { InvoiceStatus, PaymentMethod } from "@mdh/shared";

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  description: string;
  stockItemId: string | null;
  deliveryId: string | null;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
}

export interface Payment {
  id: string;
  customerId: string;
  invoiceId: string | null;
  amountMinor: number;
  currency: string;
  method: PaymentMethod;
  reference: string | null;
  recordedAt: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  number: string;
  status: InvoiceStatus;
  periodStart: string | null;
  periodEnd: string | null;
  currency: string;
  subtotalMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  balanceMinor: number;
  issuedAt: string | null;
  sentAt: string | null;
  dueAt: string | null;
  createdAt: string;
  lines: InvoiceLine[];
  payments?: Payment[];
}
