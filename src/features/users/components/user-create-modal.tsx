"use client";

import React, { useState } from "react";
import { Modal } from "@/shared";
import { createUserAction } from "../actions";
import type { RoleWithDetails } from "@/features/roles/repository";
import { Loader2 } from "lucide-react";

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: RoleWithDetails[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function UserCreateModal({
  isOpen,
  onClose,
  roles,
  onSuccess,
  onError,
}: UserCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await createUserAction(null, formData);

    setIsSubmitting(false);
    if (!res.success) {
      onError(res.error || "Gagal membuat pengguna baru");
      return;
    }

    onSuccess("Pengguna baru berhasil dibuat!");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Pengguna Baru"
      description="Lengkapi informasi di bawah untuk mendaftarkan akun baru ke sistem."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Contoh: Ahmad Hidayat"
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
            placeholder="user@sundawa.id"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Kata Sandi Sementara
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="Minimal 8 karakter, 1 huruf kapital, 1 angka"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Sandi minimal 8 karakter dengan kombinasi huruf kapital dan angka.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Role / Peran
          </label>
          <select
            name="roleId"
            required
            defaultValue={roles[0]?.id}
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
            id="create-isActive"
            defaultChecked
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <label htmlFor="create-isActive" className="text-sm font-medium text-slate-700">
            Akun Aktif (Dapat langsung login)
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
            <span>Simpan Pengguna</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
