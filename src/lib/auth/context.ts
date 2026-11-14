import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";

/**
 * Check if the given session has the required permission
 */
export function hasPermission(
  session: SessionPayload | null | undefined,
  requiredPermission: string
): boolean {
  if (!session) return false;
  // Super Admin has unrestricted access
  if (session.roleCode === "SUPER_ADMIN") return true;
  return session.permissions.includes(requiredPermission);
}

/**
 * Require an authenticated session; redirects to /login if unauthenticated.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Require both authentication and a specific permission.
 * Redirects to /dashboard/forbidden if unauthorized.
 */
export async function requirePermission(permissionCode: string): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!hasPermission(session, permissionCode)) {
    redirect("/dashboard/forbidden");
  }
  return session;
}
