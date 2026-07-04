import { z } from "zod";
export declare const updateFarmSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    country?: string | undefined;
    currency?: string | undefined;
    name?: string | undefined;
}, {
    country?: string | undefined;
    currency?: string | undefined;
    name?: string | undefined;
}>, {
    country?: string | undefined;
    currency?: string | undefined;
    name?: string | undefined;
}, {
    country?: string | undefined;
    currency?: string | undefined;
    name?: string | undefined;
}>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;
export declare const updateFarmSettingsSchema: z.ZodEffects<z.ZodObject<{
    deliveryCodeTtlMins: z.ZodOptional<z.ZodNumber>;
    retentionDays: z.ZodOptional<z.ZodNumber>;
    invoicePrefix: z.ZodOptional<z.ZodString>;
    defaultMilkUnit: z.ZodOptional<z.ZodString>;
    defaultEggUnit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    deliveryCodeTtlMins?: number | undefined;
    retentionDays?: number | undefined;
    invoicePrefix?: string | undefined;
    defaultMilkUnit?: string | undefined;
    defaultEggUnit?: string | undefined;
}, {
    deliveryCodeTtlMins?: number | undefined;
    retentionDays?: number | undefined;
    invoicePrefix?: string | undefined;
    defaultMilkUnit?: string | undefined;
    defaultEggUnit?: string | undefined;
}>, {
    deliveryCodeTtlMins?: number | undefined;
    retentionDays?: number | undefined;
    invoicePrefix?: string | undefined;
    defaultMilkUnit?: string | undefined;
    defaultEggUnit?: string | undefined;
}, {
    deliveryCodeTtlMins?: number | undefined;
    retentionDays?: number | undefined;
    invoicePrefix?: string | undefined;
    defaultMilkUnit?: string | undefined;
    defaultEggUnit?: string | undefined;
}>;
export type UpdateFarmSettingsInput = z.infer<typeof updateFarmSettingsSchema>;
