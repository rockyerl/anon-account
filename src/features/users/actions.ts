"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/context";
import { createUserSchema, updateUserSchema } from "./dto";
import { createUser, updateUser, deleteUser } from "./service";

export interface UserActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createUserAction(
  _prevState: UserActionResult | null,
  formData: FormData
): Promise<UserActionResult> {
  const session = await requirePermission("users.create");

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    roleId: formData.get("roleId"),
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
  };

  const validation = createUserSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      fieldErrors[field] = issue.message;
    }
    return { success: false, error: "Data input tidak valid", fieldErrors };
  }

  const result = await createUser(validation.data, session);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function updateUserAction(
  _prevState: UserActionResult | null,
  formData: FormData
): Promise<UserActionResult> {
  const session = await requirePermission("users.edit");

  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || "",
    roleId: formData.get("roleId"),
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
  };

  const validation = updateUserSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      fieldErrors[field] = issue.message;
    }
    return { success: false, error: "Data input tidak valid", fieldErrors };
  }

  const result = await updateUser(validation.data, session);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function deleteUserAction(id: string): Promise<UserActionResult> {
  const session = await requirePermission("users.delete");
  const result = await deleteUser(id, session);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}
