import { z } from "zod";
import { StaffType } from "../enums.js";
export const createStaffSchema = z
    .object({
    name: z.string().min(2).max(120),
    email: z.string().email().optional(),
    phone: z.string().min(6).max(32).optional(),
    password: z.string().min(8).max(200),
    staffType: z.nativeEnum(StaffType),
    zone: z.string().max(80).optional(),
})
    .refine((v) => v.email || v.phone, {
    message: "Provide an email or a phone number",
    path: ["email"],
});
export const updateStaffSchema = z
    .object({
    name: z.string().min(2).max(120).optional(),
    staffType: z.nativeEnum(StaffType).optional(),
    zone: z.string().max(80).nullable().optional(),
    isActive: z.boolean().optional(),
})
    .refine((v) => Object.keys(v).length > 0, { message: "No changes provided" });
//# sourceMappingURL=staff.js.map