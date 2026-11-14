import React from "react";
import { Badge } from "@/shared";
import type { AuditLog } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { FileBarChart, Activity, Clock } from "lucide-react";

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export function AuditLogsView({ logs }: AuditLogsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileBarChart className="w-5 h-5 text-indigo-600" />
          Laporan & Jejak Audit Sistem
        </h2>
        <p className="text-sm text-slate-500">
          Merekam seluruh aktivitas penting, mutasi pengguna, dan riwayat otentikasi (BE-12 &
          SEC-21).
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            20 Catatan Audit Terakhir
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Realtime
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Waktu</th>
                <th className="px-6 py-3.5">Aktor</th>
                <th className="px-6 py-3.5">Aksi</th>
                <th className="px-6 py-3.5">Resource</th>
                <th className="px-6 py-3.5">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Belum ada rekaman audit log.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 text-xs">
                    <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {log.actorEmail || "Sistem"}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant={log.action.includes("DELETE") ? "danger" : "default"}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{log.resource}</td>
                    <td className="px-6 py-3.5 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                      {log.details || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
