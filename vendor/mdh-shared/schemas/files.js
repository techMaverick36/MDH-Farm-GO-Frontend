import { z } from "zod";
// Presigned-upload init: the client declares the file it wants to upload; the
// server records a FileObject and returns an upload target. The client uploads
// bytes directly to storage, then references the fileId on the owning resource.
export const createFileSchema = z.object({
    contentType: z.string().min(1).max(120),
    sizeBytes: z.number().int().positive(),
    entityType: z.string().max(40).optional(), // e.g. "Delivery"
    entityId: z.string().uuid().optional(),
});
//# sourceMappingURL=files.js.map