import { z } from "zod";
import { FlockStatus } from "../enums.js";
// ---- Flocks ----
export const createFlockSchema = z.object({
    batch: z.string().min(1).max(40),
    birdType: z.string().min(1).max(80),
    count: z.number().int().nonnegative(),
    acquiredAt: z.string().datetime().optional(),
    status: z.nativeEnum(FlockStatus).optional(),
});
export const updateFlockSchema = z
    .object({
    batch: z.string().min(1).max(40).optional(),
    birdType: z.string().min(1).max(80).optional(),
    count: z.number().int().nonnegative().optional(),
    acquiredAt: z.string().datetime().nullable().optional(),
    status: z.nativeEnum(FlockStatus).optional(),
})
    .refine((v) => Object.keys(v).length > 0, { message: "No changes provided" });
// ---- Egg collection (IN movement) ----
export const eggCollectionSchema = z.object({
    flockId: z.string().uuid(),
    pieces: z.number().int().positive(),
    collectedAt: z.string().datetime(),
    clientUuid: z.string().uuid(),
});
// ---- Feed consumption (OUT movement from a feed stock item) ----
export const feedConsumptionSchema = z.object({
    flockId: z.string().uuid(),
    stockItemId: z.string().uuid(),
    quantityG: z.number().int().positive(),
    consumedAt: z.string().datetime(),
    clientUuid: z.string().uuid(),
});
// ---- Mortality (decrements the flock count) ----
export const mortalitySchema = z.object({
    flockId: z.string().uuid(),
    count: z.number().int().positive(),
    cause: z.string().max(200).optional(),
    recordedAt: z.string().datetime(),
    clientUuid: z.string().uuid(),
});
//# sourceMappingURL=poultry.js.map