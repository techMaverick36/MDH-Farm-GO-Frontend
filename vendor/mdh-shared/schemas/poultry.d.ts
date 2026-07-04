import { z } from "zod";
export declare const createFlockSchema: z.ZodObject<{
    batch: z.ZodString;
    birdType: z.ZodString;
    count: z.ZodNumber;
    acquiredAt: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly ACTIVE: "ACTIVE";
        readonly CLOSED: "CLOSED";
    }>>;
}, "strip", z.ZodTypeAny, {
    count: number;
    batch: string;
    birdType: string;
    status?: "ACTIVE" | "CLOSED" | undefined;
    acquiredAt?: string | undefined;
}, {
    count: number;
    batch: string;
    birdType: string;
    status?: "ACTIVE" | "CLOSED" | undefined;
    acquiredAt?: string | undefined;
}>;
export type CreateFlockInput = z.infer<typeof createFlockSchema>;
export declare const updateFlockSchema: z.ZodEffects<z.ZodObject<{
    batch: z.ZodOptional<z.ZodString>;
    birdType: z.ZodOptional<z.ZodString>;
    count: z.ZodOptional<z.ZodNumber>;
    acquiredAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly ACTIVE: "ACTIVE";
        readonly CLOSED: "CLOSED";
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "CLOSED" | undefined;
    count?: number | undefined;
    batch?: string | undefined;
    birdType?: string | undefined;
    acquiredAt?: string | null | undefined;
}, {
    status?: "ACTIVE" | "CLOSED" | undefined;
    count?: number | undefined;
    batch?: string | undefined;
    birdType?: string | undefined;
    acquiredAt?: string | null | undefined;
}>, {
    status?: "ACTIVE" | "CLOSED" | undefined;
    count?: number | undefined;
    batch?: string | undefined;
    birdType?: string | undefined;
    acquiredAt?: string | null | undefined;
}, {
    status?: "ACTIVE" | "CLOSED" | undefined;
    count?: number | undefined;
    batch?: string | undefined;
    birdType?: string | undefined;
    acquiredAt?: string | null | undefined;
}>;
export type UpdateFlockInput = z.infer<typeof updateFlockSchema>;
export declare const eggCollectionSchema: z.ZodObject<{
    flockId: z.ZodString;
    pieces: z.ZodNumber;
    collectedAt: z.ZodString;
    clientUuid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    collectedAt: string;
    clientUuid: string;
    flockId: string;
    pieces: number;
}, {
    collectedAt: string;
    clientUuid: string;
    flockId: string;
    pieces: number;
}>;
export type EggCollectionInput = z.infer<typeof eggCollectionSchema>;
export declare const feedConsumptionSchema: z.ZodObject<{
    flockId: z.ZodString;
    stockItemId: z.ZodString;
    quantityG: z.ZodNumber;
    consumedAt: z.ZodString;
    clientUuid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    clientUuid: string;
    stockItemId: string;
    flockId: string;
    quantityG: number;
    consumedAt: string;
}, {
    clientUuid: string;
    stockItemId: string;
    flockId: string;
    quantityG: number;
    consumedAt: string;
}>;
export type FeedConsumptionInput = z.infer<typeof feedConsumptionSchema>;
export declare const mortalitySchema: z.ZodObject<{
    flockId: z.ZodString;
    count: z.ZodNumber;
    cause: z.ZodOptional<z.ZodString>;
    recordedAt: z.ZodString;
    clientUuid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    clientUuid: string;
    count: number;
    flockId: string;
    recordedAt: string;
    cause?: string | undefined;
}, {
    clientUuid: string;
    count: number;
    flockId: string;
    recordedAt: string;
    cause?: string | undefined;
}>;
export type MortalityInput = z.infer<typeof mortalitySchema>;
