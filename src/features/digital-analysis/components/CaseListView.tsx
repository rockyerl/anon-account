"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDigitalAnalysis } from "../context";
import {
  FileSearch,
  PlusCircle,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  Fingerprint,
  Network,
  Clock,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Trash2,
  Loader2,
  Radio,
} from "lucide-react";

interface ScenarioPreset {
  id: string;
  code: string;
  title: string;
  category: "edaran" | "tautan" | "konteks_video";
  categoryLabel: string;
  severity: "KRITIS" | "TINGGI" | "SEDANG";
  targetAccount: string;
  targetLocation: string;
  evidenceSummary: string;
  evidenceCount: number;
  graphSummary: string;
  description: string;
  deepProfilingSnippet: string;
}

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "KAS-101",
    code: "KAS-101",
    title: "Disinformasi Surat Perintah & Jadwal Latihan Puslatpur Baturaja",
    category: "edaran",
    categoryLabel: "Manipulasi Dokumen / Edaran",
    severity: "TINGGI",
    targetAccount: "@akun_contoh_a",
    targetLocation: "BTS Krapyak, Semarang Barat (Jawa Tengah)",
    evidenceSummary:
      "4 Bukti (Surat Edaran Palsu EV-01, Retweet EV-02, Klarifikasi EV-03, Dokumen Asli Puslatpur EV-04)",
    evidenceCount: 4,
    graphSummary: "20 Node Jaringan Interaksi & Amplifikasi Pesan",
    description:
      "Penyebaran dokumen palsu mengatasnamakan Dankodiklat TNI mengenai jam latihan tempur menjadi 10.30 WIB dengan amplifikasi botnet terkoordinasi.",
    deepProfilingSnippet:
      "Samsung S23, Telkomsel Broadband, Dialek Jawa Semarang, NIK Dukcapil terkonfirmasi.",
  },
  {
    id: "KAS-102",
    code: "KAS-102",
    title: "Sindikat Phishing Pendaftaran Seleksi Tamtama/Bintara Gelombang 1",
    category: "tautan",
    categoryLabel: "Phishing & Tautan Palsu",
    severity: "KRITIS",
    targetAccount: "@link_rekrutmen_palsu",
    targetLocation: "BTS Wonokromo, Kota Surabaya (Jawa Timur)",
    evidenceSummary:
      "3 Bukti (Domain Scam Rekrutmen, Nomor Rekening BCA Penampung, Broadcast WhatsApp)",
    evidenceCount: 3,
    graphSummary: "16 Node Jaringan Sindikat & Domain Phishing",
    description:
      "Penyebaran tautan formulir pendaftaran daring palsu yang memungut biaya via rekening penampung dengan menyalahgunakan logo resmi Kodiklat TNI.",
    deepProfilingSnippet:
      "Infinix Note 40 Pro, Telkom IndiHome Surabaya, Dialek Suroboyoan, Rekening Penampung BCA.",
  },
  {
    id: "KAS-103",
    code: "KAS-103",
    title: "Manipulasi Narasi Video Iring-iringan Ranpur Perbatasan",
    category: "konteks_video",
    categoryLabel: "Manipulasi Konteks Video",
    severity: "TINGGI",
    targetAccount: "@lensa_lapangan_09",
    evidenceSummary:
      "2 Bukti (Tangkapan Scraper Video TikTok SCRAPE-TIKTOK-01 & Post X Ranpur Konvoi)",
    evidenceCount: 2,
    targetLocation: "BTS Singkawang Barat (Kalimantan Barat)",
    graphSummary: "16 Node Distribusi Video & Warta Komunitas",
    description:
      "Penyebaran video TikTok potongan konvoi Panser Anoa yang dipelintir naratifnya seolah terjadi ketegangan darurat militer di perbatasan Kalbar.",
    deepProfilingSnippet:
      "iPhone 13 Pro Max, Telkomsel Kalbar, Metadata EXIF 4K HEVC, Kreator Konten TikTok.",
  },
];

