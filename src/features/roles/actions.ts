"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/context";
import { createRoleSchema, updateRoleSchema } from "./dto";
import { createRole, updateRole, deleteRole } from "./service";

export interface RoleActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createRoleAction(
  _prevState: RoleActionResult | null,
  formData: FormData
): Promise<RoleActionResult> {
  const session = await requirePermission("roles.manage");

  const rawData = {
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description") || "",
    permissionIds: formData.getAll("permissionIds") as string[],
  };

  const validation = createRoleSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      fieldErrors[field] = issue.message;
    }
    return { success: false, error: "Data input tidak valid", fieldErrors };
  }

  const result = await createRole(validation.data, session);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/dashboard/roles");
  return { success: true };
}

export async function updateRoleAction(
  _prevState: RoleActionResult | null,
  formData: FormData
): Promise<RoleActionResult> {
  const session = await requirePermission("roles.manage");

  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") || "",
    permissionIds: formData.getAll("permissionIds") as string[],
  };

  const validation = updateRoleSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      fieldErrors[field] = issue.message;
    }
    return { success: false, error: "Data input tidak valid", fieldErrors };
  }

  const result = await updateRole(validation.data, session);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/dashboard/roles");
  return { success: true };
}

export async function deleteRoleAction(id: string): Promise<RoleActionResult> {
  const session = await requirePermission("roles.manage");
  const result = await deleteRole(id, session);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/dashboard/roles");
  return { success: true };
}
