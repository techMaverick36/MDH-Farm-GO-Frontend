import { z } from "zod";
export declare const createCowSchema: z.ZodObject<{
    tag: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    breed: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly ACTIVE: "ACTIVE";
        readonly DRY: "DRY";
        readonly SOLD: "SOLD";
        readonly DECEASED: "DECEASED";
    }>>;
}, "strip", z.ZodTypeAny, {
    tag: string;
    status?: "ACTIVE" | "DRY" | "SOLD" | "DECEASED" | undefined;
    name?: string | undefined;
    breed?: string | undefined;
    dateOfBirth?: string | undefined;
}, {
    tag: string;
    status?: "ACTIVE" | "DRY" | "SOLD" | "DECEASED" | undefined;
    name?: string | undefined;
    breed?: string | undefined;
    dateOfBirth?: string | undefined;
}>;
export type CreateCowInput = z.infer<typeof createCowSchema>;
export declare const updateCowSchema: z.ZodObject<{
    tag: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    breed: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    dateOfBirth: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly ACTIVE: "ACTIVE";
        readonly DRY: "DRY";
        readonly SOLD: "SOLD";
        readonly DECEASED: "DECEASED";
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "DRY" | "SOLD" | "DECEASED" | undefined;
    name?: string | null | undefined;
    tag?: string | undefined;
    breed?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
}, {
    status?: "ACTIVE" | "DRY" | "SOLD" | "DECEASED" | undefined;
    name?: string | null | undefined;
    tag?: string | undefined;
    breed?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
}>;
export type UpdateCowInput = z.infer<typeof updateCowSchema>;
export declare const createTankSchema: z.ZodObject<{
    name: z.ZodString;
    capacityMl: z.ZodNumber;
    currentVolMl: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    capacityMl: number;
    currentVolMl?: number | undefined;
}, {
    name: string;
    capacityMl: number;
    currentVolMl?: number | undefined;
}>;
export type CreateTankInput = z.infer<typeof createTankSchema>;
export declare const updateTankSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    capacityMl: z.ZodOptional<z.ZodNumber>;
    currentVolMl: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    capacityMl?: number | undefined;
    currentVolMl?: number | undefined;
}, {
    name?: string | undefined;
    capacityMl?: number | undefined;
    currentVolMl?: number | undefined;
}>, {
    name?: string | undefined;
    capacityMl?: number | undefined;
    currentVolMl?: number | undefined;
}, {
    name?: string | undefined;
    capacityMl?: number | undefined;
    currentVolMl?: number | undefined;
}>;
export type UpdateTankInput = z.infer<typeof updateTankSchema>;
export declare const milkCollectionSchema: z.ZodObject<{
    cowId: z.ZodOptional<z.ZodString>;
    quantityMl: z.ZodNumber;
    session: z.ZodNativeEnum<{
        readonly MORNING: "MORNING";
        readonly EVENING: "EVENING";
    }>;
    collectedAt: z.ZodString;
    clientUuid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    quantityMl: number;
    session: "MORNING" | "EVENING";
    collectedAt: string;
    clientUuid: string;
    cowId?: string | undefined;
}, {
    quantityMl: number;
    session: "MORNING" | "EVENING";
    collectedAt: string;
    clientUuid: string;
    cowId?: string | undefined;
}>;
export type MilkCollectionInput = z.infer<typeof milkCollectionSchema>;
