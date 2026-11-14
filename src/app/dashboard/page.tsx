import React from "react";
import { requireAuth, hasPermission } from "@/lib/auth/context";
import { getUsers } from "@/features/users";
import { getRoles } from "@/features/roles";
import { DashboardOverview } from "@/features/dashboard";

export default async function DashboardPage() {
  const session = await requireAuth();

  const allUsers = await getUsers();
  const allRoles = await getRoles();

  const canManageUsers = hasPermission(session, "users.read");
  const canManageRoles = hasPermission(session, "roles.read");

  return (
    <DashboardOverview
      session={session}
      allUsers={allUsers}
      allRoles={allRoles}
      canManageUsers={canManageUsers}
      canManageRoles={canManageRoles}
    />
  );
}
