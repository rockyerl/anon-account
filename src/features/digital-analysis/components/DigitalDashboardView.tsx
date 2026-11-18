"use client";

import React from "react";
import Link from "next/link";
import { useDigitalAnalysis } from "../context";
import { TacticalIndonesianMap } from "./TacticalIndonesianMap";
import {
  Tv,
  FileSearch,
  Award,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Radio,
  TrendingUp,
} from "lucide-react";

export function DigitalDashboardView() {
  const { currentRole, currentUser, actions, demoNow } = useDigitalAnalysis();

  const metrics = actions.getAggregateMetrics();
  const caseListRes = actions.listCases();
  const cases = "cases" in caseListRes ? caseListRes.cases : [];

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
        d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
        " WIB"
      );
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Command Banner */}
      <div className="bg-[#151E36] text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#2A3756] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F0BC79]/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0BC79]/20 text-[#F0BC79] text-xs font-bold border border-[#F0BC79]/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PUSAT KOMANDO INTELIJEN DIGITAL KODIKLAT TNI</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                <span>STATUS SIAGA: WASPADA (SEDANG)</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Executive Briefing & Telemetri Analisis Kasus
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Selamat bertugas, <strong className="text-white">{currentUser.name}</strong> (
              {currentRole.toUpperCase()}).
              {currentRole === "pimpinan"
                ? " Anda melihat proyeksi eksekutif seluruh kasus, agregat wilayah nasional, dan laporan siap telaah pimpinan."
                : " Anda melihat ruang kerja kasus yang dialokasikan khusus sesuai batas wewenang komando intelijen."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/wallboard"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#F0BC79] hover:bg-[#e2aa63] text-[#151E36] font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all"
            >
              <Tv className="w-4 h-4" />
              <span>Buka Layar Wallboard 16:9</span>
            </Link>
          </div>
        </div>

        {/* Tactical Key Metrics Ribbon */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#1f2b4c]/60 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 text-[10px]">Tingkat Akurasi Bukti:</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">100% Sah</div>
          </div>
          <div className="bg-[#1f2b4c]/60 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 text-[10px]">Rata-rata Waktu Verifikasi:</div>
            <div className="text-base sm:text-lg font-black text-[#F0BC79] mt-0.5">38 Menit</div>
          </div>
          <div className="bg-[#1f2b4c]/60 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 text-[10px]">Sumber Data Terpantau:</div>
            <div className="text-base sm:text-lg font-black text-blue-400 mt-0.5">
              3 Jalur Aktif
            </div>
          </div>
          <div className="bg-[#1f2b4c]/60 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 text-[10px]">Waktu Simulasi:</div>
            <div
              className="text-base sm:text-lg font-black text-white mt-0.5 truncate"
              suppressHydrationWarning
            >
              {formatWib(demoNow)}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/kasus"
          className="bg-[#111A2E] p-5 rounded-2xl border border-[#1E2E4A] hover:border-blue-500/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Dalam Peninjauan</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          </div>
          <div
            className="text-3xl font-black text-white mt-2 group-hover:text-blue-400 transition-colors"
            suppressHydrationWarning
          >
            {currentRole === "pimpinan"
              ? metrics.inReview
              : cases.filter((c) => c.status === "in_review").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{currentRole === "pimpinan" ? "Agregat Nasional" : "Kasus Anda"}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/kasus"
          className="bg-[#111A2E] p-5 rounded-2xl border border-[#1E2E4A] hover:border-amber-500/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Menunggu Verifikasi</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div
            className="text-3xl font-black text-white mt-2 group-hover:text-amber-400 transition-colors"
            suppressHydrationWarning
          >
            {currentRole === "pimpinan"
              ? metrics.awaitingVerification
              : cases.filter((c) => c.status === "awaiting_verification").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{currentRole === "pimpinan" ? "Agregat Nasional" : "Kasus Anda"}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/kasus"
          className="bg-[#111A2E] p-5 rounded-2xl border border-[#1E2E4A] hover:border-slate-500/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Draft / Bukti Belum Cukup</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          </div>
          <div
            className="text-3xl font-black text-white mt-2 group-hover:text-slate-300 transition-colors"
            suppressHydrationWarning
          >
            {currentRole === "pimpinan"
              ? metrics.draft
              : cases.filter((c) => c.status === "draft").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{currentRole === "pimpinan" ? "Agregat Nasional" : "Kasus Anda"}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/kasus"
          className="bg-[#111A2E] p-5 rounded-2xl border border-[#1E2E4A] hover:border-emerald-500/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Laporan Disetujui / Selesai</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div
            className="text-3xl font-black text-white mt-2 group-hover:text-emerald-400 transition-colors"
            suppressHydrationWarning
          >
            {currentRole === "pimpinan"
              ? metrics.closed
              : cases.filter((c) => c.status === "closed").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Siap Rilis Pimpinan</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Indonesian Tactical Map Card */}
      <TacticalIndonesianMap regionalCounts={metrics.regionalCounts} />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Cases Table */}
        <div className="lg:col-span-2 bg-[#111A2E] rounded-2xl border border-[#1E2E4A] shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-[#1E2E4A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-[#F0BC79]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {currentRole === "pimpinan"
                  ? "Daftar Kasus Nasional (Proyeksi Pimpinan)"
                  : "Kasus yang Ditugaskan"}
              </h3>
            </div>
            <Link
              href="/kasus"
              className="text-xs font-bold text-[#F0BC79] hover:underline flex items-center gap-1"
            >
              <span>Buka Semua Kasus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D1527] text-slate-300 font-semibold border-b border-[#1E2E4A]">
                <tr>
                  <th className="py-3 px-4">ID Kasus</th>
                  <th className="py-3 px-4">Judul & Tema</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pembaruan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2E4A]">
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      Belum ada kasus yang ditugaskan atau aktif pada peran ini.
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => {
                    const isClosed = c.status === "closed";
                    return (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#F0BC79]">{c.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{c.title}</div>
                          <div className="text-[10px] text-slate-400 uppercase mt-0.5">
                            Tema: {c.category}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              c.status === "in_review"
                                ? "bg-blue-950/60 text-blue-300 border-blue-500/40"
                                : c.status === "awaiting_verification"
                                  ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                                  : c.status === "draft"
                                    ? "bg-slate-800 text-slate-300 border-slate-700"
                                    : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                            }`}
                          >
                            {c.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                          {formatWib(c.updatedAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isClosed ? (
                            <Link
                              href={`/kasus/${c.id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Lihat Naskah</span>
                            </Link>
                          ) : (
                            <Link
                              href={`/kasus/${c.id}`}
                              className="text-[11px] font-bold text-[#F0BC79] hover:underline"
                            >
                              Buka Workspace &rarr;
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#0D1527] border-t border-[#1E2E4A] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Menampilkan {cases.length} kasus terdaftar</span>
            <span className="font-mono text-slate-500">P-ANJAD Kodiklat TNI v0.1</span>
          </div>
        </div>

        {/* Right Column: Source Status & Volume Trends */}
        <div className="space-y-6">
          {/* Volume Trend Bar Chart Card */}
          <div className="bg-[#111A2E] rounded-2xl border border-[#1E2E4A] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A] mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#F0BC79]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Tren Volume Unggahan Publik
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Per Tanggal</span>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(metrics.volumeByDate).map(([date, count]) => {
                const max = Math.max(1, ...Object.values(metrics.volumeByDate));
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={date} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-mono">{date}</span>
                      <span className="font-bold text-white">{count} unggahan</span>
                    </div>
                    <div className="w-full h-2 bg-[#0D1527] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-[#F0BC79] rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Source Status Card */}
          <div className="bg-[#111A2E] rounded-2xl border border-[#1E2E4A] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A] mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Kesehatan Jalur Intelijen
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                100% On-Premise
              </span>
            </div>

            <div className="space-y-2.5">
              {metrics.sources.map((src) => (
                <div
                  key={src.id}
                  className="p-3 bg-[#0D1527] rounded-xl border border-[#1E2E4A] text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-200">{src.label}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {src.id} · Jalur {src.kind}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      src.lastSuccessAt
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {src.lastSuccessAt ? "Aktif" : "Standby"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
