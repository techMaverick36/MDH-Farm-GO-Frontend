import { z } from "zod";
import { CowStatus, MilkSession } from "../enums.js";
export const createCowSchema = z.object({
    tag: z.string().min(1).max(40),
    name: z.string().max(80).optional(),
    breed: z.string().max(80).optional(),
    dateOfBirth: z.string().datetime().optional(),
    status: z.nativeEnum(CowStatus).optional(),
});
export const updateCowSchema = z.object({
    tag: z.string().min(1).max(40).optional(),
    name: z.string().max(80).nullable().optional(),
    breed: z.string().max(80).nullable().optional(),
    dateOfBirth: z.string().datetime().nullable().optional(),
    status: z.nativeEnum(CowStatus).optional(),
});
export const createTankSchema = z.object({
    name: z.string().min(1).max(80),
    capacityMl: z.number().int().positive(),
    currentVolMl: z.number().int().nonnegative().optional(),
});
export const updateTankSchema = z
    .object({
    name: z.string().min(1).max(80).optional(),
    capacityMl: z.number().int().positive().optional(),
    currentVolMl: z.number().int().nonnegative().optional(),
})
    .refine((v) => Object.keys(v).length > 0, { message: "No changes provided" });
export const milkCollectionSchema = z.object({
    cowId: z.string().uuid().optional(), // omit for tank-level bulk collection
    quantityMl: z.number().int().positive(),
    session: z.nativeEnum(MilkSession),
    collectedAt: z.string().datetime(),
    clientUuid: z.string().uuid(),
});
//# sourceMappingURL=dairy.js.map