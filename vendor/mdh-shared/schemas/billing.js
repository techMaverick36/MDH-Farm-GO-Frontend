import { z } from "zod";
// ---- Plans (platform admin) ----
export const createPlanSchema = z.object({
    name: z.string().min(2).max(80),
    durationDays: z.number().int().positive(),
    priceMinor: z.number().int().nonnegative(),
    currency: z.string().length(3),
});
// ---- Tokens (platform admin) ----
export const generateTokensSchema = z.object({
    planId: z.string().uuid(),
    count: z.number().int().min(1).max(500).optional(),
    expiresAt: z.string().datetime().optional(),
});
// ---- Issue an activation code bound to one specific farm (platform admin) ----
export const issueFarmTokenSchema = z.object({
    planId: z.string().uuid(),
    expiresAt: z.string().datetime().optional(),
});
// ---- Redeem (manager) ----
export const redeemTokenSchema = z.object({
    code: z.string().min(4).max(40),
});
// ---- Module enablement (platform admin) ----
export const enableModuleSchema = z.object({
    farmId: z.string().uuid(),
    moduleKey: z.string().min(1).max(40),
    enabled: z.boolean().default(true),
});
// ---- Manager account management (platform admin) ----
// Admin edits a farm's manager for recovery/lifecycle — NOT staff/customers.
export const updateManagerSchema = z
    .object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().min(6).max(32).nullable().optional(),
    isActive: z.boolean().optional(),
})
    .refine((v) => Object.keys(v).length > 0, { message: "No changes provided" });
export const resetManagerPasswordSchema = z.object({
    password: z.string().min(8).max(200), // temporary; manager resets on next login
});
// ---- Suspend / reactivate a farm (platform admin) ----
export const suspendFarmSchema = z.object({
    suspend: z.boolean(),
    reason: z.string().max(200).optional(),
});
//# sourceMappingURL=billing.js.map