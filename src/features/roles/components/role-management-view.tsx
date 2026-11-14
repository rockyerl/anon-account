"use client";

import React, { useState } from "react";
import { ShieldPlus, CheckCircle2, AlertCircle } from "lucide-react";
import type { RoleWithDetails } from "../repository";
import type { Permission } from "@/db/schema";
import type { SessionPayload } from "@/lib/auth/session";
import { RoleCardsGrid } from "./role-cards-grid";
import { RoleCreateModal } from "./role-create-modal";
import { RoleEditModal } from "./role-edit-modal";
import { RoleDeleteModal } from "./role-delete-modal";

interface RoleManagementViewProps {
  initialRoles: RoleWithDetails[];
  allPermissions: Permission[];
  currentUser: SessionPayload;
  canManage: boolean;
}

export function RoleManagementView({
  initialRoles,
  allPermissions,
  canManage,
}: RoleManagementViewProps) {
  const [roles, setRoles] = useState<RoleWithDetails[]>(initialRoles);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithDetails | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleWithDetails | null>(null);

  // Feedback banner state
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Role & Hak Akses Dinamis
          </h2>
          <p className="text-sm text-slate-500">
            Kelola peran pengguna dan izin akses menu sidebar. Perubahan hak akses berlaku dinamis.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm shadow-purple-500/20"
          >
            <ShieldPlus className="w-4 h-4" />
            <span>Tambah Role Baru</span>
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

      {/* Role Cards Grid */}
      <RoleCardsGrid
        roles={roles}
        canManage={canManage}
        onEdit={(role) => setEditingRole(role)}
        onDelete={(role) => setDeletingRole(role)}
      />

      {/* Modals */}
      <RoleCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        allPermissions={allPermissions}
        onSuccess={(msg) => {
          setFeedback({ type: "success", message: msg });
          window.location.reload();
        }}
        onError={(msg) => setFeedback({ type: "error", message: msg })}
      />

      {editingRole && (
        <RoleEditModal
          key={editingRole.id}
          role={editingRole}
          onClose={() => setEditingRole(null)}
          allPermissions={allPermissions}
          onSuccess={(msg) => {
            setFeedback({ type: "success", message: msg });
            window.location.reload();
          }}
          onError={(msg) => setFeedback({ type: "error", message: msg })}
        />
      )}

      <RoleDeleteModal
        role={deletingRole}
        onClose={() => setDeletingRole(null)}
        onSuccess={(msg) => {
          setFeedback({ type: "success", message: msg });
          if (deletingRole) {
            setRoles((prev) => prev.filter((r) => r.id !== deletingRole.id));
          }
        }}
        onError={(msg) => setFeedback({ type: "error", message: msg })}
      />
    </div>
  );
}
