"use client";

import React, { useState } from "react";
import { Modal } from "@/shared";
import { createRoleAction } from "../actions";
import { RolePermissionMatrix } from "./role-permission-matrix";
import type { Permission } from "@/db/schema";
import { Loader2 } from "lucide-react";

interface RoleCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPermissions: Permission[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function RoleCreateModal({
  isOpen,
  onClose,
  allPermissions,
  onSuccess,
  onError,
}: RoleCreateModalProps) {
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function togglePermission(permId: string) {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  }

  function selectAllInGroup(groupPerms: Permission[]) {
    const groupIds = groupPerms.map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedPermIds.includes(id));
    if (allSelected) {
      setSelectedPermIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedPermIds((prev) => Array.from(new Set([...prev, ...groupIds])));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.delete("permissionIds");
    for (const id of selectedPermIds) {
      formData.append("permissionIds", id);
    }

    const res = await createRoleAction(null, formData);
    setIsSubmitting(false);

    if (!res.success) {
      onError(res.error || "Gagal membuat role");
      return;
    }

    onSuccess("Role baru berhasil ditambahkan beserta hak akses sidebarnya!");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Role Baru"
      description="Definisikan nama role dan pilih izin menu sidebar serta aksi yang dapat diakses."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Role
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Contoh: Auditor Internal"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Kode Role (Huruf Kapital & Garis Bawah)
            </label>
            <input
              type="text"
              name="code"
              required
              placeholder="Contoh: AUDITOR_INTERNAL"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Deskripsi Tugas
          </label>
          <input
            type="text"
            name="description"
            placeholder="Jelaskan cakupan tanggung jawab peran ini..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
          />
        </div>

        <RolePermissionMatrix
          allPermissions={allPermissions}
          selectedPermIds={selectedPermIds}
          onTogglePermission={togglePermission}
          onSelectAllInGroup={selectAllInGroup}
        />

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Simpan Role</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