const SCRAPER_CHANNELS = [
  {
    icon: "🐦",
    name: "X (Twitter) Firehose & Search API",
    status: "Mengekstrak 4 cuitan viral, retweet, dan interaksi akun...",
  },
  {
    icon: "📰",
    name: "Portal Berita Daring & Radar Warta",
    status: "Menyaring warta portal berita daerah & edaran kedinasan...",
  },
  {
    icon: "📱",
    name: "TikTok & Facebook Video Crawler",
    status: "Mengekstrak rekaman siaran video, komentar, & metadata EXIF...",
  },
  {
    icon: "🕸️",
    name: "Topologi Graf Relasi Antar-Entitas",
    status: "Membangun 20 node kluster penyebar & pola amplifikasi...",
  },
  {
    icon: "🔬",
    name: "Deep Profiling Seluler & Dukcapil",
    status: "Mengonfirmasi triangulasi BTS Krapyak, perangkat, & NIK target...",
  },
];

export function CaseListView() {
  const router = useRouter();
  const { actions } = useDigitalAnalysis();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Create Case Modal & Scraping Simulation
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [isScrapingSimulation, setIsScrapingSimulation] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [activeChannelIndex, setActiveChannelIndex] = useState(0);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("edaran");
  const [errorMessage, setErrorMessage] = useState("");

  const listRes = actions.listCases({
    search: searchQuery,
    status: statusFilter,
    category: categoryFilter,
  });

  const cases = "cases" in listRes ? listRes.cases : [];

  const handleLaunchScenario = () => {
    setErrorMessage("");

    if (isCustomMode) {
      const finalTitle = newTitle.trim();
      if (!finalTitle) {
        setErrorMessage("Judul kasus kustom wajib diisi");
        return;
      }

      setIsScrapingSimulation(true);
      setScrapingProgress(20);
      setActiveChannelIndex(0);

      setTimeout(() => {
        setScrapingProgress(55);
        setActiveChannelIndex(2);
      }, 600);

      setTimeout(() => {
        setScrapingProgress(85);
        setActiveChannelIndex(3);
      }, 1200);

      setTimeout(() => {
        setScrapingProgress(100);
        const res = actions.createCase({
          title: finalTitle,
          category: newCategory,
        });

        if ("error" in res) {
          setIsScrapingSimulation(false);
          setErrorMessage(res.message || res.error);
        } else {
          // Auto-seed initial scraped evidence for this custom case
          actions.recordEvidence(res.case.id, {
            sourceId: "SRC-PUB",
            kind: "public_post",
            sourceRef: `https://x.example/netizen_radar/status/${Date.now().toString().slice(-6)}`,
            title: `[X] @netizen_radar: Pantauan Cuitan Terkait "${finalTitle}"`,
            excerpt: `Hasil penelusuran kata kunci intelijen digital mendeteksi percakapan intensif di ranah publik terkait ${finalTitle}.`,
            occurredAt: new Date().toISOString(),
          });
          actions.startReview(res.case.id);
          setCreateModalOpen(false);
          setIsScrapingSimulation(false);
          router.push(`/kasus/${res.case.id}`);
        }
      }, 1800);
      return;
    }

    if (!selectedScenarioId) {
      setErrorMessage("Silakan pilih salah satu skenario kasus dari dropdown di bawah.");
      return;
    }

    const preset = SCENARIO_PRESETS.find((s) => s.id === selectedScenarioId) || SCENARIO_PRESETS[0];

    setIsScrapingSimulation(true);
    setScrapingProgress(15);
    setActiveChannelIndex(0);

    setTimeout(() => {
      setScrapingProgress(38);
      setActiveChannelIndex(1);
    }, 450);

    setTimeout(() => {
      setScrapingProgress(62);
      setActiveChannelIndex(2);
    }, 900);

    setTimeout(() => {
      setScrapingProgress(84);
      setActiveChannelIndex(3);
    }, 1350);

    setTimeout(() => {
      setScrapingProgress(100);
      setActiveChannelIndex(4);
    }, 1800);

    setTimeout(() => {
      // Ensure scenario case exists in state.cases with evidence & nodes populated!
      actions.ensureScenarioCase(preset.id);

      // If KAS-103 is draft with 0 evidence, ensure it is primed with its scraped evidence & start review
      if (preset.id === "KAS-103") {
        const existingEv = actions.listEvidence("KAS-103");
        const evCount = "evidence" in existingEv ? existingEv.evidence.length : 0;
        if (evCount === 0) {
          actions.recordEvidence("KAS-103", {
            sourceId: "SRC-PUB",
            kind: "public_post",
            sourceRef: "https://tiktok.example/@lensa_lapangan_09/video/739120",
            title: "[TikTok] @lensa_lapangan_09: Video Iring-iringan Ranpur Panser Anoa Melintas",
            excerpt:
              "Video potongan konvoi 4 unit ranpur dengan caption provokatif mengklaim perbatasan darurat militer.",
            occurredAt: "2026-11-17T08:10:00+07:00",
            broadRegion: "Barat",
          });
          actions.recordEvidence("KAS-103", {
            sourceId: "SRC-PUB",
            kind: "public_post",
            sourceRef: "https://x.example/warga_borneo/status/17921",
            title: "[X] @warga_borneo: Konfirmasi Latihan Rutin Ranpur Batalyon",
            excerpt:
              "Warga setempat mengklarifikasi bahwa konvoi merupakan pergeseran materiil latihan tahunan biasa.",
            occurredAt: "2026-11-17T08:18:00+07:00",
            broadRegion: "Barat",
          });
        }
        actions.startReview("KAS-103");
      }

      // If KAS-102 and current user is U-AN, ensure analyst is assigned so they have full access
      if (preset.id === "KAS-102") {
        actions.takeOverCase("KAS-102");
      }

      setCreateModalOpen(false);
      setIsScrapingSimulation(false);
      router.push(`/kasus/${preset.id}`);
    }, 2200);
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return {
          label: "Draft Awal",
          classes: "bg-slate-700/60 text-slate-300 border-slate-600",
        };
      case "in_review":
        return {
          label: "Dalam Peninjauan",
          classes: "bg-blue-600/30 text-blue-300 border-blue-500/40",
        };
      case "awaiting_verification":
        return {
          label: "Menunggu Verifikasi",
          classes: "bg-amber-600/30 text-amber-300 border-amber-500/40",
        };
      case "closed":
        return {
          label: "Selesai (Naskah Sah)",
          classes: "bg-emerald-600/30 text-emerald-300 border-emerald-500/40",
        };
      default:
        return {
          label: status,
          classes: "bg-slate-700 text-slate-300 border-slate-600",
        };
    }
  };

  const currentPreset =
    SCENARIO_PRESETS.find((s) => s.id === selectedScenarioId) || SCENARIO_PRESETS[0];

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#F0BC79]/20 text-[#F0BC79] border border-[#F0BC79]/30 font-bold">
              MODUL INVESTIGASI
            </span>
            <span className="text-xs text-slate-400">Total: {cases.length} Kasus Terdata</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Daftar Kasus Analisis Digital
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen berkas kasus, investigasi jaringan akun anonim, verifikasi lapangan, dan
            penerbitan naskah dinas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              actions.clearCasesDemo();
            }}
            title="Kosongkan seluruh kasus untuk demonstrasi mulai dari sesi bersih"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Sesi Bersih (0 Kasus)</span>
          </button>

          <button
            onClick={() => {
              actions.resetDemo();
            }}
            title="Muat ulang seluruh data fixture demo Kodiklat"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Muat Ulang Seed</span>
          </button>

          <button
            onClick={() => {
              setErrorMessage("");
              setSelectedScenarioId("");
              setIsCustomMode(false);
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Inisiasi Kasus Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111A2E] p-4 rounded-2xl border border-[#1E2E4A] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan ID kasus, judul, atau kata kunci..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#1E2E4A] bg-[#0D1527] text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0BC79] text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-[#1E2E4A] bg-[#0D1527] text-slate-200 text-xs font-semibold focus:outline-hidden"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft Awal</option>
            <option value="in_review">Dalam Peninjauan</option>
            <option value="awaiting_verification">Menunggu Verifikasi</option>
            <option value="closed">Selesai (Ditutup)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-xl border border-[#1E2E4A] bg-[#0D1527] text-slate-200 text-xs font-semibold focus:outline-hidden"
          >
            <option value="">Semua Kategori</option>
            <option value="edaran">Edaran / Dokumen</option>
            <option value="tautan">Tautan Phishing</option>
            <option value="konteks_video">Manipulasi Video</option>
          </select>
        </div>
      </div>

      {/* Case Grid Cards */}
      {cases.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#111A2E] border border-dashed border-[#1E2E4A] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F0BC79]/10 border border-[#F0BC79]/20 flex items-center justify-center mx-auto text-[#F0BC79]">
            <FileSearch className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Belum Ada Kasus Investigasi Aktif</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Daftar kasus saat ini kosong (sesi bersih). Silakan klik tombol di bawah untuk membuat
              kasus baru dengan memilih skenario kasus dari dropdown dan menarik data digital secara
              langsung.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setSelectedScenarioId("");
              setIsCustomMode(false);
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mulai Buat Kasus Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c) => {
            const badge = getStatusBadge(c.status);
            return (
              <Link
                key={c.id}
                href={`/kasus/${c.id}`}
                className="bg-[#111A2E] hover:bg-[#15223D] border border-[#1E2E4A] hover:border-[#F0BC79]/60 p-5 rounded-2xl transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#F0BC79] px-2 py-0.5 rounded bg-[#151E36] border border-[#2A3756]">
                      {c.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#F0BC79] transition-colors line-clamp-2">
                      {c.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-1 capitalize flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Kategori: {c.category.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0D1527] border border-[#1E2E4A] space-y-1 text-[11px] text-slate-300 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Analis:</span>
                      <span className="text-white font-semibold truncate max-w-[140px]">
                        {c.analystIds.join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Kebijakan Verifikasi:</span>
                      <span className="text-[#F0BC79] font-semibold">
                        {c.verificationPolicy === "required" ? "Wajib (Required)" : "Opsional"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E2E4A] flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatWib(c.updatedAt)}</span>
                  <span className="text-[#F0BC79] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Buka Kasus &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal: Inisiasi Kasus Berbasis Skenario Intelijen Terpadu */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#111A2E] text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#1E2E4A] space-y-4 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F0BC79]/20 text-[#F0BC79] border border-[#F0BC79]/30">
                  <Sparkles className="w-5 h-5 text-[#F0BC79]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Inisiasi & Analisis Kasus Intelijen Digital
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pilih skenario kasus siap pakai yang langsung terisi linimasa, graf, dan deep
                    profiling.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Live Scraping Simulation Overlay */}
            {isScrapingSimulation ? (
              <div className="py-6 px-4 space-y-6 text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-[#F0BC79]/20 border-t-[#F0BC79] animate-spin" />
                  <Radio className="w-8 h-8 text-[#F0BC79] absolute animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-xs uppercase tracking-widest text-[#F0BC79] font-bold">
                    [Live OSINT & Web Scraper Engine]
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Menarik Data Digital Lintas Platform...
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Crawler aktif mengumpulkan bukti dari X (Twitter), Facebook, TikTok, dan portal
                    berita nasional beserta relasi 20 akun.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 max-w-md mx-auto">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Progres Pengambilan:</span>
                    <span className="text-[#F0BC79] font-bold">{scrapingProgress}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-[#F0BC79] transition-all duration-300"
                      style={{ width: `${scrapingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Scraping Channels Stepper Status */}
                <div className="bg-[#0D1527] border border-[#1E2E4A] rounded-2xl p-4 text-left space-y-2.5 max-w-md mx-auto">
                  {SCRAPER_CHANNELS.map((ch, idx) => {
                    const isDone = idx < activeChannelIndex || scrapingProgress === 100;
                    const isCurrent = idx === activeChannelIndex && scrapingProgress < 100;
                    return (
                      <div
                        key={ch.name}
                        className={`flex items-start gap-2.5 text-xs transition-opacity ${
                          isCurrent
                            ? "text-white font-bold"
                            : isDone
                              ? "text-slate-300"
                              : "text-slate-600 opacity-40"
                        }`}
                      >
                        <span className="text-base shrink-0">{ch.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">{ch.name}</span>
                            {isDone && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                            {isCurrent && (
                              <Loader2 className="w-3.5 h-3.5 text-[#F0BC79] animate-spin shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{ch.status}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Mode Switcher */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className={`p-3 rounded-2xl border text-left font-bold transition ${
                      !isCustomMode
                        ? "bg-[#15223D] border-[#F0BC79] text-[#F0BC79] ring-1 ring-[#F0BC79]/40"
                        : "bg-[#0D1527] border-[#1E2E4A] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[#F0BC79]">
                      <Sparkles className="w-4 h-4" />
                      <span>Skenario Kasus Lengkap (Rekomendasi)</span>
                    </div>
                    <div className="text-[11px] font-normal text-slate-300 mt-1">
                      Semua bukti linimasa, graf 20 akun, dan deep profiling seluler BTS langsung
                      terintegrasi.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCustomMode(true)}
                    className={`p-3 rounded-2xl border text-left font-bold transition ${
                      isCustomMode
                        ? "bg-[#15223D] border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40"
                        : "bg-[#0D1527] border-[#1E2E4A] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <Layers className="w-4 h-4" />
                      <span>Inisiasi Kasus Manual Dari Nol</span>
                    </div>
                    <div className="text-[11px] font-normal text-slate-300 mt-1">
                      Ketik judul dan kategori baru untuk kasus investigasi independen.
                    </div>
                  </button>
                </div>

                {/* Content for Scenario Mode */}
                {!isCustomMode ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">
                        Pilih Kasus Investigasi (Dropdown):
                      </label>
                      <select
                        value={selectedScenarioId}
                        onChange={(e) => setSelectedScenarioId(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#1E2E4A] bg-[#0D1527] text-xs text-white font-semibold focus:outline-hidden focus:border-[#F0BC79]"
                      >
                        <option value="">
                          -- Pilih Skenario Kasus Intelijen (Form Dikosongkan) --
                        </option>
                        {SCENARIO_PRESETS.map((scenario) => (
                          <option key={scenario.id} value={scenario.id}>
                            [{scenario.code}] {scenario.title} — Target: {scenario.targetAccount} (
                            {scenario.categoryLabel})
                          </option>
                        ))}
                      </select>
                    </div>

                    {!selectedScenarioId ? (
                      <div className="p-8 rounded-2xl bg-[#0D1527] border border-dashed border-[#1E2E4A] text-center space-y-2">
                        <Sparkles className="w-8 h-8 text-[#F0BC79] mx-auto opacity-70" />
                        <div className="font-bold text-white text-xs">
                          Formulir Kasus Dikosongkan
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          Silakan pilih salah satu skenario kasus pada dropdown di atas. Setelah
                          dipilih, klik tombol <strong>Mulai Analisa</strong> untuk menjalankan
                          crawler data digital lintas media.
                        </p>
                      </div>
                    ) : (
                      /* Scenario Rich Preview Card */
                      <div className="p-4 rounded-2xl bg-[#0D1527] border border-[#1E2E4A] space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-[#F0BC79]/20 text-[#F0BC79] border border-[#F0BC79]/30 px-2.5 py-0.5 rounded">
                              {currentPreset.code}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40 font-mono">
                              {currentPreset.categoryLabel}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/40 font-bold">
                              {currentPreset.severity}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Scraper Siap Dijalankan
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white leading-snug">
                          {currentPreset.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {currentPreset.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#1E2E4A] text-[11px]">
                          <div className="p-2.5 rounded-xl bg-[#111A2E] border border-[#1E2E4A] space-y-1">
                            <div className="text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#F0BC79]" />
                              <span>Linimasa Bukti:</span>
                            </div>
                            <div className="text-white font-bold">
                              {currentPreset.evidenceCount} Rekaman Bukti
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {currentPreset.evidenceSummary}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#111A2E] border border-[#1E2E4A] space-y-1">
                            <div className="text-slate-400 flex items-center gap-1">
                              <Network className="w-3 h-3 text-cyan-400" />
                              <span>Graf Hubungan:</span>
                            </div>
                            <div className="text-white font-bold">{currentPreset.graphSummary}</div>
                            <div className="text-[10px] text-slate-400">
                              Pemetaan 20 akun buzzer & penyebar
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#111A2E] border border-[#1E2E4A] space-y-1">
                            <div className="text-slate-400 flex items-center gap-1">
                              <Fingerprint className="w-3 h-3 text-purple-400" />
                              <span>Deep Profiling BTS:</span>
                            </div>
                            <div className="text-[#F0BC79] font-mono font-bold">
                              {currentPreset.targetAccount}
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {currentPreset.targetLocation}
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>
                            <strong>Highlight Forensik Terkoneksi:</strong>{" "}
                            {currentPreset.deepProfilingSnippet}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Judul Kasus / Insiden:
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Contoh: Investigasi Disinformasi Unggahan..."
                        className="w-full p-2.5 rounded-xl border border-[#1E2E4A] bg-[#0D1527] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0BC79]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Kategori Kasus:
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#1E2E4A] bg-[#0D1527] text-xs text-white focus:outline-hidden"
                      >
                        <option value="edaran">Edaran / Dokumen Palsu</option>
                        <option value="tautan">Tautan Phishing / Form Ilegal</option>
                        <option value="konteks_video">Manipulasi Konteks Video Latihan</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E2E4A]">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunchScenario}
                    disabled={!isCustomMode && !selectedScenarioId}
                    className="px-6 py-2.5 bg-[#F0BC79] hover:bg-[#e0ac69] disabled:opacity-40 disabled:cursor-not-allowed text-[#151E36] font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>🚀 Mulai Analisa Kasus (Jalankan Scraper)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
