import { z } from "zod";
export declare const createStockItemSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodString;
    unit: z.ZodString;
    moduleKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    category: string;
    unit: string;
    moduleKey: string;
}, {
    name: string;
    category: string;
    unit: string;
    moduleKey: string;
}>;
export type CreateStockItemInput = z.infer<typeof createStockItemSchema>;
export declare const stockAdjustmentSchema: z.ZodObject<{
    stockItemId: z.ZodString;
    direction: z.ZodNativeEnum<{
        readonly IN: "IN";
        readonly OUT: "OUT";
    }>;
    quantity: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
    occurredAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    stockItemId: string;
    quantity: number;
    direction: "IN" | "OUT";
    reason?: string | undefined;
    occurredAt?: string | undefined;
}, {
    stockItemId: string;
    quantity: number;
    direction: "IN" | "OUT";
    reason?: string | undefined;
    occurredAt?: string | undefined;
}>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
