import {
  getAllRolesWithDetails,
  getRoleById,
  getAllPermissions,
  createRoleWithPermissions,
  updateRoleWithPermissions,
  deleteRoleById,
  type RoleWithDetails,
} from "./repository";
import type { CreateRoleInput, UpdateRoleInput } from "./dto";
import { logAudit } from "@/lib/audit";
import type { SessionPayload } from "@/lib/auth/session";
import type { Role, Permission } from "@/db/schema";

export async function getRoles(): Promise<RoleWithDetails[]> {
  return getAllRolesWithDetails();
}

export async function getRole(id: string): Promise<RoleWithDetails | null> {
  return getRoleById(id);
}

export async function getPermissionsList(): Promise<Permission[]> {
  return getAllPermissions();
}

export async function createRole(
  input: CreateRoleInput,
  actor: SessionPayload
): Promise<{ success: boolean; data?: Role; error?: string }> {
  try {
    const existingRoles = await getAllRolesWithDetails();
    if (existingRoles.some((r) => r.code.toUpperCase() === input.code.toUpperCase())) {
      return { success: false, error: `Role dengan kode '${input.code}' sudah ada` };
    }
    if (existingRoles.some((r) => r.name.toLowerCase() === input.name.toLowerCase())) {
      return { success: false, error: `Role dengan nama '${input.name}' sudah ada` };
    }

    const created = await createRoleWithPermissions(
      {
        name: input.name,
        code: input.code.toUpperCase(),
        description: input.description,
      },
      input.permissionIds
    );

    await logAudit({
      actorId: actor.userId,
      actorEmail: actor.email,
      action: "ROLE_CREATE",
      resource: `roles/${created.id}`,
      details: { roleCode: created.code, permissionsCount: input.permissionIds.length },
    });

    return { success: true, data: created };
  } catch (error) {
    console.error("Create role error:", error);
    return { success: false, error: "Gagal membuat role baru" };
  }
}

export async function updateRole(
  input: UpdateRoleInput,
  actor: SessionPayload
): Promise<{ success: boolean; data?: Role; error?: string }> {
  try {
    const role = await getRoleById(input.id);
    if (!role) {
      return { success: false, error: "Role tidak ditemukan" };
    }

    const updated = await updateRoleWithPermissions(
      input.id,
      {
        name: input.name,
        description: input.description,
      },
      input.permissionIds
    );

    await logAudit({
      actorId: actor.userId,
      actorEmail: actor.email,
      action: "ROLE_UPDATE",
      resource: `roles/${updated.id}`,
      details: { roleCode: updated.code, permissionsCount: input.permissionIds.length },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("Update role error:", error);
    return { success: false, error: "Gagal memperbarui data role" };
  }
}

export async function deleteRole(
  id: string,
  actor: SessionPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const role = await getRoleById(id);
    if (!role) {
      return { success: false, error: "Role tidak ditemukan" };
    }

    if (role.isSystem) {
      return { success: false, error: "Role sistem bawaan tidak dapat dihapus demi keamanan" };
    }

    if (role.userCount > 0) {
      return {
        success: false,
        error: `Role masih digunakan oleh ${role.userCount} pengguna aktif. Pindahkan pengguna ke role lain sebelum menghapus.`,
      };
    }

    await deleteRoleById(id);

    await logAudit({
      actorId: actor.userId,
      actorEmail: actor.email,
      action: "ROLE_DELETE",
      resource: `roles/${id}`,
      details: { roleCode: role.code, roleName: role.name },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete role error:", error);
    return { success: false, error: "Gagal menghapus role" };
  }
}
