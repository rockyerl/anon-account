"use client";

import React, { useState } from "react";
import { Modal } from "@/shared";
import { deleteRoleAction } from "../actions";
import type { RoleWithDetails } from "../repository";
import { ShieldAlert, Loader2 } from "lucide-react";

interface RoleDeleteModalProps {
  role: RoleWithDetails | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function RoleDeleteModal({ role, onClose, onSuccess, onError }: RoleDeleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!role) return null;

  async function handleDelete() {
    if (!role) return;
    setIsSubmitting(true);

    const res = await deleteRoleAction(role.id);
    setIsSubmitting(false);

    if (!res.success) {
      onError(res.error || "Gagal menghapus role");
      return;
    }

    onSuccess(`Role ${role.name} berhasil dihapus!`);
    onClose();
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Konfirmasi Hapus Role"
      description="Pastikan tidak ada pengguna yang sedang menggunakan role ini."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800 flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            Hapus role <strong>{role.name}</strong> ({role.code})? Tindakan ini tidak dapat
            dibatalkan.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Ya, Hapus</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
