import { z } from "zod";
import { StockDirection } from "../enums.js";
export const createStockItemSchema = z.object({
    name: z.string().min(1).max(80),
    category: z.string().min(1).max(40),
    unit: z.string().min(1).max(10), // base unit: ml, piece, g
    moduleKey: z.string().min(1).max(40),
});
// A manual stock correction. Recorded as an ADJUSTMENT movement (the ledger is
// never edited; corrections are new rows).
export const stockAdjustmentSchema = z.object({
    stockItemId: z.string().uuid(),
    direction: z.nativeEnum(StockDirection),
    quantity: z.number().int().positive(),
    reason: z.string().max(200).optional(),
    occurredAt: z.string().datetime().optional(),
});
//# sourceMappingURL=inventory.js.map