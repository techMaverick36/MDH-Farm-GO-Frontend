import { z } from "zod";
export declare const createStaffSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    staffType: z.ZodNativeEnum<{
        readonly MILK_COLLECTOR: "MILK_COLLECTOR";
        readonly EGG_COLLECTOR: "EGG_COLLECTOR";
        readonly DELIVERY: "DELIVERY";
        readonly INVENTORY: "INVENTORY";
        readonly GENERAL: "GENERAL";
    }>;
    zone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password: string;
    name: string;
    staffType: "MILK_COLLECTOR" | "EGG_COLLECTOR" | "DELIVERY" | "INVENTORY" | "GENERAL";
    email?: string | undefined;
    phone?: string | undefined;
    zone?: string | undefined;
}, {
    password: string;
    name: string;
    staffType: "MILK_COLLECTOR" | "EGG_COLLECTOR" | "DELIVERY" | "INVENTORY" | "GENERAL";
    email?: string | undefined;
    phone?: string | undefined;
    zone?: string | undefined;
}>, {
    password: string;
    name: string;
    staffType: "MILK_COLLECTOR" | "EGG_COLLECTOR" | "DELIVERY" | "INVENTORY" | "GENERAL";
    email?: string | undefined;
    phone?: string | undefined;
    zone?: string | undefined;
}, {
    password: string;
    name: string;
    staffType: "MILK_COLLECTOR" | "EGG_COLLECTOR" | "DELIVERY" | "INVENTORY" | "GENERAL";
    email?: string | undefined;
    phone?: string | undefined;
    zone?: string | undefined;
}>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export declare const updateStaffSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    staffType: z.ZodOptional<z.ZodNativeEnum<{
        readonly MILK_COLLECTOR: "MILK_COLLECTOR";
        readonly EGG_COLLECTOR: "EGG_COLLECTOR";
        readonly DELIVERY: "DELIVERY";
        readonly INVENTORY: "INVENTORY";
        readonly GENERAL: "GENERAL";
    }>>;
    zone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    zone?: string | null | undefined;
    staffType?: "MILK_COLLECTOR" | "EGG_COLLECTOR" | "DELIVERY" | "INVENTORY" | "GENERAL" | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    zone?: string | null | undefined;
    staffType?: "MILK_COLLECTOR" | "EGG_COLLECTOR" | "DELIVERY" | "INVENTORY" | "GENERAL" | undefined;
    isActive?: boolean | undefined;
}>, {
    name?: string | undefined;
    zone?: string | null | undefined;
    staffType?: "MILK_COLLECTOR" | "EGG_COLLECTOR" | "DELIVERY" | "INVENTORY" | "GENERAL" | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    zone?: string | null | undefined;
    staffType?: "MILK_COLLECTOR" | "EGG_COLLECTOR" | "DELIVERY" | "INVENTORY" | "GENERAL" | undefined;
    isActive?: boolean | undefined;
}>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
