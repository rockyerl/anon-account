import * as dotenv from "dotenv";
dotenv.config();

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL || "file:local.db";
const client = createClient({ url: dbUrl });
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Starting database seeding...");

  // 1. Permissions Definition
  const permissionsList = [
    // Dashboard
    {
      id: "perm-dash-view",
      code: "dashboard.view",
      name: "Lihat Dashboard",
      group: "Dashboard",
      description: "Akses ke halaman ringkasan dan metrik sistem",
    },
    // Users Management
    {
      id: "perm-users-read",
      code: "users.read",
      name: "Lihat Daftar Pengguna",
      group: "Manajemen Pengguna",
      description: "Akses melihat menu dan data pengguna sistem",
    },
    {
      id: "perm-users-create",
      code: "users.create",
      name: "Tambah Pengguna",
      group: "Manajemen Pengguna",
      description: "Kemampuan membuat akun pengguna baru",
    },
    {
      id: "perm-users-edit",
      code: "users.edit",
      name: "Ubah Pengguna",
      group: "Manajemen Pengguna",
      description: "Kemampuan memperbarui data dan status pengguna",
    },
    {
      id: "perm-users-delete",
      code: "users.delete",
      name: "Hapus Pengguna",
      group: "Manajemen Pengguna",
      description: "Kemampuan menghapus akun pengguna",
    },
    // Roles Management
    {
      id: "perm-roles-read",
      code: "roles.read",
      name: "Lihat Role & Hak Akses",
      group: "Manajemen Role",
      description: "Akses melihat menu dan data role/peran",
    },
    {
      id: "perm-roles-manage",
      code: "roles.manage",
      name: "Kelola Role & Permissions",
      group: "Manajemen Role",
      description: "Kemampuan membuat, mengedit izin menu, dan menghapus role",
    },
    // Reports
    {
      id: "perm-reports-view",
      code: "reports.view",
      name: "Lihat Laporan",
      group: "Laporan",
      description: "Akses ke menu laporan aktivitas dan statistik",
    },
  ];

  console.log("-> Seeding permissions...");
  for (const perm of permissionsList) {
    await db
      .insert(schema.permissions)
      .values(perm)
      .onConflictDoUpdate({
        target: schema.permissions.id,
        set: { name: perm.name, group: perm.group, description: perm.description },
      });
  }

  // 2. Navigation Menus Definition (for dynamic sidebar)
  const menusList = [
    {
      id: "menu-dashboard",
      title: "Dashboard",
      path: "/dashboard",
      icon: "LayoutDashboard",
      requiredPermission: "dashboard.view",
      category: "Utama",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "menu-reports",
      title: "Laporan & Analitik",
      path: "/dashboard/reports",
      icon: "FileBarChart",
      requiredPermission: "reports.view",
      category: "Utama",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "menu-users",
      title: "Manajemen Pengguna",
      path: "/dashboard/users",
      icon: "Users",
      requiredPermission: "users.read",
      category: "Administrasi",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: "menu-roles",
      title: "Role & Hak Akses",
      path: "/dashboard/roles",
      icon: "ShieldCheck",
      requiredPermission: "roles.read",
      category: "Administrasi",
      sortOrder: 4,
      isActive: true,
    },
  ];

  console.log("-> Seeding navigation menus...");
  for (const menu of menusList) {
    await db
      .insert(schema.navigationMenus)
      .values(menu)
      .onConflictDoUpdate({
        target: schema.navigationMenus.id,
        set: {
          title: menu.title,
          path: menu.path,
          icon: menu.icon,
          requiredPermission: menu.requiredPermission,
          category: menu.category,
          sortOrder: menu.sortOrder,
          isActive: menu.isActive,
        },
      });
  }

  // 3. Roles Definition
  const now = new Date();
  const superAdminRoleId = "role-superadmin";
  const adminRoleId = "role-admin";
  const staffRoleId = "role-staff";

  console.log("-> Seeding default roles...");
  await db
    .insert(schema.roles)
    .values([
      {
        id: superAdminRoleId,
        name: "Super Administrator",
        code: "SUPER_ADMIN",
        description: "Akses penuh ke seluruh sistem dan konfigurasi",
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: adminRoleId,
        name: "Administrator",
        code: "ADMIN",
        description: "Mengelola pengguna dan melihat peran serta laporan",
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: staffRoleId,
        name: "Staff Operasional",
        code: "STAFF",
        description: "Akses operasional terbatas (hanya Dashboard dan Laporan)",
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  // 4. Role - Permissions Assignment
  console.log("-> Assigning permissions to roles...");
  // Clear existing role permissions for clean slate
  await db.delete(schema.rolePermissions);

  // Super Admin: All permissions
  const superAdminRolePerms = permissionsList.map((p) => ({
    id: randomUUID(),
    roleId: superAdminRoleId,
    permissionId: p.id,
  }));

  // Admin: Dashboard, Reports, Users (read, create, edit), Roles (read)
  const adminAllowedPermCodes = [
    "dashboard.view",
    "reports.view",
    "users.read",
    "users.create",
    "users.edit",
    "roles.read",
  ];
  const adminRolePerms = permissionsList
    .filter((p) => adminAllowedPermCodes.includes(p.code))
    .map((p) => ({
      id: randomUUID(),
      roleId: adminRoleId,
      permissionId: p.id,
    }));

  // Staff: Only Dashboard and Reports
  const staffAllowedPermCodes = ["dashboard.view", "reports.view"];
  const staffRolePerms = permissionsList
    .filter((p) => staffAllowedPermCodes.includes(p.code))
    .map((p) => ({
      id: randomUUID(),
      roleId: staffRoleId,
      permissionId: p.id,
    }));

  await db
    .insert(schema.rolePermissions)
    .values([...superAdminRolePerms, ...adminRolePerms, ...staffRolePerms]);

  // 5. Default Users
  console.log("-> Seeding default users with secure bcrypt hash...");
  const defaultPasswordHash = bcrypt.hashSync("Password123!", 10);

  const defaultUsers = [
    {
      id: "user-superadmin",
      name: "Sundawa Super Admin",
      email: "superadmin@sundawa.id",
      passwordHash: defaultPasswordHash,
      roleId: superAdminRoleId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user-admin",
      name: "Budi Santoso (Admin)",
      email: "admin@sundawa.id",
      passwordHash: defaultPasswordHash,
      roleId: adminRoleId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user-staff",
      name: "Siti Rahma (Staff)",
      email: "staff@sundawa.id",
      passwordHash: defaultPasswordHash,
      roleId: staffRoleId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const user of defaultUsers) {
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          roleId: user.roleId,
          isActive: user.isActive,
          updatedAt: now,
        },
      });
  }

  console.log("✅ Seeding completed successfully!");
  console.log("==================================================");
  console.log("Demo Credentials:");
  console.log("1. Super Admin : superadmin@sundawa.id / Password123!");
  console.log("2. Admin       : admin@sundawa.id / Password123!");
  console.log("3. Staff       : staff@sundawa.id / Password123!");
  console.log("==================================================");
}

seed()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
