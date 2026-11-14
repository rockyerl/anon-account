import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Roles Table
// ---------------------------------------------------------------------------
export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  description: text("description"),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------------------------------------------------------------------------
// Permissions Table
// ---------------------------------------------------------------------------
export const permissions = sqliteTable("permissions", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  group: text("group").notNull(),
  description: text("description"),
});

// ---------------------------------------------------------------------------
// Role Permissions Junction Table
// ---------------------------------------------------------------------------
export const rolePermissions = sqliteTable("role_permissions", {
  id: text("id").primaryKey(),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  permissionId: text("permission_id")
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
});

// ---------------------------------------------------------------------------
// Dynamic Navigation Menus Table
// Defines the sidebar items with their required permission gates
// ---------------------------------------------------------------------------
export const navigationMenus = sqliteTable("navigation_menus", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  path: text("path").notNull(),
  icon: text("icon").notNull(),
  requiredPermission: text("required_permission").notNull(),
  category: text("category").notNull().default("General"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

// ---------------------------------------------------------------------------
// Users Table
// ---------------------------------------------------------------------------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------------------------------------------------------------------------
// Audit Logs Table (BE-12, SEC-21)
// ---------------------------------------------------------------------------
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  actorEmail: text("actor_email"),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------------------------------------------------------------------------
// Modul 3: Master Data Organisasi (Kemhan / Mabes TNI / Matra / Kotama / Satker)
// ---------------------------------------------------------------------------
export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // KEMHAN | MABES_TNI | TNI_AD | TNI_AL | TNI_AU
  level: text("level").notNull().default("KOTAMA"), // PUSAT | MATRA | KOTAMA | SATKER
  parentId: text("parent_id"),
  province: text("province").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------------------------------------------------------------------------
// Modul 4 & 9: Data Fasilitas Kesehatan (Faskes Geomedik + Koordinat GIS + Verifikasi)
// ---------------------------------------------------------------------------
export const healthFacilities = sqliteTable("health_facilities", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  category: text("category").notNull(), // RS_TINGKAT_I | RS_TINGKAT_II | RS_TINGKAT_III | RS_TINGKAT_IV | FKTP_KLINIK | LAFIOMED
  province: text("province").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  bedCapacity: integer("bed_capacity").notNull().default(0),
  operationalStatus: text("operational_status").notNull().default("OPERASIONAL"), // OPERASIONAL | SIAGA_DARURAT | RENOVASI | NON_AKTIF
  services: text("services"),
  verificationStatus: text("verification_status").notNull().default("APPROVED"), // DRAFT | SUBMITTED | NEEDS_REVISION | APPROVED | REJECTED
  verificationNote: text("verification_note"),
  verifiedBy: text("verified_by"),
  verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),
  reportingPeriod: text("reporting_period").notNull().default("2026-TW4"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------------------------------------------------------------------------
// Modul 5: Data Sumber Daya Manusia (SDM) Kesehatan (Rekap Agregat per Faskes)
// ---------------------------------------------------------------------------
export const medicalPersonnel = sqliteTable("medical_personnel", {
  id: text("id").primaryKey(),
  facilityId: text("facility_id")
    .notNull()
    .references(() => healthFacilities.id, { onDelete: "cascade" }),
  professionCategory: text("profession_category").notNull(), // DOKTER_SPESIALIS | DOKTER_UMUM | DOKTER_GIGI | PERAWAT | BIDAN | APOTEKER_FARMASI | ANALIS_LAB | PARAMEDIS_MILITER
  specialization: text("specialization").notNull(),
  militaryCount: integer("military_count").notNull().default(0),
  civilCount: integer("civil_count").notNull().default(0),
  totalAvailable: integer("total_available").notNull().default(0),
  standardRequirement: integer("standard_requirement").notNull().default(0),
  certificationNote: text("certification_note"),
  verificationStatus: text("verification_status").notNull().default("APPROVED"),
  reportingPeriod: text("reporting_period").notNull().default("2026-TW4"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------------------------------------------------------------------------
// Modul 6: Data Alat Kesehatan (Alkes)
// ---------------------------------------------------------------------------
export const medicalEquipment = sqliteTable("medical_equipment", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  facilityId: text("facility_id")
    .notNull()
    .references(() => healthFacilities.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // RADIOLOGI_IMAGING | BEDAH_ANESTESI | ICU_RESUSITASI | LABORATORIUM | EVAKUASI_LAPANGAN | HIPERBARIK_AEROMEDIS
  name: text("name").notNull(),
  totalUnits: integer("total_units").notNull().default(1),
  goodConditionUnits: integer("good_condition_units").notNull().default(1),
  minorDamageUnits: integer("minor_damage_units").notNull().default(0),
  majorDamageUnits: integer("major_damage_units").notNull().default(0),
  operationalStatus: text("operational_status").notNull().default("BERFUNGSI"), // BERFUNGSI | DALAM_PERBAIKAN | PERLU_KALIBRASI | RUSAK_BERAT
  procurementYear: integer("procurement_year").notNull().default(2023),
  nextMaintenanceDate: text("next_maintenance_date"),
  verificationStatus: text("verification_status").notNull().default("APPROVED"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------------------------------------------------------------------------
// Modul 7: Data Material Kesehatan (Matkes & Bekkes)
// ---------------------------------------------------------------------------
export const medicalMaterials = sqliteTable("medical_materials", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  facilityId: text("facility_id")
    .notNull()
    .references(() => healthFacilities.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // OBAT_ESENSIAL | TRAUMA_COMBAT_KIT | BMHP_BEDAH | VAKSIN_SERUM | REAGEN_DARAH | APD_CBRN
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  minThreshold: integer("min_threshold").notNull().default(50),
  storageLocation: text("storage_location").notNull(),
  expiryDate: text("expiry_date"),
  stockStatus: text("stock_status").notNull().default("AMAN"), // AMAN | MENIPIS | KRITIS | KEDALUWARSA
  verificationStatus: text("verification_status").notNull().default("APPROVED"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------------------------------------------------------------------------
// Drizzle Relations
// ---------------------------------------------------------------------------
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  facilities: many(healthFacilities),
}));

export const healthFacilitiesRelations = relations(healthFacilities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [healthFacilities.organizationId],
    references: [organizations.id],
  }),
  personnel: many(medicalPersonnel),
  equipment: many(medicalEquipment),
  materials: many(medicalMaterials),
}));

export const medicalPersonnelRelations = relations(medicalPersonnel, ({ one }) => ({
  facility: one(healthFacilities, {
    fields: [medicalPersonnel.facilityId],
    references: [healthFacilities.id],
  }),
}));

export const medicalEquipmentRelations = relations(medicalEquipment, ({ one }) => ({
  facility: one(healthFacilities, {
    fields: [medicalEquipment.facilityId],
    references: [healthFacilities.id],
  }),
}));

export const medicalMaterialsRelations = relations(medicalMaterials, ({ one }) => ({
  facility: one(healthFacilities, {
    fields: [medicalMaterials.facilityId],
    references: [healthFacilities.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NavigationMenu = typeof navigationMenus.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type HealthFacility = typeof healthFacilities.$inferSelect;
export type NewHealthFacility = typeof healthFacilities.$inferInsert;
export type MedicalPersonnel = typeof medicalPersonnel.$inferSelect;
export type NewMedicalPersonnel = typeof medicalPersonnel.$inferInsert;
export type MedicalEquipment = typeof medicalEquipment.$inferSelect;
export type NewMedicalEquipment = typeof medicalEquipment.$inferInsert;
export type MedicalMaterial = typeof medicalMaterials.$inferSelect;
export type NewMedicalMaterial = typeof medicalMaterials.$inferInsert;
