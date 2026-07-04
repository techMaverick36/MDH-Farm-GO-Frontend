import { z } from "zod";
// Validation schemas for the Sales bounded context: customers, deliveries, and
// delivery confirmation. Shared by the API boundary and the clients.
// ---- Customers ----
export const createCustomerSchema = z.object({
    name: z.string().min(1).max(120),
    phone: z.string().min(6).max(32).optional(),
    zone: z.string().max(80).optional(),
    openingBalMinor: z.number().int().optional(),
});
// Provision a mobile login for an existing customer (creates a CUSTOMER user
// linked to the customer record). Needs an email or phone plus a password.
export const createCustomerAccountSchema = z
    .object({
    email: z.string().email().optional(),
    phone: z.string().min(6).max(32).optional(),
    password: z.string().min(8).max(200),
})
    .refine((v) => v.email || v.phone, {
    message: "Provide an email or a phone number",
    path: ["email"],
});
export const updateCustomerSchema = z.object({
    name: z.string().min(1).max(120).optional(),
    phone: z.string().min(6).max(32).nullable().optional(),
    zone: z.string().max(80).nullable().optional(),
    openingBalMinor: z.number().int().optional(),
});
// ---- Deliveries ----
const deliveryLineInput = z.object({
    stockItemId: z.string().uuid(),
    quantitySent: z.number().int().positive(),
    unitPriceMinor: z.number().int().nonnegative().optional(),
});
export const createDeliverySchema = z.object({
    customerId: z.string().uuid(),
    assignedTo: z.string().uuid().optional(),
    scheduledAt: z.string().datetime().optional(),
    lines: z.array(deliveryLineInput).min(1),
    clientUuid: z.string().uuid(),
    // Text the verification code to the customer's phone. Opt-in: the manager
    // decides per delivery (some codes are handed over in person, some customers
    // share phones). A code can also be sent later via
    // POST /deliveries/:id/send-code.
    sendCodeSms: z.boolean().optional(),
});
// Pre-confirm edits only (a confirmed delivery is immutable).
export const updateDeliverySchema = z.object({
    assignedTo: z.string().uuid().nullable().optional(),
    scheduledAt: z.string().datetime().nullable().optional(),
    lines: z.array(deliveryLineInput).min(1).optional(),
});
// ---- Confirmation ----
export const confirmDeliverySchema = z.object({
    code: z.string().min(1).max(16),
    lines: z
        .array(z.object({
        lineId: z.string().uuid(),
        quantityReceived: z.number().int().nonnegative(),
    }))
        .optional(), // omitted => received exactly what was sent
    photoFileId: z.string().uuid().optional(),
    notes: z.string().max(500).optional(),
    clientUuid: z.string().uuid(),
});
// Manager resolves a disputed delivery, accepting the received quantities.
export const resolveDeliverySchema = z.object({
    notes: z.string().max(500).optional(),
});
//# sourceMappingURL=sales.js.map