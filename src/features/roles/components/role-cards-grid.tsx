"use client";

import React from "react";
import { Badge } from "@/shared";
import type { RoleWithDetails } from "../repository";
import { Shield, Users, Edit3, Trash2 } from "lucide-react";

interface RoleCardsGridProps {
  roles: RoleWithDetails[];
  canManage: boolean;
  onEdit: (role: RoleWithDetails) => void;
  onDelete: (role: RoleWithDetails) => void;
}

export function RoleCardsGrid({ roles, canManage, onEdit, onDelete }: RoleCardsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => {
        const isSuperAdmin = role.code === "SUPER_ADMIN";

        return (
          <div
            key={role.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isSuperAdmin
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{role.name}</h3>
                    <p className="text-xs font-mono font-medium text-slate-400">{role.code}</p>
                  </div>
                </div>

                {role.isSystem && (
                  <Badge variant="purple" className="text-[10px]">
                    Sistem
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                {role.description || "Tidak ada deskripsi tambahan."}
              </p>

              {/* Assigned Permissions Preview */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Hak Akses Menu & Aksi ({isSuperAdmin ? "Semua" : role.permissions.length})
                </span>

                <div className="flex flex-wrap gap-1">
                  {isSuperAdmin ? (
                    <Badge variant="success" className="text-[11px]">
                      Akses Penuh Seluruh Modul
                    </Badge>
                  ) : role.permissions.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      Belum ada izin menu yang diberikan
                    </span>
                  ) : (
                    role.permissions.map((p) => (
                      <Badge key={p.id} variant="default" className="text-[11px]">
                        {p.name}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{role.userCount} Pengguna</span>
              </div>

              {canManage && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(role)}
                    className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 transition-colors"
                    title="Ubah Role & Permissions"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {!role.isSystem && (
                    <button
                      type="button"
                      onClick={() => onDelete(role)}
                      disabled={role.userCount > 0}
                      className={`p-1 rounded-md transition-colors ${
                        role.userCount > 0
                          ? "text-slate-300 cursor-not-allowed"
                          : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      }`}
                      title={
                        role.userCount > 0 ? "Role masih memiliki pengguna aktif" : "Hapus Role"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
