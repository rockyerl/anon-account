"use client";

import React, { useState } from "react";
import { Modal } from "@/shared";
import { deleteUserAction } from "../actions";
import type { UserWithRole } from "../repository";
import { Loader2 } from "lucide-react";

interface UserDeleteModalProps {
  user: UserWithRole | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function UserDeleteModal({ user, onClose, onSuccess, onError }: UserDeleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  async function handleDelete() {
    if (!user) return;
    setIsSubmitting(true);

    const res = await deleteUserAction(user.id);
    setIsSubmitting(false);

    if (!res.success) {
      onError(res.error || "Gagal menghapus pengguna");
      return;
    }

    onSuccess(`Pengguna ${user.name} berhasil dihapus!`);
    onClose();
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Konfirmasi Hapus Pengguna"
      description="Tindakan ini permanen dan akan menghapus data pengguna dari sistem."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
          Apakah Anda yakin ingin menghapus akun <strong>{user.name}</strong> ({user.email})?
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
