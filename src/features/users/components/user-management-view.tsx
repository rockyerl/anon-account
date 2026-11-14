"use client";

import React, { useState } from "react";
import { UserPlus, Search, Filter, AlertCircle, CheckCircle2 } from "lucide-react";
import type { UserWithRole } from "../repository";
import type { RoleWithDetails } from "@/features/roles/repository";
import type { SessionPayload } from "@/lib/auth/session";
import { UserTable } from "./user-table";
import { UserCreateModal } from "./user-create-modal";
import { UserEditModal } from "./user-edit-modal";
import { UserDeleteModal } from "./user-delete-modal";

interface UserManagementViewProps {
  initialUsers: UserWithRole[];
  roles: RoleWithDetails[];
  currentUser: SessionPayload;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function UserManagementView({
  initialUsers,
  roles,
  currentUser,
  canCreate,
  canEdit,
  canDelete,
}: UserManagementViewProps) {
  const [users, setUsers] = useState<UserWithRole[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithRole | null>(null);

  // Status & feedback state
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRoleFilter === "ALL" || u.roleId === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna</h2>
          <p className="text-sm text-slate-500">
            Kelola daftar akun pengguna, role penugasan, dan status akses sistem.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline ml-2"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
          >
            <option value="ALL">Semua Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        currentUser={currentUser}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={(user) => setEditingUser(user)}
        onDelete={(user) => setDeletingUser(user)}
      />

      {/* Modals */}
      <UserCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        roles={roles}
        onSuccess={(msg) => {
          setFeedback({ type: "success", message: msg });
          window.location.reload();
        }}
        onError={(msg) => setFeedback({ type: "error", message: msg })}
      />

      <UserEditModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        roles={roles}
        onSuccess={(msg) => {
          setFeedback({ type: "success", message: msg });
          window.location.reload();
        }}
        onError={(msg) => setFeedback({ type: "error", message: msg })}
      />

      <UserDeleteModal
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onSuccess={(msg) => {
          setFeedback({ type: "success", message: msg });
          if (deletingUser) {
            setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
          }
        }}
        onError={(msg) => setFeedback({ type: "error", message: msg })}
      />
    </div>
  );
}
