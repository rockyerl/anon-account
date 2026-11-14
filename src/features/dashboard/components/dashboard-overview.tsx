import React from "react";
import Link from "next/link";
import { Badge } from "@/shared";
import type { SessionPayload } from "@/lib/auth/session";
import type { UserWithRole } from "@/features/users/repository";
import type { RoleWithDetails } from "@/features/roles/repository";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Sparkles,
  KeyRound,
} from "lucide-react";

interface DashboardOverviewProps {
  session: SessionPayload;
  allUsers: UserWithRole[];
  allRoles: RoleWithDetails[];
  canManageUsers: boolean;
  canManageRoles: boolean;
}

export function DashboardOverview({
  session,
  allUsers,
  allRoles,
  canManageUsers,
  canManageRoles,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Template Fullstack SUNDAWA v1.0
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Selamat Datang, {session.name}!
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Template ini sudah terstandarisasi dengan arsitektur <strong>Feature-Driven</strong>,
              autentikasi sesi aman, Drizzle ORM, dan Role-Based Access Control (RBAC) dinamis untuk
              menu sidebar dan otorisasi server-side.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-slate-400 block font-medium">Role Aktif</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-white text-base">{session.roleName}</span>
                <Badge variant="purple">{session.roleCode}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Pengguna
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{allUsers.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              {allUsers.filter((u) => u.isActive).length} pengguna aktif
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Roles */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Role
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{allRoles.length}</p>
            <p className="text-xs text-slate-500 mt-1">Dapat dikonfigurasi dinamis</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Database ORM */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              ORM & Database
            </p>
            <p className="text-lg font-bold text-slate-900 mt-1">Drizzle + LibSQL</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Assigned Permissions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Hak Akses Anda
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {session.roleCode === "SUPER_ADMIN" ? "Semua (Full)" : session.permissions.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Izin aksi & menu aktif</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-lg">Manajemen Pengguna</h3>
              </div>
              {canManageUsers ? (
                <Badge variant="success">Diizinkan</Badge>
              ) : (
                <Badge variant="danger">
                  <Lock className="w-3 h-3" /> Dibatasi
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kelola akun pengguna, penugasan role, status aktif/non-aktif, serta reset kata sandi
              dengan validasi ketat Zod dan password hash bcrypt.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            {canManageUsers ? (
              <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Buka Manajemen Pengguna <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Role Anda ({session.roleName}) tidak memiliki izin akses modul pengguna.
              </span>
            )}
          </div>
        </div>

        {/* Role & Permissions Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-slate-900 text-lg">Role & Hak Akses Dinamis</h3>
              </div>
              {canManageRoles ? (
                <Badge variant="purple">Diizinkan</Badge>
              ) : (
                <Badge variant="danger">
                  <Lock className="w-3 h-3" /> Dibatasi
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Atur hak akses secara dinamis. Mengubah izin menu pada suatu role akan secara otomatis
              menampilkan atau menyembunyikan item sidebar bagi seluruh pengguna dalam role
              tersebut.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            {canManageRoles ? (
              <Link
                href="/dashboard/roles"
                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Buka Manajemen Role & Hak Akses <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Role Anda ({session.roleName}) tidak memiliki izin akses modul role.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
