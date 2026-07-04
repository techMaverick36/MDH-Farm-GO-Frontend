import { z } from "zod";
export declare const createCustomerSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    zone: z.ZodOptional<z.ZodString>;
    openingBalMinor: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone?: string | undefined;
    zone?: string | undefined;
    openingBalMinor?: number | undefined;
}, {
    name: string;
    phone?: string | undefined;
    zone?: string | undefined;
    openingBalMinor?: number | undefined;
}>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export declare const createCustomerAccountSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}>, {
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}>;
export type CreateCustomerAccountInput = z.infer<typeof createCustomerAccountSchema>;
export declare const updateCustomerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    zone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    openingBalMinor: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    phone?: string | null | undefined;
    name?: string | undefined;
    zone?: string | null | undefined;
    openingBalMinor?: number | undefined;
}, {
    phone?: string | null | undefined;
    name?: string | undefined;
    zone?: string | null | undefined;
    openingBalMinor?: number | undefined;
}>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export declare const createDeliverySchema: z.ZodObject<{
    customerId: z.ZodString;
    assignedTo: z.ZodOptional<z.ZodString>;
    scheduledAt: z.ZodOptional<z.ZodString>;
    lines: z.ZodArray<z.ZodObject<{
        stockItemId: z.ZodString;
        quantitySent: z.ZodNumber;
        unitPriceMinor: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        stockItemId: string;
        quantitySent: number;
        unitPriceMinor?: number | undefined;
    }, {
        stockItemId: string;
        quantitySent: number;
        unitPriceMinor?: number | undefined;
    }>, "many">;
    clientUuid: z.ZodString;
    sendCodeSms: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    clientUuid: string;
    customerId: string;
    lines: {
        stockItemId: string;
        quantitySent: number;
        unitPriceMinor?: number | undefined;
    }[];
    assignedTo?: string | undefined;
    scheduledAt?: string | undefined;
    sendCodeSms?: boolean | undefined;
}, {
    clientUuid: string;
    customerId: string;
    lines: {
        stockItemId: string;
        quantitySent: number;
        unitPriceMinor?: number | undefined;
    }[];
    assignedTo?: string | undefined;
    scheduledAt?: string | undefined;
    sendCodeSms?: boolean | undefined;
}>;
export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
export declare const updateDeliverySchema: z.ZodObject<{
    assignedTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    scheduledAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lines: z.ZodOptional<z.ZodArray<z.ZodObject<{
        stockItemId: z.ZodString;
        quantitySent: z.ZodNumber;
        unitPriceMinor: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        stockItemId: string;
        quantitySent: number;
        unitPriceMinor?: number | undefined;
    }, {
        stockItemId: string;
        quantitySent: number;
        unitPriceMinor?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    assignedTo?: string | null | undefined;
    scheduledAt?: string | null | undefined;
    lines?: {
        stockItemId: string;
        quantitySent: number;
        unitPriceMinor?: number | undefined;
    }[] | undefined;
}, {
    assignedTo?: string | null | undefined;
    scheduledAt?: string | null | undefined;
    lines?: {
        stockItemId: string;
        quantitySent: number;
        unitPriceMinor?: number | undefined;
    }[] | undefined;
}>;
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>;
export declare const confirmDeliverySchema: z.ZodObject<{
    code: z.ZodString;
    lines: z.ZodOptional<z.ZodArray<z.ZodObject<{
        lineId: z.ZodString;
        quantityReceived: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lineId: string;
        quantityReceived: number;
    }, {
        lineId: string;
        quantityReceived: number;
    }>, "many">>;
    photoFileId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    clientUuid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    clientUuid: string;
    lines?: {
        lineId: string;
        quantityReceived: number;
    }[] | undefined;
    photoFileId?: string | undefined;
    notes?: string | undefined;
}, {
    code: string;
    clientUuid: string;
    lines?: {
        lineId: string;
        quantityReceived: number;
    }[] | undefined;
    photoFileId?: string | undefined;
    notes?: string | undefined;
}>;
export type ConfirmDeliveryInput = z.infer<typeof confirmDeliverySchema>;
export declare const resolveDeliverySchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export type ResolveDeliveryInput = z.infer<typeof resolveDeliverySchema>;
