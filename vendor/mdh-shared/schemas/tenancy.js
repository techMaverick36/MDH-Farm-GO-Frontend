import { z } from "zod";
// Farm profile (name/country/currency). Submitting this the first time also
// completes onboarding. Used by the manager's first-login farm-details step.
export const updateFarmSchema = z
    .object({
    name: z.string().min(2).max(120).optional(),
    country: z.string().min(2).max(80).optional(),
    currency: z.string().length(3).optional(),
})
    .refine((v) => Object.keys(v).length > 0, { message: "No changes provided" });
// Farm-level settings a manager can adjust.
export const updateFarmSettingsSchema = z
    .object({
    deliveryCodeTtlMins: z.number().int().min(5).max(43_200).optional(), // 5 min–30 days
    retentionDays: z.number().int().min(1).max(3650).optional(),
    invoicePrefix: z.string().min(1).max(10).optional(),
    defaultMilkUnit: z.string().min(1).max(10).optional(),
    defaultEggUnit: z.string().min(1).max(10).optional(),
})
    .refine((v) => Object.keys(v).length > 0, { message: "No settings provided" });
//# sourceMappingURL=tenancy.js.map