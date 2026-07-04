import { z } from "zod";
// Validation schemas used by BOTH the API (at the boundary) and the clients
// (before submit), so messages line up.
export const registerSchema = z.object({
    farmName: z.string().min(2).max(120),
    country: z.string().min(2).max(80),
    currency: z.string().length(3), // ISO 4217
    managerName: z.string().min(2).max(120),
    email: z.string().email().optional(),
    phone: z.string().min(6).max(32).optional(),
    password: z.string().min(8).max(200),
    referralCode: z.string().min(4).max(32).optional(),
}).refine((v) => v.email || v.phone, {
    message: "Provide an email or a phone number",
    path: ["email"],
});
export const loginSchema = z.object({
    identifier: z.string().min(3), // email or phone
    password: z.string().min(1),
});
export const refreshSchema = z.object({
    refreshToken: z.string().min(10),
});
// Any authenticated user changes their own password (also clears the
// must-reset-on-first-login flag).
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(200),
});
// A user edits their own profile contact details.
export const updateProfileSchema = z
    .object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().min(6).max(32).nullable().optional(),
})
    .refine((v) => Object.keys(v).length > 0, { message: "No changes provided" });
//# sourceMappingURL=auth.js.map