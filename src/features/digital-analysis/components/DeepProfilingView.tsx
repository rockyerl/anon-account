"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDigitalAnalysis } from "../context";
import { getAnonymousProfile } from "../profiling-fixtures";
import { AnonymousDossier, MaltegoEntityNode } from "../types";
import {
  Fingerprint,
  Crosshair,
  Radio,
  Smartphone,
  Search,
  UserCheck,
  Globe,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Car,
  Navigation,
  Eye,
  Wifi,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  Send,
  ExternalLink,
  Sparkles,
  Check,
} from "lucide-react";

type ActiveTab = "osint" | "stylometry" | "circadian" | "forensics" | "crossdb" | "maltego";

const DAYS_ID = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export interface DeepProfilingViewProps {
  defaultHandle?: string;
  embeddedCaseId?: string;
  hideHeaderBanner?: boolean;
}

export function DeepProfilingView({
  defaultHandle = "@akun_contoh_a",
  embeddedCaseId,
  hideHeaderBanner = false,
}: DeepProfilingViewProps = {}) {
  const { currentRole, switchRole, actions } = useDigitalAnalysis();
  const [searchQuery, setSearchQuery] = useState(defaultHandle);
  const [currentHandle, setCurrentHandle] = useState(defaultHandle);
  const [activeTab, setActiveTab] = useState<ActiveTab>("osint");
  const [isScanning, setIsScanning] = useState(false);
  const [escalateSuccess, setEscalateSuccess] = useState<string | null>(null);
  const [escalateError, setEscalateError] = useState<string | null>(null);
  const [selectedMaltegoNode, setSelectedMaltegoNode] = useState<MaltegoEntityNode | null>(null);

  // Load current dossier
  const dossier: AnonymousDossier = getAnonymousProfile(currentHandle);

  const handleSearch = (target: string) => {
    const clean = target.trim();
    if (!clean) return;
    setIsScanning(true);
    setEscalateSuccess(null);
    setEscalateError(null);
    setSelectedMaltegoNode(null);

    setTimeout(() => {
      setCurrentHandle(clean);
      setIsScanning(false);
    }, 450);
  };

  const handleEscalateToCase = () => {
    setEscalateSuccess(null);
    setEscalateError(null);

    const targetCaseId = embeddedCaseId || "KAS-101";

    if (currentRole !== "analis") {
      setEscalateError(
        `Hanya pengguna dengan wewenang Analis (Letkol Kav) yang dapat mendaftarkan bukti baru ke kasus ${targetCaseId}.`
      );
      return;
    }

    const input = {
      sourceId: "SRC-PUB",
      kind: "public_post" as const,
      sourceRef: `${dossier.targetHandle} - Deep Profiling Intelijen Forensik`,
      title: `Hasil Deep Profiling & Identifikasi Pemilik Akun Anonim ${dossier.targetHandle}`,
      excerpt: `Teridentifikasi melalui jejak OSINT (${dossier.footprint.map((f) => f.platform).join(", ")}), dialek ${dossier.stylometry.detectedDialect}, pola aktif sirkadian ${dossier.circadian.peakPostingHours}, BTS ${dossier.forensics.cellTowerLocation} (${dossier.forensics.estimatedCoordinates.lat}, ${dossier.forensics.estimatedCoordinates.lng}), NIK terduga ${dossier.crossDb.nikCandidate || "dalam pencocokan"} an ${dossier.crossDb.fullName || "Subjek Teridentifikasi"}.`,
      occurredAt: "2026-11-17T08:30:00+07:00",
      broadRegion: "Barat" as const,
    };

    const res = actions.recordEvidence(targetCaseId, input);
    if ("evidence" in res) {
      setEscalateSuccess(
        `Berhasil mendaftarkan temuan profiling ke Kasus ${targetCaseId} dengan ID ${res.evidence.id}. Rujukan: ${res.evidence.title}`
      );
    } else {
      setEscalateError(
        res.message || "Gagal mendaftarkan bukti. Periksa status kasus atau izin peran."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title: Render compact embedded banner if embeddedCaseId / hideHeaderBanner */}
      {hideHeaderBanner || embeddedCaseId ? (
        <div className="bg-[#111A2E] rounded-2xl p-5 text-white border border-[#1E2E4A] shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Fingerprint className="w-5 h-5 text-[#F0BC79]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                    STEP 3 · DEEP PROFILING INTELIJEN
                  </span>
                  {embeddedCaseId && (
                    <span className="text-xs text-slate-400 font-mono">
                      Kasus: <strong className="text-white">{embeddedCaseId}</strong>
                    </span>
                  )}
                </div>
                <h2 className="text-base font-black text-white mt-0.5 flex items-center gap-2">
                  <span>Pelacakan Akun Target:</span>
                  <span className="font-mono text-[#F0BC79]">{currentHandle}</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEscalateToCase}
                className="px-3.5 py-2 rounded-xl bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Eskalasi ke Bukti Kasus</span>
              </button>
            </div>
          </div>

          {/* Quick Target Switch Chips for current case */}
          <div className="pt-3 border-t border-[#1E2E4A] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-[11px]">Akun Terkait Kasus Ini:</span>
              {(embeddedCaseId === "KAS-101"
                ? ["@akun_contoh_a", "@akun_contoh_b"]
                : embeddedCaseId === "KAS-102"
                  ? ["@link_rekrutmen_palsu"]
                  : embeddedCaseId === "KAS-103"
                    ? ["@lensa_lapangan_09"]
                    : [
                        "@akun_contoh_a",
                        "@akun_contoh_b",
                        "@link_rekrutmen_palsu",
                        "@lensa_lapangan_09",
                      ]
              ).map((h) => (
                <button
                  key={h}
                  onClick={() => handleSearch(h)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    currentHandle === h
                      ? "bg-[#F0BC79] text-[#151E36] shadow-xs"
                      : "bg-[#0D1527] text-slate-300 border border-[#1E2E4A] hover:text-white"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(searchQuery);
                }}
                placeholder="Cari handle lain..."
                className="w-full pl-8 pr-16 py-1.5 rounded-lg bg-[#0D1527] border border-[#1E2E4A] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0BC79] font-mono"
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={isScanning}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 hover:bg-slate-700 disabled:opacity-50"
              >
                {isScanning ? "Scanning..." : "Scan"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#151E36] rounded-xl p-6 text-white border border-[#2A3756] shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  ENJIN DEEP PROFILING AKTIF
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                  MULTI-VECTOR OSINT & FORENSIK
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <Fingerprint className="w-8 h-8 text-[#F0BC79]" />
                Pencari Akun Anonim & Indikasi Lokasi
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Platform intelijen aktif untuk mengidentifikasi pemilik akun anonim melalui korelasi
                jejak digital (Sherlock/Maigret), metadata forensik perangkat/kamera, analisis
                stylometri bahasa, pola waktu sirkadian, serta gateway kependudukan, imigrasi, dan
                provider telekomunikasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-2 transition shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                Cetak Dossier
              </button>
              <Link
                href="/kasus/KAS-101"
                className="px-4 py-2 rounded-lg bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold text-xs flex items-center gap-2 transition shadow-md"
              >
                Buka Kasus KAS-101
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Search & Preset Bar */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(searchQuery);
                }}
                placeholder="Ketik username, handle medsos, atau identifier anonim (contoh: @akun_contoh_a)..."
                className="w-full pl-10 pr-24 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F0BC79] font-mono"
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={isScanning}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold text-xs transition disabled:opacity-50"
              >
                {isScanning ? "Memindai..." : "Pindai"}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">Target Demo Cepat:</span>
              {[
                "@akun_contoh_a",
                "@akun_contoh_b",
                "@link_rekrutmen_palsu",
                "@lensa_lapangan_09",
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSearch(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition border ${
                    currentHandle === preset
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Escalation Notification Banners */}
      {escalateSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-900 flex items-start gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{escalateSuccess}</p>
            <p className="text-xs text-emerald-700 mt-1">
              Temuan profiling ini sekarang telah tersimpan sebagai bukti kasus dan dapat
              diikutsertakan dalam permintaan verifikasi lapangan serta laporan resmi pimpinan
              Kodiklat TNI.
            </p>
          </div>
          <Link
            href="/kasus/KAS-101"
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
          >
            Lihat di Kasus KAS-101
          </Link>
        </div>
      )}

      {escalateError && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-900 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{escalateError}</p>
            {currentRole !== "analis" && (
              <button
                onClick={() => switchRole("analis")}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Ganti Peran ke Analis (Letkol Kav)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Target Dossier Executive Header Card */}
      <div className="bg-[#111A2E] rounded-xl p-6 border border-[#1E2E4A] shadow-sm text-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#151E36] to-[#2A3756] text-white flex items-center justify-center shrink-0 border border-[#2A3756] shadow-inner">
              <Crosshair className="w-8 h-8 text-[#F0BC79]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white font-mono tracking-tight">
                  {dossier.targetHandle}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    dossier.threatLevel === "KRITIS" || dossier.threatLevel === "TINGGI"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  }`}
                >
                  ANCAMAN: {dossier.threatLevel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0D1527] text-slate-300 border border-[#1E2E4A]">
                  {dossier.caseAssociation}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl font-medium">
                {dossier.summaryStatus}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                <span>Dossier ID: {dossier.id}</span>
                <span>·</span>
                <span>Terdeteksi: 6 Titik Vektor Intelijen</span>
                <span>·</span>
                <span>Algoritma: Sherlock + Stylometric NLP v4</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#1E2E4A]">
            {/* Threat Gauge */}
            <div className="bg-[#0D1527] rounded-xl p-3 border border-[#1E2E4A] flex items-center gap-3">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Indeks Risiko
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {dossier.riskScore}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
              </div>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    dossier.riskScore > 80
                      ? "bg-rose-500"
                      : dossier.riskScore > 60
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${dossier.riskScore}%` }}
                />
              </div>
            </div>

            {/* Bridge Action: Escalate to Case */}
            <button
              onClick={handleEscalateToCase}
              className="px-4 py-3 rounded-xl bg-[#151E36] hover:bg-[#1E2B4D] text-[#F0BC79] font-bold text-xs flex items-center justify-center gap-2 transition shadow-md border border-[#2A3756]"
            >
              <Send className="w-4 h-4 text-[#F0BC79]" />
              Eskalasi Temuan ke Kasus KAS-101
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-[#1E2E4A] overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("osint")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === "osint"
                ? "border-[#F0BC79] text-[#F0BC79] bg-[#0D1527] rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4" />
            Jejak Digital OSINT (Sherlock/Maigret)
            <span className="px-1.5 py-0.2 rounded-full bg-[#1E293B] text-slate-300 text-[10px]">
              {dossier.footprint.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("stylometry")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === "stylometry"
                ? "border-[#F0BC79] text-[#F0BC79] bg-[#0D1527] rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Stylometri & Pola Bahasa
          </button>

          <button
            onClick={() => setActiveTab("circadian")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === "circadian"
                ? "border-[#F0BC79] text-[#F0BC79] bg-[#0D1527] rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            Pola Waktu & Sirkadian (24x7)
          </button>

          <button
            onClick={() => setActiveTab("forensics")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === "forensics"
                ? "border-[#F0BC79] text-[#F0BC79] bg-[#0D1527] rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-4 h-4" />
            Forensik Metadata & BTS (Lokasi)
          </button>

          <button
            onClick={() => setActiveTab("crossdb")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === "crossdb"
                ? "border-[#F0BC79] text-[#F0BC79] bg-[#0D1527] rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Konektor Lintas Instansi (Dukcapil/Imigrasi)
          </button>

          <button
            onClick={() => setActiveTab("maltego")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === "maltego"
                ? "border-[#F0BC79] text-[#F0BC79] bg-[#0D1527] rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Graf Relasi Maltego
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: OSINT FOOTPRINT */}
      {activeTab === "osint" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111A2E] p-5 rounded-xl border border-[#1E2E4A] shadow-sm text-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Platform Terindeks
              </div>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                {dossier.footprint.length} Media
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Dipindai otomatis via Sherlock & SpiderFoot Gateway
              </p>
            </div>
            <div className="bg-[#111A2E] p-5 rounded-xl border border-[#1E2E4A] shadow-sm text-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Akurasi Pencocokan Identitas
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                {Math.round(
                  dossier.footprint.reduce((acc, f) => acc + f.matchConfidence, 0) /
                    dossier.footprint.length
                )}
                %
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Rata-rata kesesuaian profil dan username
              </p>
            </div>
            <div className="bg-[#111A2E] p-5 rounded-xl border border-[#1E2E4A] shadow-sm text-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Jangkauan Dampak Terkoneksi
              </div>
              <div className="text-2xl font-black text-[#F0BC79] mt-1 font-mono">
                {dossier.footprint
                  .reduce((acc, f) => acc + (f.followersCount || 0), 0)
                  .toLocaleString("id-ID")}{" "}
                Pengikut
              </div>
              <p className="text-xs text-slate-400 mt-1">Total audiens jaringan yang terhubung</p>
            </div>
          </div>

          {/* OSINT Grid */}
          <div className="bg-[#111A2E] rounded-xl border border-[#1E2E4A] shadow-sm overflow-hidden text-slate-100">
            <div className="p-4 bg-[#0D1527] border-b border-[#1E2E4A] flex items-center justify-between">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Matriks Jejak Digital Akun Terkait (Sherlock, Maigret, Social Searcher)
              </div>
              <span className="text-xs font-mono text-slate-400">
                Pembaruan: Realtime Sinkronisasi
              </span>
            </div>

            <div className="divide-y divide-[#1E2E4A]">
              {dossier.footprint.map((f, i) => (
                <div
                  key={i}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#0D1527]/60 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0D1527] border border-[#1E2E4A] flex items-center justify-center shrink-0 text-slate-200 font-bold">
                      {f.platform.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{f.platform}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0D1527] text-slate-300 border border-[#1E2E4A] uppercase">
                          {f.category}
                        </span>
                        {f.status === "found" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Check className="w-3 h-3" /> DITEMUKAN
                          </span>
                        )}
                        {f.status === "suspicious" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> MENCURIGAKAN
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>@{f.username}</span>
                        <span>·</span>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          {f.url} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-slate-400 sm:text-right">
                    {f.followersCount !== undefined && (
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Pengikut</div>
                        <div className="font-bold text-white font-mono">
                          {f.followersCount.toLocaleString("id-ID")}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Akurasi</div>
                      <div className="font-bold text-emerald-400 font-mono">
                        {f.matchConfidence}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Aktivitas Terakhir</div>
                      <div className="font-mono text-slate-300">
                        {new Date(f.lastActive).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sherlock CLI simulated terminal log */}
          <div className="bg-[#0D1117] rounded-xl p-4 border border-slate-800 text-slate-300 font-mono text-xs shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <Terminal className="w-4 h-4" />
                TERMINAL INTELIJEN OSINT ENGINE (SHERLOCK & MAIGRET CRAWLER)
              </span>
              <span className="text-[11px] text-slate-500">Kodiklat TNI OSINT Sandbox v2.4</span>
            </div>
            <div className="space-y-1 text-slate-400">
              <p className="text-slate-500">
                # Memulai pemindaian multi-platform untuk target: {dossier.targetHandle}
              </p>
              <p>
                [+] Memeriksa endpoint X/Twitter: https://x.example/
                {dossier.targetHandle.replace("@", "")} ...{" "}
                <span className="text-emerald-400">FOUND (HTTP 200)</span>
              </p>
              <p>
                [+] Memeriksa Telegram channel & user ID ...{" "}
                <span className="text-emerald-400">FOUND (Match 92%)</span>
              </p>
              <p>
                [+] Mengekstrak metadata foto & timestamp unggahan ...{" "}
                <span className="text-cyan-400">EXIF Extracted (Device SM-S911B)</span>
              </p>
              <p>
                [+] Menguji klaster akun sekunder & botnet ...{" "}
                <span className="text-amber-400">
                  Amplification Network Detected (@akun_contoh_b)
                </span>
              </p>
              <p className="text-emerald-400">
                [✓] Pemindaian selesai. Dossier diperbarui secara deterministik.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: STYLOMETRY */}
      {activeTab === "stylometry" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dialect Analysis */}
            <div className="bg-[#111A2E] p-6 rounded-xl border border-[#1E2E4A] shadow-sm space-y-4 text-slate-100">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Analisis Dialek & Gaya Bahasa (Stylometry)
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Akurasi: {dossier.stylometry.dialectConfidence}%
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium">Dialek Terdeteksi:</div>
                <div className="text-lg font-black text-white mt-0.5">
                  {dossier.stylometry.detectedDialect}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium">Nada Emosional & Karakter:</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5 bg-[#0D1527] p-2.5 rounded-lg border border-[#1E2E4A]">
                  {dossier.stylometry.emotionalTone}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium">
                  Tingkat Perbendaharaan Kata:
                </div>
                <div className="text-sm text-slate-300 mt-0.5">
                  {dossier.stylometry.vocabularyLevel}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium">
                  Pola Tanda Baca & Typografi:
                </div>
                <div className="text-sm text-slate-300 mt-0.5 font-mono bg-[#0D1527] p-2.5 rounded-lg border border-[#1E2E4A]">
                  {dossier.stylometry.punctuationPattern}
                </div>
              </div>
            </div>

            {/* Dominant Phrases & Slang */}
            <div className="bg-[#111A2E] p-6 rounded-xl border border-[#1E2E4A] shadow-sm space-y-4 text-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Frasa Kunci Dominan & Penanda Kedaerahan (Slang)
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium mb-2">
                  Frasa Kunci yang Sering Diulang (Disinformasi Marker):
                </div>
                <div className="flex flex-wrap gap-2">
                  {dossier.stylometry.dominantKeyPhrases.map((phrase, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold font-mono"
                    >
                      &ldquo;{phrase}&rdquo;
                    </span>
                  ))}
                </div>
              </div>

              {dossier.stylometry.slangIndicators.length > 0 && (
                <div className="pt-3 border-t border-[#1E2E4A]">
                  <div className="text-xs text-slate-400 font-medium mb-2">
                    Leksikon Kedaerahan Teridentifikasi (Jawa Tengah):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dossier.stylometry.slangIndicators.map((slang, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono"
                      >
                        {slang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-950/30 border border-blue-800/50 rounded-lg text-xs text-blue-200 leading-relaxed">
                <span className="font-bold">Kesimpulan Analis Linguistik:</span> Penulis unggahan
                memiliki kebiasaan menulis informal dengan leksikon Jawa Tengah (Semarang), namun
                memiliki familiaritas yang tinggi terhadap nomenklatur satuan Kodiklat TNI,
                mengindikasikan kemungkinan orang dalam atau warga lokal yang terbiasa mengamati
                pangkalan militer.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CIRCADIAN ACTIVITY */}
      {activeTab === "circadian" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#111A2E] p-4 rounded-xl border border-[#1E2E4A] shadow-sm text-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Jam Aktif Puncak
              </div>
              <div className="text-base font-bold text-white mt-1 font-mono">
                {dossier.circadian.peakPostingHours}
              </div>
            </div>
            <div className="bg-[#111A2E] p-4 rounded-xl border border-[#1E2E4A] shadow-sm text-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Zona Waktu Terestimasi
              </div>
              <div className="text-base font-bold text-white mt-1 font-mono">
                {dossier.circadian.estimatedTimezone}
              </div>
            </div>
            <div className="bg-[#111A2E] p-4 rounded-xl border border-[#1E2E4A] shadow-sm text-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Estimasi Waktu Istirahat
              </div>
              <div className="text-base font-bold text-white mt-1 font-mono">
                {dossier.circadian.sleepIntervalEstimate}
              </div>
            </div>
            <div className="bg-[#111A2E] p-4 rounded-xl border border-[#1E2E4A] shadow-sm text-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pola Rutinitas
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-1">
                {dossier.circadian.routinePattern}
              </div>
            </div>
          </div>

          {/* 7 x 24 Heatmap */}
          <div className="bg-[#111A2E] p-6 rounded-xl border border-[#1E2E4A] shadow-sm text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#1E2E4A] gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Matriks Heatmap Aktivitas Sirkadian (24 Jam x 7 Hari)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menunjukkan densitas waktu unggahan, interaksi, dan aktivitas jaringan target
                  secara kronologis.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>Rendah</span>
                <span className="w-3.5 h-3.5 rounded bg-[#0D1527] border border-[#1E2E4A]" />
                <span className="w-3.5 h-3.5 rounded bg-amber-900/60" />
                <span className="w-3.5 h-3.5 rounded bg-amber-500" />
                <span className="w-3.5 h-3.5 rounded bg-rose-500" />
                <span className="w-3.5 h-3.5 rounded bg-rose-700" />
                <span>Puncak</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Hour Header */}
                <div className="grid grid-cols-[80px_repeat(24,_1fr)] gap-1 text-[10px] font-mono text-slate-400 pb-2 text-center">
                  <div>Hari</div>
                  {Array.from({ length: 24 }).map((_, h) => (
                    <div key={h}>{String(h).padStart(2, "0")}</div>
                  ))}
                </div>

                {/* Days Rows */}
                {dossier.circadian.activityMatrix.map((row, dayIdx) => (
                  <div
                    key={dayIdx}
                    className="grid grid-cols-[80px_repeat(24,_1fr)] gap-1 items-center py-1"
                  >
                    <div className="text-xs font-semibold text-slate-300">{DAYS_ID[dayIdx]}</div>
                    {row.map((val, hourIdx) => {
                      let bgClass = "bg-[#0D1527] border border-[#1E2E4A] text-transparent";
                      if (val > 8) bgClass = "bg-rose-600 text-white font-bold";
                      else if (val > 6) bgClass = "bg-rose-500 text-white font-bold";
                      else if (val > 4) bgClass = "bg-amber-500 text-slate-900 font-bold";
                      else if (val > 2) bgClass = "bg-amber-700/80 text-white";
                      else if (val > 0) bgClass = "bg-amber-900/40 text-amber-300";

                      return (
                        <div
                          key={hourIdx}
                          title={`${DAYS_ID[dayIdx]} pukul ${String(hourIdx).padStart(2, "0")}.00 WIB: ${val} aktivitas`}
                          className={`h-7 rounded flex items-center justify-center text-[10px] font-mono transition hover:scale-110 cursor-pointer ${bgClass}`}
                        >
                          {val > 0 ? val : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: FORENSICS & BTS LOCATION */}
      {activeTab === "forensics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hardware & EXIF Card */}
            <div className="bg-[#111A2E] p-6 rounded-xl border border-[#1E2E4A] shadow-sm space-y-4 text-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                Sidik Jari Perangkat Keras & EXIF Foto
              </div>

              <div className="space-y-3 divide-y divide-[#1E2E4A]">
                <div className="pt-2">
                  <span className="text-xs text-slate-400">Model Perangkat Fisik:</span>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {dossier.forensics.deviceModel}
                  </div>
                </div>

                <div className="pt-3">
                  <span className="text-xs text-slate-400">Sistem Operasi / Firmware:</span>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">
                    {dossier.forensics.osVersion}
                  </div>
                </div>

                {dossier.forensics.cameraExifHardware && (
                  <div className="pt-3">
                    <span className="text-xs text-slate-400">Modul Sensor Kamera Foto (EXIF):</span>
                    <div className="text-sm font-semibold text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/50 mt-0.5 font-mono">
                      {dossier.forensics.cameraExifHardware}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      *Membuktikan foto edaran palsu dipotret langsung dari kamera smartphone fisik
                      secara indoor tanpa lampu kilat (flash).
                    </p>
                  </div>
                )}

                <div className="pt-3">
                  <span className="text-xs text-slate-400">Browser User-Agent String:</span>
                  <div className="text-xs text-slate-300 bg-[#0D1527] p-2.5 rounded-lg border border-[#1E2E4A] mt-0.5 font-mono break-all">
                    {dossier.forensics.browserUserAgent}
                  </div>
                </div>
              </div>
            </div>

            {/* Network & BTS Triangulation */}
            <div className="bg-[#111A2E] p-6 rounded-xl border border-[#1E2E4A] shadow-sm space-y-4 text-slate-100">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-400" />
                  Triangulasi Sinyal BTS & IP Provider
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  LOKASI TERINDIKASI
                </span>
              </div>

              <div className="space-y-3 divide-y divide-[#1E2E4A]">
                <div className="pt-2">
                  <span className="text-xs text-slate-400">Alamat IP Publik:</span>
                  <div className="text-base font-black text-white font-mono mt-0.5">
                    {dossier.forensics.ipAddress}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{dossier.forensics.asnIsp}</div>
                </div>

                <div className="pt-3">
                  <span className="text-xs text-slate-400">Identitas Menara BTS Terhubung:</span>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {dossier.forensics.cellTowerId}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5 font-medium">
                    {dossier.forensics.cellTowerLocation}
                  </div>
                </div>

                <div className="pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Estimasi Koordinat Geografis:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Radius Akurasi: ±{dossier.forensics.estimatedCoordinates.accuracyMeters} Meter
                    </span>
                  </div>
                  <div className="text-sm font-black text-cyan-300 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-800/50 mt-1 font-mono flex items-center justify-between">
                    <span>
                      {dossier.forensics.estimatedCoordinates.lat},{" "}
                      {dossier.forensics.estimatedCoordinates.lng}
                    </span>
                    <Navigation className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              </div>

              {/* Mini Tactical Radar Box */}
              <div className="bg-[#151E36] rounded-xl p-4 text-white border border-[#2A3756] relative overflow-hidden flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-cyan-400/40 relative flex items-center justify-center shrink-0">
                  <div className="w-10 h-10 rounded-full border border-cyan-400/30 animate-ping absolute" />
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#F0BC79]">
                    SEKTOR PEMANCAR: KRAPYAK SEMARANG BARAT
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Sinyal terdaftar aktif saat jam penyebaran dokumen edaran palsu (07.50 WIB).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: CROSS DATABASE CONNECTIONS */}
      {activeTab === "crossdb" && (
        <div className="space-y-6">
          <div className="bg-[#111A2E] p-6 rounded-xl border border-[#1E2E4A] shadow-sm text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#1E2E4A] gap-2">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Konektor Gateway Lintas Instansi (Dukcapil, Imigrasi, Korlantas, Provider)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hasil penelusuran silang otomatis dengan protokol keamanan intelijen pertahanan
                  negara.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
                Indeks Validitas Silang: {dossier.crossDb.confidenceScore}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dukcapil Card */}
              <div className="p-4 rounded-xl border border-[#1E2E4A] bg-[#0D1527] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    Pencatatan Sipil (Dukcapil Kemendagri)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    TERVERIFIKASI
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400">Kandidat NIK:</span>
                    <div className="font-mono font-bold text-white text-sm">
                      {dossier.crossDb.nikCandidate || "Tidak Terdaftar"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Nama Terdaftar (Samaran Prosedural):</span>
                    <div className="font-semibold text-slate-200">
                      {dossier.crossDb.fullName || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Alamat Domisili KTP:</span>
                    <div className="text-slate-300 font-medium">
                      {dossier.crossDb.registeredAddress || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Cellular Card */}
              <div className="p-4 rounded-xl border border-[#1E2E4A] bg-[#0D1527] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-rose-400" />
                    Registrasi Kartu Seluler (Provider Register)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    MSISDN AKTIF
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400">Nomor Telepon (MSISDN):</span>
                    <div className="font-mono font-bold text-white text-sm">
                      {dossier.crossDb.msisdnPhone || "Dalam Pelacakan"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Operator Telekomunikasi:</span>
                    <div className="font-semibold text-slate-200">
                      {dossier.crossDb.providerName || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Status Validasi SIM:</span>
                    <div className="text-emerald-400 font-semibold">Tervalidasi NIK & KK Resmi</div>
                  </div>
                </div>
              </div>

              {/* Korlantas Samsat Card */}
              <div className="p-4 rounded-xl border border-[#1E2E4A] bg-[#0D1527] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-amber-400" />
                    Data Registrasi Kendaraan (Korlantas Samsat)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    STNK MATCH
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400">Nomor Registrasi Kendaraan (Plat):</span>
                    <div className="font-mono font-bold text-white text-sm">
                      {dossier.crossDb.vehiclePlates || "Tidak Teridentifikasi"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Model Kendaraan:</span>
                    <div className="font-semibold text-slate-200">
                      {dossier.crossDb.vehicleModel || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Keimigrasian Card */}
              <div className="p-4 rounded-xl border border-[#1E2E4A] bg-[#0D1527] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    Data Keimigrasian & Perlintasan
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    SIMKEMAS GATEWAY
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400">Catatan Paspor & Perlintasan:</span>
                    <div className="font-semibold text-slate-200 mt-1">
                      {dossier.crossDb.passportStatus || "Belum Ada Catatan Luar Negeri"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: MALTEGO THREAT GRAPH */}
      {activeTab === "maltego" && (
        <div className="space-y-6">
          <div className="bg-[#111A2E] p-6 rounded-xl border border-[#1E2E4A] shadow-sm space-y-4 text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2E4A] gap-2">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Topologi Relasi Maltego Multi-Entitas
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualisasi rantai atribusi dari Akun Anonim → Perangkat → Kartu SIM → Lokasi BTS
                  → NIK Kependudukan.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Klik node untuk inspeksi atribut mendalam
              </span>
            </div>

            {/* Simulated Interactive Maltego Topology Canvas */}
            <div className="bg-[#151E36] rounded-xl p-6 text-white border border-[#2A3756] relative overflow-hidden min-h-[380px] flex flex-col justify-between">
              {/* Radar Grid Overlay */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #F0BC79 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                  backgroundSize: "24px 24px, 48px 48px, 48px 48px",
                }}
              />

              {/* Nodes Flex Grid */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {dossier.maltegoGraph.nodes.map((node) => {
                  const isSelected = selectedMaltegoNode?.id === node.id;
                  let icon = <Fingerprint className="w-4 h-4" />;
                  if (node.type === "device") icon = <Smartphone className="w-4 h-4" />;
                  if (node.type === "phone") icon = <Wifi className="w-4 h-4" />;
                  if (node.type === "location") icon = <Radio className="w-4 h-4" />;
                  if (node.type === "identity") icon = <UserCheck className="w-4 h-4" />;
                  if (node.type === "vehicle") icon = <Car className="w-4 h-4" />;

                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedMaltegoNode(node)}
                      className={`p-3.5 rounded-xl border text-left transition relative ${
                        isSelected
                          ? "bg-slate-800/90 border-[#F0BC79] shadow-[0_0_15px_rgba(240,188,121,0.3)] ring-2 ring-[#F0BC79]"
                          : "bg-slate-900/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-1.5 rounded-lg bg-slate-800 text-[#F0BC79] border border-slate-700">
                          {icon}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            node.severity === "high"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : node.severity === "medium"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          }`}
                        >
                          {node.type}
                        </span>
                      </div>
                      <div className="font-mono text-sm font-bold text-white truncate">
                        {node.label}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {node.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Edge Explanations Bar */}
              <div className="relative z-10 mt-6 pt-4 border-t border-white/10">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Rantai Atribusi Penghubung (Terkonfirmasi Forensik):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {dossier.maltegoGraph.edges.map((edge) => (
                    <div
                      key={edge.id}
                      className="bg-slate-900/60 p-2 rounded border border-slate-800 flex items-center gap-2 text-slate-300 font-mono text-[11px]"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-[#F0BC79] shrink-0" />
                      <span className="font-bold text-white">{edge.label}</span>
                      <span className="text-slate-500">({edge.evidenceSource})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Node Inspector Drawer */}
            {selectedMaltegoNode && (
              <div className="p-4 rounded-xl bg-[#0D1527] border border-[#1E2E4A] space-y-2 animate-fadeIn text-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase">
                      Inspektur Entitas Maltego: {selectedMaltegoNode.label}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedMaltegoNode(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Tutup
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400">Tipe Entitas:</span>
                    <div className="font-semibold text-slate-200 capitalize">
                      {selectedMaltegoNode.type}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Tingkat Severitas:</span>
                    <div className="font-semibold text-rose-400 uppercase">
                      {selectedMaltegoNode.severity}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Keterangan:</span>
                    <div className="text-slate-300">{selectedMaltegoNode.subtitle}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
