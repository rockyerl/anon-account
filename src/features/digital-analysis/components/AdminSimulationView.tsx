"use client";

import React, { useState } from "react";
import { useDigitalAnalysis } from "../context";
import {
  Database,
  History,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export function AdminSimulationView({
  defaultTab = "sources",
}: {
  defaultTab?: "sources" | "audit";
}) {
  const { actions, demoActionsConfig } = useDigitalAnalysis();
  const [tab, setTab] = useState<"sources" | "audit">(defaultTab);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    batchId: string;
    message?: string;
    error?: string;
    addedCount?: number;
    duplicateCount?: number;
  } | null>(null);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const sources = actions.getSources();
  const auditLogs = actions.getAuditLogs();

  const formatWib = (iso: string) => {
    try {
      const d = new Date(iso);
      return (
        d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " " +
        d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
        " WIB"
      );
    } catch {
      return iso;
    }
  };

  const handleValidImport = () => {
    const res = actions.simulateImport(demoActionsConfig.validImport);
    setImportResult(res);
  };

  const handleInvalidImport = () => {
    const res = actions.simulateImport(demoActionsConfig.invalidImport);
    setImportResult(res);
  };

  const handleReset = () => {
    actions.resetDemo();
    setConfirmResetOpen(false);
    setImportResult({
      success: true,
      batchId: "RESET",
      message: "Fixture demo berhasil dipulihkan ke kondisi seed awal (3 kasus, 0 ditutup).",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#151E36] text-white p-6 rounded-2xl shadow-md border border-[#2A3756]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-2 border border-rose-500/30">
              <Database className="w-3.5 h-3.5" />
              <span>Area Pengelolaan Administrator Demo</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Metadata Sumber Data, Impor & Jejak Audit
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Simulasi aliran data masuk, uji ketahanan batch impor duplikat/invalid, dan reset
              fixture prototipe.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Fixture Demo</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 text-xs">
          <button
            onClick={() => setTab("sources")}
            className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
              tab === "sources"
                ? "bg-[#F0BC79] text-[#151E36]"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Kesehatan Sumber & Simulasi Impor</span>
          </button>
          <button
            onClick={() => setTab("audit")}
            className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
              tab === "audit"
                ? "bg-[#F0BC79] text-[#151E36]"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Jejak Audit Mutasi ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content: Sources & Import */}
      {tab === "sources" && (
        <div className="space-y-6">
          {/* Sources Health Cards */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Status & Kesegaran Sumber Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sources.map((src) => {
                const isConnected = !!src.lastSuccessAt;
                return (
                  <div
                    key={src.id}
                    className="bg-[#111A2E] p-5 rounded-2xl border border-[#1E2E4A] shadow-xs flex flex-col justify-between text-slate-100"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
                        <span className="font-mono font-bold text-xs text-white">{src.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isConnected
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {isConnected ? "✓ Aktif / Segar" : "Belum Terhubung"}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white mt-2">{src.label}</h4>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Tipe Jalur: <span className="font-mono">{src.kind}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1E2E4A] text-[11px] text-slate-400">
                      <div>Terakhir Sukses:</div>
                      <div className="font-semibold text-slate-200 mt-0.5">
                        {src.lastSuccessAt ? formatWib(src.lastSuccessAt) : "Belum ada transaksi"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Import Simulation Controls */}
          <div className="bg-[#111A2E] rounded-2xl border border-[#1E2E4A] p-6 shadow-xs space-y-4 text-slate-100">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Simulasi Aliran Impor Bukti Tambahan
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Jalankan skenario uji impor dokumen internal atau postingan publik untuk membuktikan
              validasi integritas data, pencegahan duplikasi idempoten, dan penolakan batch yang
              tidak valid.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#0D1527] border border-[#1E2E4A] rounded-xl space-y-3">
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Uji Impor Batch Valid (B-201)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Menambahkan dokumen edaran jadwal tambahan (
                  <code className="font-mono text-[#F0BC79] font-bold">EV-06</code>) ke kasus
                  KAS-101. Jika diimpor ulang, sistem akan mendeteksi duplikasi secara idempoten
                  tanpa menambah bukti baru.
                </p>
                <button
                  onClick={handleValidImport}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Jalankan Impor Valid (B-201)
                </button>
              </div>

              <div className="p-4 bg-[#0D1527] border border-[#1E2E4A] rounded-xl space-y-3">
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Uji Impor Batch Invalid (B-202)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mensimulasikan data corrupt dengan rujukan kasus yang tidak terdaftar (
                  <code className="font-mono text-[#F0BC79] font-bold">KAS-999</code>). Sistem wajib
                  menolak batch, tidak memasukkan bukti liar, dan mencatat kegagalan pada jejak
                  audit.
                </p>
                <button
                  onClick={handleInvalidImport}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Jalankan Impor Invalid (B-202)
                </button>
              </div>
            </div>

            {/* Import Feedback Result Banner */}
            {importResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-3 mt-4 ${
                  importResult.success
                    ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
                    : "bg-red-950/40 border-red-800/50 text-red-300"
                }`}
              >
                {importResult.success ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
                )}
                <div>
                  <div className="font-bold">
                    Hasil Eksekusi Batch {importResult.batchId}:{" "}
                    {importResult.success ? "BERHASIL" : "DITOLAK"}
                  </div>
                  <div className="mt-1 text-slate-300">
                    {importResult.message || importResult.error}
                  </div>
                  {importResult.addedCount !== undefined && (
                    <div className="mt-1 text-[11px] font-mono text-slate-400">
                      Item Ditambahkan: {importResult.addedCount} · Duplikat Dilewati:{" "}
                      {importResult.duplicateCount}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Audit Trail */}
      {tab === "audit" && (
        <div className="bg-[#111A2E] rounded-2xl border border-[#1E2E4A] shadow-xs overflow-hidden text-slate-100">
          <div className="p-4 bg-[#0D1527] border-b border-[#1E2E4A] flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Catatan Mutasi & Integritas Transaksi Lokal
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Total Entri: {auditLogs.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D1527] text-slate-300 font-semibold border-b border-[#1E2E4A]">
                <tr>
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Pelaku / Peran</th>
                  <th className="py-3 px-4">Entitas</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Perubahan Status</th>
                  <th className="py-3 px-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2E4A]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0D1527]/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatWib(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-white">{log.actorId}</span>
                      <span className="text-[10px] text-slate-400 block">({log.actorRole})</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {log.entityType}: {log.entityId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {log.previousState && log.newState ? (
                        <span>
                          <span className="line-through text-slate-500">{log.previousState}</span>{" "}
                          &rarr; <strong className="text-emerald-400">{log.newState}</strong>
                        </span>
                      ) : (
                        <span>{log.newState || "-"}</span>
                      )}
                    </td>
                    <td
                      className="py-3 px-4 text-slate-300 max-w-xs truncate"
                      title={log.details || ""}
                    >
                      {log.details || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Reset Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#151E36] text-white border border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Konfirmasi Reset Fixture Demo
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Anda akan memulihkan data platform ke kondisi seed awal. Semua kasus baru atau mutasi
              pada KAS-101 akan direset, dan waktu demo akan dikembalikan ke pukul 09.00 WIB.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg"
              >
                Ya, Pulihkan Seed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
