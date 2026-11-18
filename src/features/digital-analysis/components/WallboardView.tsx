"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useDigitalAnalysis } from "../context";
import { Radio, TrendingUp, MapPin, ArrowLeft, Layers, Maximize2, Minimize2 } from "lucide-react";
import { TacticalIndonesianMap } from "./TacticalIndonesianMap";

function subscribeReady() {
  return () => {};
}
function getReadySnapshot(): boolean {
  return true;
}
function getServerReadySnapshot(): boolean {
  return false;
}

export function WallboardView() {
  const isMounted = useSyncExternalStore(subscribeReady, getReadySnapshot, getServerReadySnapshot);
  const { actions, demoNow } = useDigitalAnalysis();
  const metrics = actions.getAggregateMetrics();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const formatWib = (iso: string, tz: string, label: string) => {
    try {
      const d = new Date(iso);
      return (
        d.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: tz,
        }) +
        " " +
        label
      );
    } catch {
      return iso;
    }
  };

  if (!isMounted) {
    return (
      <div className="h-screen w-screen bg-[#0A0E1A] text-white flex flex-col justify-between p-6">
        <div className="h-16 bg-slate-900/80 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-12 gap-6 flex-1 py-6">
          <div className="col-span-12 lg:col-span-8 bg-slate-900/80 rounded-2xl animate-pulse" />
          <div className="col-span-12 lg:col-span-4 bg-slate-900/80 rounded-2xl animate-pulse" />
        </div>
        <div className="h-10 bg-slate-900/80 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Determine source health based on 24h threshold
  const checkSourceHealth = (lastSuccessAt: string | null) => {
    if (!lastSuccessAt)
      return {
        status: "DISCONNECTED",
        label: "Belum Terhubung",
        color: "text-slate-400 bg-slate-800/80 border-slate-700",
      };
    const diffHours =
      (new Date(demoNow).getTime() - new Date(lastSuccessAt).getTime()) / (1000 * 3600);
    if (diffHours <= 24) {
      return {
        status: "HEALTHY",
        label: "Aktif & Segar",
        color: "text-emerald-400 bg-emerald-950/70 border-emerald-500/50",
      };
    }
    return {
      status: "DELAYED",
      label: "Tertunda (>24 Jam)",
      color: "text-amber-400 bg-amber-950/70 border-amber-500/50",
    };
  };

  return (
    <div className="fixed inset-0 bg-[#070B14] text-slate-100 flex flex-col z-50 overflow-hidden font-sans select-none">
      {/* Wallboard Command Header */}
      <header className="bg-[#0f172a] px-8 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-2xl">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Kembali ke Portal"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0BC79] to-[#D99A48] flex items-center justify-center text-[#151E36] font-black text-xl shadow-md">
            K
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white flex items-center gap-3">
              <span>PUSAT MONITORING & TELEMETRI ANALISIS DIGITAL (P-ANJAD)</span>
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-red-600/30 text-red-400 border border-red-500/50 font-bold animate-pulse">
                LIVE 16:9 COMMAND DISPLAY
              </span>
            </div>
            <div className="text-xs text-[#F0BC79] font-semibold tracking-wide">
              KODIKLAT TNI · MODE DEMO · DATA FIKTIF TERAGREGASI
            </div>
          </div>
        </div>

        {/* Center Multi-clock */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-xl bg-[#1e293b]/60 border border-slate-700 font-mono text-xs">
          <span className="text-white font-bold" suppressHydrationWarning>
            {formatWib(demoNow, "Asia/Jakarta", "WIB")}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300" suppressHydrationWarning>
            {formatWib(demoNow, "Asia/Makassar", "WITA")}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300" suppressHydrationWarning>
            {formatWib(demoNow, "Asia/Jayapura", "WIT")}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400" suppressHydrationWarning>
            {formatWib(demoNow, "UTC", "UTC")}
          </span>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh (F11)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Grid: 16:9 Fitted Layout without scroll */}
      <div className="flex-1 p-6 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Left Column: KPI Cards (Cols 1-4) */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Status Breakdown Grid */}
          <div className="bg-[#0f172a]/95 border border-slate-800 rounded-3xl p-5 shadow-2xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-[#F0BC79]" />
                <span>Status Kasus Digital</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Total: {metrics.totalCases} Kasus
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 my-auto">
              <div className="bg-[#1e293b]/60 p-4 rounded-2xl border border-blue-500/30">
                <div className="text-[11px] text-blue-300 font-medium">Dalam Peninjauan</div>
                <div className="text-3xl font-black text-white mt-1">{metrics.inReview}</div>
                <div className="text-[10px] text-slate-400 mt-1">Investigasi & Analisis</div>
              </div>

              <div className="bg-[#1e293b]/60 p-4 rounded-2xl border border-amber-500/30">
                <div className="text-[11px] text-amber-300 font-medium">Menunggu Verifikasi</div>
                <div className="text-3xl font-black text-amber-400 mt-1">
                  {metrics.awaitingVerification}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Tugas Lapangan / Dokumen</div>
              </div>

              <div className="bg-[#1e293b]/60 p-4 rounded-2xl border border-slate-700">
                <div className="text-[11px] text-slate-400 font-medium">Draft Belum Ditinjau</div>
                <div className="text-3xl font-black text-slate-300 mt-1">{metrics.draft}</div>
                <div className="text-[10px] text-slate-500 mt-1">Perlu Bukti Minimum</div>
              </div>

              <div className="bg-[#1e293b]/60 p-4 rounded-2xl border border-emerald-500/30">
                <div className="text-[11px] text-emerald-300 font-medium">Selesai / Ditutup</div>
                <div className="text-3xl font-black text-emerald-400 mt-1">{metrics.closed}</div>
                <div className="text-[10px] text-slate-400 mt-1">Laporan Resmi Disetujui</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Antrean Verifikasi Aktif:</span>
              <strong className="text-[#F0BC79] font-mono text-sm">
                {metrics.activeVerifications} Permintaan
              </strong>
            </div>
          </div>

          {/* Regional Distribution Breakdown */}
          <div className="bg-[#0f172a]/95 border border-slate-800 rounded-3xl p-5 shadow-2xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Sebaran Wilayah Kejadian Publik</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Agregat Makro P1</span>
            </div>

            <div className="space-y-3 my-auto">
              {(["Barat", "Tengah", "Timur", "Unknown"] as const).map((region) => {
                const count = metrics.regionalCounts[region];
                const total = Math.max(
                  1,
                  Object.values(metrics.regionalCounts).reduce((a, b) => a + b, 0)
                );
                const pct = Math.round((count / total) * 100);
                const label =
                  region === "Unknown" ? "Belum Diketahui / Nasional" : `Wilayah ${region}`;

                return (
                  <div key={region} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{label}</span>
                      <span className="text-white font-mono">
                        {count} rekaman ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          region === "Barat"
                            ? "bg-blue-500"
                            : region === "Tengah"
                              ? "bg-amber-400"
                              : region === "Timur"
                                ? "bg-emerald-500"
                                : "bg-slate-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-500 italic text-center pt-2">
              Diagram agregat makro tanpa penanda koordinat individu nasabah/publik
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Map & Telemetry Matrix (Cols 5-12) */}
        <div className="col-span-8 flex flex-col gap-4">
          {/* Tactical Map of Indonesia */}
          <div className="flex-[1.4] flex flex-col min-h-0">
            <TacticalIndonesianMap regionalCounts={metrics.regionalCounts} />
          </div>

          {/* Bottom Row: Volume Trend + Source Matrix */}
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            {/* Volume Trend */}
            <div className="bg-[#0f172a]/95 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-[#F0BC79]" />
                  <span>Tren Volume Publik</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Agregasi WIB</span>
              </div>

              <div className="flex items-end justify-between gap-4 h-28 py-2 px-4 my-auto">
                {Object.entries(metrics.volumeByDate).map(([date, count]) => {
                  const maxCount = Math.max(1, ...Object.values(metrics.volumeByDate));
                  const heightPct = Math.round((count / maxCount) * 100);
                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                    >
                      <div className="text-xs font-bold text-[#F0BC79]">{count}</div>
                      <div
                        className="w-full max-w-[48px] bg-gradient-to-t from-blue-700 to-[#F0BC79] rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max(20, heightPct)}%` }}
                      ></div>
                      <div className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                        {date}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-500 text-right pt-1">
                Deteksi anomali volume publik
              </div>
            </div>

            {/* Source Health Matrix */}
            <div className="bg-[#0f172a]/95 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Kesehatan Sumber Data</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ambang: 24 Jam</span>
              </div>

              <div className="space-y-2.5 my-auto">
                {metrics.sources.map((src) => {
                  const health = checkSourceHealth(src.lastSuccessAt);
                  return (
                    <div
                      key={src.id}
                      className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white text-[11px]">{src.label}</div>
                        <div className="text-[10px] font-mono text-slate-400">{src.id}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${health.color}`}
                      >
                        {health.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-500 text-right pt-1 font-mono">
                Cross-Tab Storage Listener: ACTIVE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
