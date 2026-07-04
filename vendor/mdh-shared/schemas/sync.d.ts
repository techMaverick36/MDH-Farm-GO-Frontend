import { z } from "zod";
export declare const SyncOp: {
    readonly MILK_COLLECT: "milk.collect";
    readonly DELIVERY_CREATE: "delivery.create";
    readonly DELIVERY_CONFIRM: "delivery.confirm";
    readonly PAYMENT_RECORD: "payment.record";
};
export type SyncOp = (typeof SyncOp)[keyof typeof SyncOp];
export declare const syncBatchSchema: z.ZodObject<{
    operations: z.ZodArray<z.ZodObject<{
        op: z.ZodNativeEnum<{
            readonly MILK_COLLECT: "milk.collect";
            readonly DELIVERY_CREATE: "delivery.create";
            readonly DELIVERY_CONFIRM: "delivery.confirm";
            readonly PAYMENT_RECORD: "payment.record";
        }>;
        clientUuid: z.ZodString;
        payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        clientUuid: string;
        op: "milk.collect" | "delivery.create" | "delivery.confirm" | "payment.record";
        payload: Record<string, unknown>;
    }, {
        clientUuid: string;
        op: "milk.collect" | "delivery.create" | "delivery.confirm" | "payment.record";
        payload: Record<string, unknown>;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    operations: {
        clientUuid: string;
        op: "milk.collect" | "delivery.create" | "delivery.confirm" | "payment.record";
        payload: Record<string, unknown>;
    }[];
}, {
    operations: {
        clientUuid: string;
        op: "milk.collect" | "delivery.create" | "delivery.confirm" | "payment.record";
        payload: Record<string, unknown>;
    }[];
}>;
export type SyncBatchInput = z.infer<typeof syncBatchSchema>;
export declare const SyncStatus: {
    readonly APPLIED: "applied";
    readonly DUPLICATE: "duplicate";
    readonly ERROR: "error";
};
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus];
export interface SyncResult {
    clientUuid: string;
    op: SyncOp;
    status: SyncStatus;
    resourceId?: string;
    code?: string;
    error?: string;
}
