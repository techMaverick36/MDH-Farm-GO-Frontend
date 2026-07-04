import { z } from "zod";
// Offline queue flush. The mobile app batches operations recorded without
// connectivity and posts them in one round trip. Each op is idempotent on its
// own clientUuid; the server processes them independently and reports per-op.
export const SyncOp = {
    MILK_COLLECT: "milk.collect",
    DELIVERY_CREATE: "delivery.create",
    DELIVERY_CONFIRM: "delivery.confirm",
    PAYMENT_RECORD: "payment.record",
};
export const syncBatchSchema = z.object({
    operations: z
        .array(z.object({
        op: z.nativeEnum(SyncOp),
        clientUuid: z.string().uuid(),
        // The op-specific body. Validated against the matching schema when the
        // operation is dispatched, so unknown shapes fail that op only.
        payload: z.record(z.unknown()),
    }))
        .min(1)
        .max(200),
});
export const SyncStatus = {
    APPLIED: "applied", // newly created
    DUPLICATE: "duplicate", // clientUuid already seen — returned as-is
    ERROR: "error",
};
//# sourceMappingURL=sync.js.map