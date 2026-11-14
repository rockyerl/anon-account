import {
  getUsersList,
  getUserById,
  getUserByEmail,
  insertUser,
  updateUserRecord,
  deleteUserRecord,
  countSuperAdmins,
  type UserWithRole,
} from "./repository";
import type { CreateUserInput, UpdateUserInput } from "./dto";
import { hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit";
import type { SessionPayload } from "@/lib/auth/session";
import type { User } from "@/db/schema";
import { getRoleById } from "@/features/roles/repository";

export async function getUsers(options?: {
  search?: string;
  roleId?: string;
}): Promise<UserWithRole[]> {
  return getUsersList(options);
}

export async function getUser(id: string): Promise<UserWithRole | null> {
  return getUserById(id);
}

export async function createUser(
  input: CreateUserInput,
  actor: SessionPayload
): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    // 1. Check duplicate email
    const existing = await getUserByEmail(input.email);
    if (existing) {
      return { success: false, error: `Email '${input.email}' sudah terdaftar` };
    }

    // 2. Validate role
    const role = await getRoleById(input.roleId);
    if (!role) {
      return { success: false, error: "Role yang dipilih tidak valid" };
    }

    // 3. Hash password
    const passwordHash = await hashPassword(input.password);

    // 4. Insert user
    const created = await insertUser({
      name: input.name,
      email: input.email,
      passwordHash,
      roleId: input.roleId,
      isActive: input.isActive,
    });

    // 5. Audit log
    await logAudit({
      actorId: actor.userId,
      actorEmail: actor.email,
      action: "USER_CREATE",
      resource: `users/${created.id}`,
      details: { email: created.email, roleCode: role.code },
    });

    return { success: true, data: created };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Gagal membuat pengguna baru" };
  }
}

export async function updateUser(
  input: UpdateUserInput,
  actor: SessionPayload
): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    const user = await getUserById(input.id);
    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    // Check duplicate email if email was changed
    if (user.email.toLowerCase() !== input.email.toLowerCase()) {
      const existing = await getUserByEmail(input.email);
      if (existing && existing.id !== input.id) {
        return {
          success: false,
          error: `Email '${input.email}' sudah digunakan oleh pengguna lain`,
        };
      }
    }

    // If target user is a Super Admin and role is being changed or deactivated, ensure at least one other Super Admin exists
    if (user.role.code === "SUPER_ADMIN" && (!input.isActive || input.roleId !== user.roleId)) {
      const activeSuperAdmins = await countSuperAdmins();
      if (activeSuperAdmins <= 1) {
        return {
          success: false,
          error: "Operasi ditolak: Sistem harus memiliki minimal satu Super Admin aktif",
        };
      }
    }

    let passwordHash: string | undefined;
    if (input.password && input.password.trim() !== "") {
      passwordHash = await hashPassword(input.password);
    }

    const updated = await updateUserRecord(input.id, {
      name: input.name,
      email: input.email,
      roleId: input.roleId,
      isActive: input.isActive,
      passwordHash,
    });

    await logAudit({
      actorId: actor.userId,
      actorEmail: actor.email,
      action: "USER_UPDATE",
      resource: `users/${updated.id}`,
      details: { email: updated.email, isActive: input.isActive },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: "Gagal memperbarui data pengguna" };
  }
}

export async function deleteUser(
  id: string,
  actor: SessionPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    if (id === actor.userId) {
      return {
        success: false,
        error: "Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk",
      };
    }

    const user = await getUserById(id);
    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    if (user.role.code === "SUPER_ADMIN") {
      const activeSuperAdmins = await countSuperAdmins();
      if (activeSuperAdmins <= 1) {
        return {
          success: false,
          error: "Tidak dapat menghapus satu-satunya Super Admin aktif di sistem",
        };
      }
    }

    await deleteUserRecord(id);

    await logAudit({
      actorId: actor.userId,
      actorEmail: actor.email,
      action: "USER_DELETE",
      resource: `users/${id}`,
      details: { email: user.email, name: user.name },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Gagal menghapus akun pengguna" };
  }
}
