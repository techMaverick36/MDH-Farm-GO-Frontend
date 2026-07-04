import { z } from "zod";
import { PaymentMethod } from "../enums.js";
// Validation schemas for Invoicing & Payments. Shared by the API boundary and
// the clients.
// Generate a draft invoice from a customer's confirmed deliveries in a period.
export const generateInvoiceSchema = z.object({
    customerId: z.string().uuid(),
    periodStart: z.string().datetime(),
    periodEnd: z.string().datetime(),
    dueAt: z.string().datetime().optional(),
});
// Draft-only edits: due date and manual lines that replace auto-drafted ones.
const manualLineInput = z.object({
    description: z.string().min(1).max(200),
    stockItemId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    unitPriceMinor: z.number().int().nonnegative(),
});
export const updateInvoiceSchema = z.object({
    dueAt: z.string().datetime().nullable().optional(),
    lines: z.array(manualLineInput).optional(), // replaces all current lines
});
export const recordPaymentSchema = z.object({
    customerId: z.string().uuid(),
    invoiceId: z.string().uuid().optional(), // omit => on-account payment
    amountMinor: z.number().int().positive(),
    method: z.nativeEnum(PaymentMethod),
    reference: z.string().max(120).optional(),
    clientUuid: z.string().uuid(),
});
//# sourceMappingURL=invoicing.js.map