"use client";

import React from "react";
import type { Permission } from "@/db/schema";
import { Layers } from "lucide-react";

interface RolePermissionMatrixProps {
  allPermissions: Permission[];
  selectedPermIds: string[];
  onTogglePermission: (id: string) => void;
  onSelectAllInGroup: (perms: Permission[]) => void;
}

export function RolePermissionMatrix({
  allPermissions,
  selectedPermIds,
  onTogglePermission,
  onSelectAllInGroup,
}: RolePermissionMatrixProps) {
  // Group permissions by group
  const groupedPermissions = allPermissions.reduce(
    (acc, perm) => {
      if (!acc[perm.group]) acc[perm.group] = [];
      acc[perm.group].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Matriks Hak Akses & Menu Sidebar Dinamis
        </label>
        <span className="text-xs text-purple-600 font-medium">
          {selectedPermIds.length} izin terpilih
        </span>
      </div>

      <div className="space-y-4 max-h-72 overflow-y-auto pr-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
        {Object.entries(groupedPermissions).map(([groupName, perms]) => (
          <div key={groupName} className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                {groupName}
              </span>
              <button
                type="button"
                onClick={() => onSelectAllInGroup(perms)}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Pilih Semua
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {perms.map((p) => {
                const isChecked = selectedPermIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors border text-xs ${
                      isChecked
                        ? "bg-purple-50/50 border-purple-200 text-purple-900"
                        : "border-transparent hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onTogglePermission(p.id)}
                      className="w-4 h-4 mt-0.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{p.code}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
