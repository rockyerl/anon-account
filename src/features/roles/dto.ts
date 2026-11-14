import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().trim().min(3, "Nama role minimal 3 karakter").max(50),
  code: z
    .string()
    .trim()
    .min(3, "Kode role minimal 3 karakter")
    .max(50)
    .regex(
      /^[A-Z0-9_]+$/,
      "Kode role harus huruf kapital, angka, dan garis bawah (misal: STAFF_AUDIT)"
    ),
  description: z.string().trim().max(255).optional().default(""),
  permissionIds: z.array(z.string()).default([]),
});

export const updateRoleSchema = z.object({
  id: z.string().min(1, "ID role tidak valid"),
  name: z.string().trim().min(3, "Nama role minimal 3 karakter").max(50),
  description: z.string().trim().max(255).optional().default(""),
  permissionIds: z.array(z.string()).default([]),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
