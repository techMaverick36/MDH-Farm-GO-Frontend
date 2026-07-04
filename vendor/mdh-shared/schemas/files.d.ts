import { z } from "zod";
export declare const createFileSchema: z.ZodObject<{
    contentType: z.ZodString;
    sizeBytes: z.ZodNumber;
    entityType: z.ZodOptional<z.ZodString>;
    entityId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    contentType: string;
    sizeBytes: number;
    entityType?: string | undefined;
    entityId?: string | undefined;
}, {
    contentType: string;
    sizeBytes: number;
    entityType?: string | undefined;
    entityId?: string | undefined;
}>;
export type CreateFileInput = z.infer<typeof createFileSchema>;
