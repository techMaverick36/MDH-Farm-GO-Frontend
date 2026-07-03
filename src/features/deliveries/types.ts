import type { DeliveryStatus } from "@mdh/shared";

export interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
}

export interface DeliveryLine {
  id: string;
  deliveryId: string;
  stockItemId: string;
  quantitySent: number;
  quantityReceived: number | null;
  unitPriceMinor: number | null;
}

export interface DeliveryConfirmation {
  id: string;
  deliveryId: string;
  notes: string | null;
  confirmedAt: string;
}

export interface Delivery {
  id: string;
  customerId: string;
  assignedTo: string | null;
  status: DeliveryStatus;
  verificationCode: string;
  codeExpiresAt: string;
  codeUsedAt: string | null;
  scheduledAt: string | null;
  recordedAt: string;
  lines: DeliveryLine[];
  confirmation?: DeliveryConfirmation | null;
}
