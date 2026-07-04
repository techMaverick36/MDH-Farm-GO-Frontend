import { z } from "zod";
export declare const generateInvoiceSchema: z.ZodObject<{
    customerId: z.ZodString;
    periodStart: z.ZodString;
    periodEnd: z.ZodString;
    dueAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    periodStart: string;
    periodEnd: string;
    dueAt?: string | undefined;
}, {
    customerId: string;
    periodStart: string;
    periodEnd: string;
    dueAt?: string | undefined;
}>;
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
export declare const updateInvoiceSchema: z.ZodObject<{
    dueAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lines: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        stockItemId: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        unitPriceMinor: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        unitPriceMinor: number;
        description: string;
        quantity: number;
        stockItemId?: string | undefined;
    }, {
        unitPriceMinor: number;
        description: string;
        quantity: number;
        stockItemId?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    lines?: {
        unitPriceMinor: number;
        description: string;
        quantity: number;
        stockItemId?: string | undefined;
    }[] | undefined;
    dueAt?: string | null | undefined;
}, {
    lines?: {
        unitPriceMinor: number;
        description: string;
        quantity: number;
        stockItemId?: string | undefined;
    }[] | undefined;
    dueAt?: string | null | undefined;
}>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export declare const recordPaymentSchema: z.ZodObject<{
    customerId: z.ZodString;
    invoiceId: z.ZodOptional<z.ZodString>;
    amountMinor: z.ZodNumber;
    method: z.ZodNativeEnum<{
        readonly MOBILE_MONEY: "MOBILE_MONEY";
        readonly CASH: "CASH";
        readonly BANK: "BANK";
        readonly OTHER: "OTHER";
    }>;
    reference: z.ZodOptional<z.ZodString>;
    clientUuid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    clientUuid: string;
    customerId: string;
    amountMinor: number;
    method: "MOBILE_MONEY" | "CASH" | "BANK" | "OTHER";
    invoiceId?: string | undefined;
    reference?: string | undefined;
}, {
    clientUuid: string;
    customerId: string;
    amountMinor: number;
    method: "MOBILE_MONEY" | "CASH" | "BANK" | "OTHER";
    invoiceId?: string | undefined;
    reference?: string | undefined;
}>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
