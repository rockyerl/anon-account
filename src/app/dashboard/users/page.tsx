import React from "react";
import { requirePermission, hasPermission } from "@/lib/auth/context";
import { getUsers, UserManagementView } from "@/features/users";
import { getRoles } from "@/features/roles";

export default async function UsersPage() {
  // Enforce server-side authorization: user MUST have "users.read" permission
  const session = await requirePermission("users.read");

  const usersList = await getUsers();
  const rolesList = await getRoles();

  const canCreate = hasPermission(session, "users.create");
  const canEdit = hasPermission(session, "users.edit");
  const canDelete = hasPermission(session, "users.delete");

  return (
    <UserManagementView
      initialUsers={usersList}
      roles={rolesList}
      currentUser={session}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  );
}
