import { describe, it, expect } from "vitest";
import { hasPermission } from "@/lib/auth/context";
import type { SessionPayload } from "@/lib/auth/session";

describe("Role-Based Access Control (RBAC) & Dynamic Permissions (BE-03, SEC-07)", () => {
  const superAdminSession: SessionPayload = {
    userId: "sa-1",
    name: "Super Admin",
    email: "superadmin@sundawa.id",
    roleId: "role-superadmin",
    roleCode: "SUPER_ADMIN",
    roleName: "Super Administrator",
    permissions: [], // Empty array, but SUPER_ADMIN bypasses
  };

  const adminSession: SessionPayload = {
    userId: "admin-1",
    name: "Admin",
    email: "admin@sundawa.id",
    roleId: "role-admin",
    roleCode: "ADMIN",
    roleName: "Administrator",
    permissions: ["dashboard.view", "users.read", "users.create", "users.edit"],
  };

  const staffSession: SessionPayload = {
    userId: "staff-1",
    name: "Staff",
    email: "staff@sundawa.id",
    roleId: "role-staff",
    roleCode: "STAFF",
    roleName: "Staff Operasional",
    permissions: ["dashboard.view", "reports.view"],
  };

  it("Super Admin should always have access to any permission", () => {
    expect(hasPermission(superAdminSession, "dashboard.view")).toBe(true);
    expect(hasPermission(superAdminSession, "users.delete")).toBe(true);
    expect(hasPermission(superAdminSession, "roles.manage")).toBe(true);
    expect(hasPermission(superAdminSession, "any.unlisted.permission")).toBe(true);
  });

  it("Admin should have assigned permissions and be denied for unassigned permissions", () => {
    expect(hasPermission(adminSession, "dashboard.view")).toBe(true);
    expect(hasPermission(adminSession, "users.read")).toBe(true);
    expect(hasPermission(adminSession, "users.create")).toBe(true);
    // Admin was not given users.delete or roles.manage
    expect(hasPermission(adminSession, "users.delete")).toBe(false);
    expect(hasPermission(adminSession, "roles.manage")).toBe(false);
  });

  it("Staff should only access operational permissions (Dashboard, Reports) and be denied user/role management", () => {
    expect(hasPermission(staffSession, "dashboard.view")).toBe(true);
    expect(hasPermission(staffSession, "reports.view")).toBe(true);
    expect(hasPermission(staffSession, "users.read")).toBe(false);
    expect(hasPermission(staffSession, "roles.read")).toBe(false);
  });

  it("should return false if session is null or undefined", () => {
    expect(hasPermission(null, "dashboard.view")).toBe(false);
    expect(hasPermission(undefined, "dashboard.view")).toBe(false);
  });
});
