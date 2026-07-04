import { z } from "zod";
export declare const createPlanSchema: z.ZodObject<{
    name: z.ZodString;
    durationDays: z.ZodNumber;
    priceMinor: z.ZodNumber;
    currency: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currency: string;
    name: string;
    durationDays: number;
    priceMinor: number;
}, {
    currency: string;
    name: string;
    durationDays: number;
    priceMinor: number;
}>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export declare const generateTokensSchema: z.ZodObject<{
    planId: z.ZodString;
    count: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planId: string;
    count?: number | undefined;
    expiresAt?: string | undefined;
}, {
    planId: string;
    count?: number | undefined;
    expiresAt?: string | undefined;
}>;
export type GenerateTokensInput = z.infer<typeof generateTokensSchema>;
export declare const issueFarmTokenSchema: z.ZodObject<{
    planId: z.ZodString;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planId: string;
    expiresAt?: string | undefined;
}, {
    planId: string;
    expiresAt?: string | undefined;
}>;
export type IssueFarmTokenInput = z.infer<typeof issueFarmTokenSchema>;
export declare const redeemTokenSchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
export type RedeemTokenInput = z.infer<typeof redeemTokenSchema>;
export declare const enableModuleSchema: z.ZodObject<{
    farmId: z.ZodString;
    moduleKey: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    moduleKey: string;
    farmId: string;
    enabled: boolean;
}, {
    moduleKey: string;
    farmId: string;
    enabled?: boolean | undefined;
}>;
export type EnableModuleInput = z.infer<typeof enableModuleSchema>;
export declare const updateManagerSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | null | undefined;
    phone?: string | null | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
}, {
    email?: string | null | undefined;
    phone?: string | null | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
}>, {
    email?: string | null | undefined;
    phone?: string | null | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
}, {
    email?: string | null | undefined;
    phone?: string | null | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
}>;
export type UpdateManagerInput = z.infer<typeof updateManagerSchema>;
export declare const resetManagerPasswordSchema: z.ZodObject<{
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
}, {
    password: string;
}>;
export type ResetManagerPasswordInput = z.infer<typeof resetManagerPasswordSchema>;
export declare const suspendFarmSchema: z.ZodObject<{
    suspend: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    suspend: boolean;
    reason?: string | undefined;
}, {
    suspend: boolean;
    reason?: string | undefined;
}>;
export type SuspendFarmInput = z.infer<typeof suspendFarmSchema>;
