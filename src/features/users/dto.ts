import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().email("Format email tidak valid").toLowerCase(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus memiliki minimal 1 huruf besar")
    .regex(/[0-9]/, "Password harus memiliki minimal 1 angka"),
  roleId: z.string().min(1, "Role wajib dipilih"),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  id: z.string().min(1, "ID pengguna wajib diisi"),
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().email("Format email tidak valid").toLowerCase(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus memiliki minimal 1 huruf besar")
    .regex(/[0-9]/, "Password harus memiliki minimal 1 angka")
    .optional()
    .or(z.literal("")),
  roleId: z.string().min(1, "Role wajib dipilih"),
  isActive: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
