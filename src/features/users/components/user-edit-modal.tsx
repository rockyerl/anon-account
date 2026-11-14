"use client";

import React, { useState } from "react";
import { Modal } from "@/shared";
import { updateUserAction } from "../actions";
import type { UserWithRole } from "../repository";
import type { RoleWithDetails } from "@/features/roles/repository";
import { Loader2 } from "lucide-react";

interface UserEditModalProps {
  user: UserWithRole | null;
  onClose: () => void;
  roles: RoleWithDetails[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function UserEditModal({ user, onClose, roles, onSuccess, onError }: UserEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateUserAction(null, formData);

    setIsSubmitting(false);
    if (!res.success) {
      onError(res.error || "Gagal memperbarui data pengguna");
      return;
    }

    onSuccess("Data pengguna berhasil diperbarui!");
    onClose();
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Ubah Pengguna: ${user.name}`}
      description="Perbarui informasi profil, role, atau ubah kata sandi."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="id" value={user.id} />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={user.name}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Alamat Email
          </label>
          <input
            type="email"
            name="email"
            required
            defaultValue={user.email}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Kata Sandi Baru (Opsional)
          </label>
          <input
            type="password"
            name="password"
            placeholder="Kosongkan bila tidak ingin mengubah kata sandi"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Role / Peran
          </label>
          <select
            name="roleId"
            required
            defaultValue={user.roleId}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            id="edit-isActive"
            defaultChecked={user.isActive}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <label htmlFor="edit-isActive" className="text-sm font-medium text-slate-700">
            Akun Aktif
          </label>
        </div>

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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Perbarui Data</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
