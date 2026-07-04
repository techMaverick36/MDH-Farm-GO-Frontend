import { z } from "zod";
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    farmName: z.ZodString;
    country: z.ZodString;
    currency: z.ZodString;
    managerName: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    referralCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    farmName: string;
    country: string;
    currency: string;
    managerName: string;
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
    referralCode?: string | undefined;
}, {
    farmName: string;
    country: string;
    currency: string;
    managerName: string;
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
    referralCode?: string | undefined;
}>, {
    farmName: string;
    country: string;
    currency: string;
    managerName: string;
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
    referralCode?: string | undefined;
}, {
    farmName: string;
    country: string;
    currency: string;
    managerName: string;
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
    referralCode?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const loginSchema: z.ZodObject<{
    identifier: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    identifier: string;
}, {
    password: string;
    identifier: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const refreshSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export declare const updateProfileSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email?: string | null | undefined;
    phone?: string | null | undefined;
    name?: string | undefined;
}, {
    email?: string | null | undefined;
    phone?: string | null | undefined;
    name?: string | undefined;
}>, {
    email?: string | null | undefined;
    phone?: string | null | undefined;
    name?: string | undefined;
}, {
    email?: string | null | undefined;
    phone?: string | null | undefined;
    name?: string | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
