"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDigitalAnalysis } from "../context";
import { AccessDenied } from "./AccessDenied";
import { EvidenceTimeline } from "./EvidenceTimeline";
import { EvidenceGraph } from "./EvidenceGraph";
import { ReportWorkspaceView } from "./ReportWorkspaceView";
import { DeepProfilingView } from "./DeepProfilingView";
import {
  SCRAPED_INTELLIGENCE_FEED,
  ScrapedIntelligenceItem,
  getScrapedItemsForCase,
} from "../scraper-fixtures";
import { getAnonymousProfile } from "../profiling-fixtures";
import {
  Network,
  CheckCircle2,
  FileText,
  Clock,
  PlusCircle,
  Send,
  AlertTriangle,
  Play,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Radio,
  Sparkles,
  Search,
  Check,
  ExternalLink,
  Heart,
  Share2,
  CheckSquare,
  Fingerprint,
  Zap,
  Printer,
} from "lucide-react";

export type CaseStep = "step1" | "step2" | "step3";
export type LegacyCaseTab = "timeline" | "graph" | "profiling" | "verification" | "report";
export type CaseTab = CaseStep | LegacyCaseTab;

interface CaseWorkspaceViewProps {
  caseId: string;
  defaultTab?: CaseTab;
}

export function CaseWorkspaceView({ caseId, defaultTab = "step1" }: CaseWorkspaceViewProps) {
  const { currentRole, currentUser, switchRole, actions, demoActionsConfig } = useDigitalAnalysis();
  const [tab, setTab] = useState<CaseTab>(defaultTab);

  const initialTargetHandle =
    caseId === "KAS-101"
      ? "@bambang_p_real"
      : caseId === "KAS-102"
        ? "@link_rekrutmen_palsu"
        : caseId === "KAS-103"
          ? "@lensa_lapangan_09"
          : "@bambang_p_real";

  // Step 2 Internal Toggle & Target Account
  const [step2View, setStep2View] = useState<"graph" | "profiling">("graph");
  const [selectedProfilingAccount, setSelectedProfilingAccount] =
    useState<string>(initialTargetHandle);

  // Modals
  const [addEvidenceModalOpen, setAddEvidenceModalOpen] = useState(false);
  const [requestVerificationModalOpen, setRequestVerificationModalOpen] = useState(false);

  // Intake & Scraper modal states
  const [intakeTab, setIntakeTab] = useState<"scraper" | "profiling" | "manual">("scraper");
  const [scraperSearch, setScraperSearch] = useState("");
  const [scraperPlatform, setScraperPlatform] = useState<string>("all");
  const [selectedScraperIds, setSelectedScraperIds] = useState<string[]>([]);
  const [showGlobalScraperFeed, setShowGlobalScraperFeed] = useState(false);

  // Add evidence form state (Manual physical doc)
  const [newKind, setNewKind] = useState<"public_post" | "internal_document">("public_post");
  const [newSourceId, setNewSourceId] = useState("SRC-PUB");
  const [newSourceRef, setNewSourceRef] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newOccurredAt, setNewOccurredAt] = useState("2026-11-17T08:00:00+07:00");
  const [newRegion, setNewRegion] = useState<"Barat" | "Tengah" | "Timur" | null>(null);

  // Request verification form state
  const [reqAssignee, setReqAssignee] = useState(demoActionsConfig.requestTemplate.assigneeId);
  const [reqQuestion, setReqQuestion] = useState("");
  const [reqEvidenceIds, setReqEvidenceIds] = useState<string[]>([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1. Fetch case with authorization check
  const caseRes = actions.getCase(caseId);
  if ("error" in caseRes) {
    return (
      <AccessDenied
        title="Akses Ditolak (403 Forbidden)"
        message={`Sesuai prinsip kompartemenisasi intelijen digital Kodiklat TNI, akun Anda (${currentUser.name}) tidak memiliki hak akses atau keanggotaan pada kasus ${caseId}.`}
        backHref="/kasus"
        backLabel="Kembali ke Daftar Kasus Berizin"
      />
    );
  }

  const caseItem = caseRes.case;

  // 2. Fetch evidence list
  const evRes = actions.listEvidence(caseId);
  const evidenceList = "evidence" in evRes ? evRes.evidence : [];

  // 3. Fetch graph
  const graphRes = actions.getGraph(caseId);
  const graphNodes = "nodes" in graphRes ? graphRes.nodes : [];
  const graphEdges = "edges" in graphRes ? graphRes.edges : [];

  // 4. Fetch verification requests
  const vReqsRes = actions.listVerificationRequests();
  const allReqs = "requests" in vReqsRes ? vReqsRes.requests : [];
  const caseVerificationRequests = allReqs.filter((r) => r.caseId === caseId);

  // Status indicators
  const isDraft = caseItem.status === "draft";
  const isInReview = caseItem.status === "in_review";
  const isAwaitingVerification = caseItem.status === "awaiting_verification";

  // Scraper items scoped to current case or global radar
  const directCaseScopedItems = getScrapedItemsForCase(caseId, caseItem.category, false);
  const activeScrapedPool = getScrapedItemsForCase(
    caseId,
    caseItem.category,
    showGlobalScraperFeed
  );
  const filteredScrapedItems = activeScrapedPool.filter((item) => {
    const matchSearch =
      !scraperSearch ||
      item.title.toLowerCase().includes(scraperSearch.toLowerCase()) ||
      item.content.toLowerCase().includes(scraperSearch.toLowerCase()) ||
      item.accountHandle.toLowerCase().includes(scraperSearch.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(scraperSearch.toLowerCase()));
    const matchPlatform = scraperPlatform === "all" || item.platform === scraperPlatform;
    return matchSearch && matchPlatform;
  });

  const uningestedInView = filteredScrapedItems.filter(
    (item) => !evidenceList.some((e) => e.sourceRef === item.url)
  );

  const hasDossierA = evidenceList.some((e) => e.sourceRef.includes("@akun_contoh_a"));
  const hasDossierB = evidenceList.some((e) => e.sourceRef.includes("@akun_contoh_b"));

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

  // Handlers
  const handleStartReview = () => {
    setErrorMessage("");
    const res = actions.startReview(caseId);
    if ("error" in res) {
      setErrorMessage(res.message || res.error);
    } else {
      setSuccessMessage("Status kasus berhasil diubah menjadi Dalam Peninjauan.");
    }
  };

  const handleRecordEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const res = actions.recordEvidence(caseId, {
      sourceId: newSourceId,
      kind: newKind,
      sourceRef: newSourceRef,
      title: newTitle,
      excerpt: newExcerpt,
      occurredAt: newOccurredAt,
      broadRegion: newRegion,
    });

    if ("error" in res) {
      setErrorMessage(res.message || res.error);
    } else {
      setSuccessMessage("Bukti baru berhasil dicatat dalam kasus.");
      setAddEvidenceModalOpen(false);
      setNewSourceRef("");
      setNewTitle("");
      setNewExcerpt("");
    }
  };

  const handleIngestSingleScraped = (item: ScrapedIntelligenceItem) => {
    setErrorMessage("");
    setSuccessMessage("");
    const res = actions.recordEvidence(caseId, {
      sourceId: "SRC-PUB",
      kind: "public_post",
      sourceRef: item.url,
      title: `[${item.platform}] ${item.accountHandle}: ${item.title}`,
      excerpt: item.content,
      occurredAt: item.occurredAt,
      broadRegion: item.broadRegion,
    });

    if ("evidence" in res) {
      setSuccessMessage(
        `Berhasil menarik bukti dari scraper ${item.platform} (${res.evidence.id}) ke Kasus ${caseId}.`
      );
    } else {
      setErrorMessage(res.message || "Gagal menarik bukti.");
    }
  };

  const handleBatchIngestScraped = () => {
    if (selectedScraperIds.length === 0) return;
    setErrorMessage("");
    setSuccessMessage("");
    let addedCount = 0;
    const itemsToIngest = SCRAPED_INTELLIGENCE_FEED.filter((i) =>
      selectedScraperIds.includes(i.id)
    );

    for (const item of itemsToIngest) {
      const res = actions.recordEvidence(caseId, {
        sourceId: "SRC-PUB",
        kind: "public_post",
        sourceRef: item.url,
        title: `[${item.platform}] ${item.accountHandle}: ${item.title}`,
        excerpt: item.content,
        occurredAt: item.occurredAt,
        broadRegion: item.broadRegion,
      });
      if ("evidence" in res) {
        addedCount++;
      }
    }

    setSelectedScraperIds([]);
    setSuccessMessage(
      `Berhasil melakukan batch ingest: ${addedCount} bukti dari pantauan scraper telah ditambahkan ke Kasus ${caseId}.`
    );
  };

  const handleIngestDossier = (handle: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    const p = getAnonymousProfile(handle);
    const res = actions.recordEvidence(caseId, {
      sourceId: "SRC-PUB",
      kind: "public_post",
      sourceRef: `${p.targetHandle} - Deep Profiling Forensik`,
      title: `Paket Profiling: ${p.targetHandle} (${p.stylometry.detectedDialect})`,
      excerpt: `Jejak OSINT teridentifikasi di ${p.footprint.length} platform. Triangulasi BTS terhubung di ${p.forensics.cellTowerLocation} (${p.forensics.estimatedCoordinates.lat}, ${p.forensics.estimatedCoordinates.lng}) dengan akurasi ±${p.forensics.estimatedCoordinates.accuracyMeters}m. NIK Kependudukan terduga: ${p.crossDb.nikCandidate || "Pencocokan Dukcapil"}.`,
      occurredAt: "2026-11-17T08:30:00+07:00",
      broadRegion: "Barat",
    });

    if ("evidence" in res) {
      setSuccessMessage(
        `Berhasil mengimpor seluruh paket temuan profiling ${handle} (${res.evidence.id}) ke Kasus ${caseId}.`
      );
    } else {
      setErrorMessage(res.message || "Gagal mengimpor profiling.");
    }
  };

  const handleOpenVerificationModal = () => {
    setErrorMessage("");
    setSuccessMessage("");

    // 1. Context-aware question tailored to this specific case
    let defaultQ = "";
    if (caseId === "KAS-101") {
      defaultQ = demoActionsConfig.requestTemplate.question;
    } else if (caseItem.category === "tautan") {
      defaultQ = `Mohon konfirmasi keabsahan domain tautan pendaftaran dan verifikasi status rekrutmen terkait kasus "${caseItem.title}" ke Staf Personel Kodiklat TNI.`;
    } else if (caseItem.category === "konteks_video") {
      defaultQ = `Mohon verifikasi rekaman video ranpur serta kebenaran konteks peristiwa di lapangan terkait kasus "${caseItem.title}".`;
    } else {
      defaultQ = `Mohon konfirmasi fakta operasional dan keabsahan dokumen rujukan terkait kasus "${caseItem.title}" ke instansi berwenang.`;
    }
    setReqQuestion(defaultQ);

    // 2. Default attached evidence: ONLY evidence from this case
    if (caseId === "KAS-101") {
      const hasEV01 = evidenceList.some((e) => e.id === "EV-01");
      const hasEV04 = evidenceList.some((e) => e.id === "EV-04");
      if (hasEV01 && hasEV04) {
        setReqEvidenceIds(["EV-01", "EV-04"]);
      } else {
        setReqEvidenceIds(evidenceList.map((e) => e.id));
      }
    } else {
      setReqEvidenceIds(evidenceList.map((e) => e.id));
    }

    setRequestVerificationModalOpen(true);
  };

  const handleRequestVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Filter evidence to strictly ensure only evidence from this case is submitted
    const caseOnlyEvidenceIds = reqEvidenceIds.filter((id) =>
      evidenceList.some((e) => e.id === id)
    );

    if (caseOnlyEvidenceIds.length === 0) {
      setErrorMessage("Pilih minimal 1 bukti dari linimasa kasus ini untuk dilampirkan.");
      return;
    }

    const res = actions.requestVerification({
      caseId,
      assigneeId: reqAssignee,
      question: reqQuestion.trim(),
      evidenceIds: caseOnlyEvidenceIds,
    });

    if ("error" in res) {
      setErrorMessage(res.message || res.error);
    } else {
      setSuccessMessage("Permintaan verifikasi berhasil diajukan ke Petugas Verifikasi.");
      setRequestVerificationModalOpen(false);
    }
  };

  const targetProfileHandle =
    caseId === "KAS-101"
      ? "@bambang_p_real"
      : caseId === "KAS-102"
        ? "@link_rekrutmen_palsu"
        : caseId === "KAS-103"
          ? "@lensa_lapangan_09"
          : "@bambang_p_real";

  const handleSimulateFastVerification = () => {
    setErrorMessage("");
    setSuccessMessage("");
    const res = actions.simulateFastVerification(caseId);
    if ("error" in res) {
      setErrorMessage(res.message || res.error);
    } else {
      setSuccessMessage(
        "Verifikasi lapangan berhasil disahkan secara resmi oleh Petugas Verifikasi (Mayor Cpm)!"
      );
    }
  };

  const activeStep: CaseStep =
    tab === "step1" || tab === "timeline"
      ? "step1"
      : tab === "step2" || tab === "graph" || tab === "profiling"
        ? "step2"
        : "step3";

  const isCaseClosed = caseItem.status === "closed";
  const isCaseApproved = isCaseClosed;
  const isCaseVerified = caseVerificationRequests.some((r) => r.status === "verified");

  const STEPS: {
    id: CaseStep;
    stepNumber: number;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "step1",
      stepNumber: 1,
      label: "Review Kasus & Bukti Scraping",
      sublabel: `${evidenceList.length} Bukti Terdata Lintas Media`,
      icon: Clock,
    },
    {
      id: "step2",
      stepNumber: 2,
      label: "Graf Jaringan & Deep Profiling",
      sublabel: `${graphNodes.length} Node Akun · Target: ${selectedProfilingAccount}`,
      icon: Network,
    },
    {
      id: "step3",
      stepNumber: 3,
      label: "Buat Laporan & Kirim Verifikator",
      sublabel: isCaseClosed
        ? "Naskah Sah Pimpinan"
        : isCaseApproved
          ? "Siap Cetak Naskah Dinas"
          : isCaseVerified
            ? "Fakta Disetujui (Meja Reviewer)"
            : isAwaitingVerification
              ? "Menunggu Validasi Lapangan"
              : "Draf Laporan Analis",
      icon: FileText,
    },
  ];

  const currentStepIndex = STEPS.findIndex((s) => s.id === activeStep);
  const prevStep = currentStepIndex > 0 ? STEPS[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex < STEPS.length - 1 ? STEPS[currentStepIndex + 1] : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation Back */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/kasus"
          className="inline-flex items-center gap-1.5 hover:text-[#151E36] font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Kasus</span>
        </Link>
        <div className="font-mono text-slate-400">
          Kasus: <strong className="text-slate-800">{caseItem.id}</strong> · Diperbarui:{" "}
          {formatWib(caseItem.updatedAt)}
        </div>
      </div>

      {/* Case Header Banner */}
      <div className="bg-[#151E36] text-white p-6 rounded-2xl shadow-md border border-[#2A3756]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono font-bold text-xs bg-white/20 text-white px-2 py-0.5 rounded">
                {caseItem.id}
              </span>
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Tema: {caseItem.category}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isDraft
                    ? "bg-slate-700 text-slate-300 border-slate-600"
                    : isInReview
                      ? "bg-blue-600/30 text-blue-300 border-blue-500/40"
                      : isAwaitingVerification
                        ? "bg-amber-600/30 text-amber-300 border-amber-500/40"
                        : "bg-emerald-600/30 text-emerald-300 border-emerald-500/40"
                }`}
              >
                {isDraft
                  ? "Draft Awal"
                  : isInReview
                    ? "Dalam Peninjauan (In Review)"
                    : isAwaitingVerification
                      ? "Menunggu Verifikasi Petugas"
                      : "Selesai & Ditutup"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Kebijakan Verifikasi:{" "}
                {caseItem.verificationPolicy === "required" ? "Wajib (Required)" : "Opsional"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {caseItem.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
              <span>
                Analis Ditugaskan:{" "}
                <strong className="text-white">{caseItem.analystIds.join(", ")}</strong>
              </span>
              <span>
                Reviewer:{" "}
                <strong className="text-white">
                  {caseItem.reviewerIds.join(", ") || "Belum ditugaskan"}
                </strong>
              </span>
              <span>
                Target Profiling:{" "}
                <strong className="text-[#F0BC79] font-mono">{targetProfileHandle}</strong>
              </span>
              <span>
                Total Bukti: <strong className="text-[#F0BC79]">{evidenceList.length}</strong>
              </span>
            </div>
          </div>

          {/* Primary Action Buttons depending on Case Status & Role */}
          <div className="flex flex-wrap items-center gap-2">
            {currentRole !== "analis" && (
              <button
                onClick={() => switchRole("analis")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F0BC79] font-bold text-xs transition-colors cursor-pointer"
                title="Beralih ke peran Analis (Letkol Kav)"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Beralih ke Analis (Letkol Kav)</span>
              </button>
            )}

            {isDraft && currentRole === "analis" && (
              <>
                <button
                  onClick={() => {
                    setErrorMessage("");
                    setSuccessMessage("");
                    setIntakeTab("scraper");
                    setAddEvidenceModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/40 transition-colors cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Intake & Scraper Bukti</span>
                </button>
                <button
                  onClick={handleStartReview}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Mulai Peninjauan</span>
                </button>
              </>
            )}

            {isInReview && currentRole === "analis" && (
              <>
                <button
                  onClick={() => {
                    setErrorMessage("");
                    setSuccessMessage("");
                    setIntakeTab("scraper");
                    setAddEvidenceModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/40 transition-colors cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Intake & Scraper Bukti</span>
                </button>
                <button
                  onClick={handleSimulateFastVerification}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#F0BC79] font-bold text-xs border border-amber-500/40 transition-colors cursor-pointer"
                  title="Verifikasi dokumen lapangan instan oleh Mayor Cpm"
                >
                  <Zap className="w-4 h-4 text-[#F0BC79]" />
                  <span>Verifikasi Cepat</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3-Step Stepper Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setTab(s.id)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? "bg-[#F0BC79] text-[#151E36] border-[#F0BC79] font-bold shadow-lg ring-2 ring-[#F0BC79]/40"
                    : "bg-[#0D1527] text-slate-300 border-[#1E2E4A] hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isActive
                        ? "bg-[#151E36] text-[#F0BC79]"
                        : "bg-[#151E36] text-slate-400 border border-[#2A3756]"
                    }`}
                  >
                    LANGKAH {s.stepNumber}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#151E36]" : "text-[#F0BC79]"}`} />
                </div>
                <div className="mt-2.5">
                  <div
                    className={`text-xs sm:text-sm font-bold leading-tight ${isActive ? "text-[#151E36]" : "text-white"}`}
                  >
                    {s.label}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 truncate ${
                      isActive ? "text-[#151E36]/90 font-medium" : "text-slate-400"
                    }`}
                  >
                    {s.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* KAS-103 Callout (Draft state with 0 evidence) */}
      {isDraft && evidenceList.length === 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2 shadow-xs">
          <div className="font-bold flex items-center gap-2 text-sm text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Syarat Peninjauan Belum Terpenuhi</span>
          </div>
          <p className="leading-relaxed text-amber-800">
            Kasus ini berstatus <strong className="font-mono">draft</strong> dan belum memiliki
            bukti terdata. Sesuai aturan bisnis, aksi <strong>Mulai Peninjauan</strong> memerlukan
            judul, kategori, dan minimal 1 rekaman bukti. Silakan tambahkan bukti awal terlebih
            dahulu melalui formulir di bawah.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setIntakeTab("scraper");
                setAddEvidenceModalOpen(true);
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Radio className="w-4 h-4 text-cyan-200" />
              <span>Tarik Otomatis dari Scraper Medsos / Video</span>
            </button>
            <button
              onClick={() => {
                setIntakeTab("manual");
                setAddEvidenceModalOpen(true);
              }}
              className="px-3 py-2 bg-amber-800 hover:bg-amber-900 text-amber-200 font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Manual Dokumen</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          WORKSPACE STEPS CONTENT
      ========================================================================== */}

      {/* =========================================================================
          WORKSPACE STEPS CONTENT (3 LANGKAH INVESTIGASI TERPADU)
      ========================================================================== */}

      {/* LANGKAH 1: REVIEW IDENTITAS KASUS & BUKTI HASIL SCRAPING */}
      {activeStep === "step1" && (
        <div className="space-y-6">
          <div className="bg-[#111A2E] p-4 sm:p-5 rounded-2xl border border-[#1E2E4A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-950/60 border border-blue-500/40 rounded-xl text-blue-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Langkah 1: Review Kasus & Bukti Hasil Scraping
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Verifikasi seluruh bukti linimasa yang ditarik otomatis dari X (Twitter),
                  Facebook, TikTok, dan Dokumen Puslatpur.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setIntakeTab("scraper");
                  setAddEvidenceModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>+ Tarik Bukti Scraper Medsos</span>
              </button>
              <button
                onClick={() => {
                  setIntakeTab("manual");
                  setAddEvidenceModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Input Bukti Fisik/Manual</span>
              </button>
              <button
                onClick={handleOpenVerificationModal}
                className="px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-[#F0BC79] border border-amber-500/40 font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ajukan Verifikasi Langsung</span>
              </button>
            </div>
          </div>

          <EvidenceTimeline evidenceList={evidenceList} />
        </div>
      )}

      {/* LANGKAH 2: GRAF JARINGAN & DEEP PROFILING AKUN */}
      {activeStep === "step2" && (
        <div className="space-y-6">
          {/* Step 2 Sub-Navigation Switcher */}
          <div className="bg-[#111A2E] p-4 sm:p-5 rounded-2xl border border-[#1E2E4A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-950/60 border border-purple-500/40 rounded-xl text-purple-300">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Langkah 2: Graf Jaringan Relasi Akun & Deep Profiling
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {step2View === "graph"
                    ? "Eksplorasi topologi 20 node akun warga & warta online. Klik node mana pun untuk membuka deep profiling seketika."
                    : `Dossier Deep Profiling lengkap untuk target ${selectedProfilingAccount}.`}
                </p>
              </div>
            </div>

            <div className="flex items-center bg-[#0D1527] p-1 rounded-xl border border-[#1E2E4A]">
              <button
                type="button"
                onClick={() => setStep2View("graph")}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                  step2View === "graph"
                    ? "bg-[#151E36] text-[#F0BC79] border border-[#2A3756] shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Graf Topologi (20 Node)</span>
              </button>
              <button
                type="button"
                onClick={() => setStep2View("profiling")}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                  step2View === "profiling"
                    ? "bg-[#151E36] text-[#F0BC79] border border-[#2A3756] shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Deep Profiling Akun</span>
              </button>
            </div>
          </div>

          {step2View === "graph" ? (
            <EvidenceGraph
              nodes={graphNodes}
              edges={graphEdges}
              evidenceList={evidenceList}
              caseId={caseId}
              onSelectNodeForProfiling={(handle) => {
                setSelectedProfilingAccount(handle);
                setStep2View("profiling");
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep2View("graph")}
                  className="inline-flex items-center gap-1.5 text-xs text-[#F0BC79] hover:underline font-bold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Kembali ke Visualisasi Graf Topologi Jaringan (20 Node)</span>
                </button>
                <span className="font-mono text-slate-400 text-xs">
                  Entitas Terpilih:{" "}
                  <strong className="text-[#F0BC79]">{selectedProfilingAccount}</strong>
                </span>
              </div>
              <DeepProfilingView
                key={`${caseId}-${selectedProfilingAccount}`}
                defaultHandle={selectedProfilingAccount}
                embeddedCaseId={caseId}
                hideHeaderBanner={true}
              />
            </div>
          )}
        </div>
      )}

      {/* LANGKAH 3: BUAT LAPORAN & KIRIM KE VERIFIKATOR LAPANGAN */}
      {activeStep === "step3" && (
        <ReportWorkspaceView
          caseItem={caseItem}
          evidenceList={evidenceList}
          verificationRequests={caseVerificationRequests}
        />
      )}

      {/* =========================================================================
          STEPPER FOOTER NAVIGATION
      ========================================================================== */}
      <div className="mt-8 pt-4 border-t border-[#1E2E4A] flex items-center justify-between gap-3 text-xs">
        {prevStep ? (
          <button
            onClick={() => setTab(prevStep.id)}
            className="px-4 py-2.5 rounded-xl bg-[#0D1527] hover:bg-slate-800 border border-[#1E2E4A] text-slate-300 hover:text-white font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              Kembali ke Langkah {prevStep.stepNumber}: {prevStep.label}
            </span>
          </button>
        ) : (
          <div />
        )}

        {nextStep ? (
          <button
            onClick={() => setTab(nextStep.id)}
            className="px-5 py-2.5 rounded-xl bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold flex items-center gap-2 transition shadow-md cursor-pointer"
          >
            <span>
              Lanjut Langkah {nextStep.stepNumber}: {nextStep.label}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-2 transition border border-slate-700 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Cetak Seluruh Berkas Kasus</span>
          </button>
        )}
      </div>

      {/* Modal: Pusat Intake & Koleksi Bukti Intelijen Digital */}
      {addEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#111A2E] text-white rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-[#1E2E4A] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-[#0B1224] border-b border-[#1E2E4A] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 px-2 py-0.5 rounded">
                      INTAKE ENGINE
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Kasus: {caseId}</span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    Pusat Koleksi & Scraper Bukti Intelijen Digital
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setAddEvidenceModalOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Tutup
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#1E2E4A] bg-[#0D1527] shrink-0 text-xs overflow-x-auto">
              <button
                onClick={() => setIntakeTab("scraper")}
                className={`px-4 py-2.5 font-bold border-b-2 flex items-center gap-2 transition ${
                  intakeTab === "scraper"
                    ? "border-[#F0BC79] text-[#F0BC79] bg-[#111A2E] rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Crawler / Scraper Medsos</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono font-bold">
                  {showGlobalScraperFeed
                    ? `${SCRAPED_INTELLIGENCE_FEED.length} Pantauan (Global)`
                    : `${directCaseScopedItems.length} Pantauan Kasus Ini`}
                </span>
              </button>

              <button
                onClick={() => setIntakeTab("profiling")}
                className={`px-4 py-2.5 font-bold border-b-2 flex items-center gap-2 transition ${
                  intakeTab === "profiling"
                    ? "border-[#F0BC79] text-[#F0BC79] bg-[#111A2E] rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Impor Hasil Deep Profiling Anonim</span>
              </button>

              <button
                onClick={() => setIntakeTab("manual")}
                className={`px-4 py-2.5 font-bold border-b-2 flex items-center gap-2 transition ${
                  intakeTab === "manual"
                    ? "border-[#F0BC79] text-[#F0BC79] bg-[#111A2E] rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Input Naskah Dinas Fisik (Manual)</span>
              </button>
            </div>

            {/* Modal Body Scroll Area */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: CRAWLER & SCRAPER MEDSOS */}
              {intakeTab === "scraper" && (
                <div className="space-y-4">
                  {/* Case Scoping Banner & Switcher */}
                  <div className="bg-[#0B1224] p-3.5 rounded-xl border border-cyan-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start md:items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0 mt-0.5 md:mt-0">
                        <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-bold">Target Scraper:</span>
                          <span className="font-mono text-cyan-300 font-extrabold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                            {caseItem.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            Kategori: {caseItem.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              !showGlobalScraperFeed
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            }`}
                          >
                            {!showGlobalScraperFeed
                              ? "✓ Mode Terisolasi Kasus Ini"
                              : "⚠ Mode Radar Global (Semua Kasus)"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {!showGlobalScraperFeed
                            ? `Radar dibatasi hanya untuk bahan pantauan yang terkait kasus ${caseItem.id} dan isu "${caseItem.category}".`
                            : "Menampilkan seluruh aliran scraper publik dari semua investigasi dan kategori secara agregat."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => setShowGlobalScraperFeed(false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          !showGlobalScraperFeed
                            ? "bg-cyan-500 text-slate-950 font-black shadow-md"
                            : "bg-[#111A2E] text-slate-400 border border-[#1E2E4A] hover:text-white"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Kasus Ini Saja ({directCaseScopedItems.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowGlobalScraperFeed(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          showGlobalScraperFeed
                            ? "bg-cyan-500 text-slate-950 font-black shadow-md"
                            : "bg-[#111A2E] text-slate-400 border border-[#1E2E4A] hover:text-white"
                        }`}
                      >
                        <span>Semua Kasus ({SCRAPED_INTELLIGENCE_FEED.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Top filter & search controls */}
                  <div className="bg-[#0D1527] p-3.5 rounded-xl border border-[#1E2E4A] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={scraperSearch}
                        onChange={(e) => setScraperSearch(e.target.value)}
                        placeholder="Filter kata kunci crawler (contoh: jadwal, kodiklat, pendaftaran, puslatpur)..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#111A2E] border border-[#1E2E4A] text-white placeholder-slate-400 focus:outline-none focus:border-[#F0BC79] text-xs font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400 text-[11px] font-bold">Platform:</span>
                      {(["all", "X", "Telegram", "NewsMedia", "TikTok"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setScraperPlatform(p)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            scraperPlatform === p
                              ? "bg-[#F0BC79] text-[#151E36]"
                              : "bg-[#111A2E] text-slate-300 border border-[#1E2E4A] hover:bg-[#16223b]"
                          }`}
                        >
                          {p === "all" ? "Semua Platform" : p}
                        </button>
                      ))}

                      {uningestedInView.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const uningestedIds = uningestedInView.map((i) => i.id);
                            const allSelected = uningestedIds.every((id) =>
                              selectedScraperIds.includes(id)
                            );
                            if (allSelected) {
                              setSelectedScraperIds(
                                selectedScraperIds.filter((id) => !uningestedIds.includes(id))
                              );
                            } else {
                              setSelectedScraperIds(
                                Array.from(new Set([...selectedScraperIds, ...uningestedIds]))
                              );
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1E2E4A] hover:bg-[#2A3E66] text-cyan-300 transition cursor-pointer"
                        >
                          {uningestedInView.every((i) => selectedScraperIds.includes(i.id))
                            ? "Batal Pilih Semua"
                            : `Pilih Semua (${uningestedInView.length})`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Batch Selection Action Bar */}
                  {selectedScraperIds.length > 0 && (
                    <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl flex items-center justify-between text-xs text-cyan-200 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                        <span>
                          <strong>{selectedScraperIds.length}</strong> bahan pantauan scraper
                          dipilih untuk ditarik sekaligus.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedScraperIds([])}
                          className="px-2.5 py-1 text-slate-400 hover:text-white cursor-pointer"
                        >
                          Batalkan Pilihan
                        </button>
                        <button
                          type="button"
                          onClick={handleBatchIngestScraped}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold shadow-md transition cursor-pointer"
                        >
                          Tarik {selectedScraperIds.length} Bukti Sekaligus
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Scraped Items List */}
                  <div className="space-y-3">
                    {filteredScrapedItems.map((item) => {
                      const alreadyInCase = evidenceList.some((e) => e.sourceRef === item.url);
                      const isSelected = selectedScraperIds.includes(item.id);

                      let platformBadge = (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          X (Twitter)
                        </span>
                      );
                      if (item.platform === "Telegram") {
                        platformBadge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Telegram
                          </span>
                        );
                      } else if (item.platform === "NewsMedia") {
                        platformBadge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Media Siber
                          </span>
                        );
                      } else if (item.platform === "TikTok") {
                        platformBadge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            TikTok Video
                          </span>
                        );
                      }

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border transition-all ${
                            alreadyInCase
                              ? "bg-[#0B1224]/70 border-[#1E2E4A] opacity-75"
                              : isSelected
                                ? "bg-[#16233d] border-[#F0BC79] ring-1 ring-[#F0BC79]/40"
                                : "bg-[#0D1527] border-[#1E2E4A] hover:border-slate-500"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1E2E4A]">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              {!alreadyInCase && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedScraperIds([...selectedScraperIds, item.id]);
                                    } else {
                                      setSelectedScraperIds(
                                        selectedScraperIds.filter((id) => id !== item.id)
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 rounded bg-[#111A2E] border-[#1E2E4A] text-[#F0BC79] focus:ring-0 cursor-pointer"
                                />
                              )}
                              {platformBadge}
                              <span className="font-bold text-white text-xs">
                                {item.accountName}
                              </span>
                              <span className="text-slate-400 font-mono text-xs">
                                {item.accountHandle}
                              </span>
                              {item.authorBadge && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                                  {item.authorBadge}
                                </span>
                              )}
                              {item.caseAssociation === caseId ? (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                                  🎯 Terkait Kasus Ini ({caseId})
                                </span>
                              ) : item.threatCategory === caseItem.category ? (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                                  Kategori Sama ({item.threatCategory})
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                                  Kasus Lain ({item.caseAssociation || "Umum"})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                              <span>{formatWib(item.occurredAt)}</span>
                              <span>·</span>
                              <span>
                                {item.broadRegion ? `Wilayah ${item.broadRegion}` : "Nasional"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="font-bold text-sm text-slate-100">{item.title}</div>
                            <div className="mt-1.5 p-3 rounded-lg bg-[#111A2E] border border-[#1E2E4A] text-xs text-slate-200 leading-relaxed font-sans italic">
                              &ldquo;{item.content}&rdquo;
                            </div>
                          </div>

                          {/* Metric bar & Actions */}
                          <div className="mt-3 pt-2.5 border-t border-[#1E2E4A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-4 text-slate-400 text-[11px] flex-wrap">
                              {item.metrics.views !== undefined && (
                                <span className="flex items-center gap-1">
                                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />{" "}
                                  {item.metrics.views.toLocaleString("id-ID")} Tayangan
                                </span>
                              )}
                              {item.metrics.shares !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />{" "}
                                  {item.metrics.shares.toLocaleString("id-ID")} Bagikan
                                </span>
                              )}
                              {item.metrics.likes !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3.5 h-3.5 text-rose-400" />{" "}
                                  {item.metrics.likes.toLocaleString("id-ID")} Suka
                                </span>
                              )}
                            </div>

                            <div>
                              {alreadyInCase ? (
                                <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-bold text-xs inline-flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5" /> Sudah Tercatat di Kasus
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleIngestSingleScraped(item)}
                                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Radio className="w-3.5 h-3.5 text-cyan-200" />
                                  <span>Tarik ke Kasus Ini</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredScrapedItems.length === 0 && (
                      <div className="p-8 text-center bg-[#0D1527] rounded-xl border border-dashed border-[#1E2E4A] space-y-3">
                        <Radio className="w-8 h-8 text-slate-600 mx-auto" />
                        <div className="text-sm font-bold text-slate-300">
                          Tidak Ada Pantauan Scraper yang Cocok
                        </div>
                        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                          {!showGlobalScraperFeed
                            ? `Saat ini ruang intake difilter khusus untuk kasus ${caseItem.id} (Kategori: ${caseItem.category}). Semua materi yang relevan mungkin sudah dimasukkan atau tidak ada crawler aktif untuk kata kunci ini.`
                            : "Tidak ada crawler scraper yang cocok dengan kata kunci atau platform yang dipilih."}
                        </p>
                        {!showGlobalScraperFeed && (
                          <button
                            type="button"
                            onClick={() => setShowGlobalScraperFeed(true)}
                            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer"
                          >
                            Tampilkan Radar Seluruh Kasus (Global Feed)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: IMPOR DEEP PROFILING ANONIM */}
              {intakeTab === "profiling" && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-950/30 border border-purple-800/50 rounded-xl text-xs text-purple-200 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white text-sm">
                        Enjin Deep Profiling Aktif (Sherlock + Maigret + Stylometry + BTS Krapyak)
                      </div>
                      <p className="mt-1 leading-relaxed text-slate-300">
                        Alih-alih menginput manual, Anda dapat langsung mengimpor seluruh paket
                        analisis forensik akun anonim ke kasus ini sebagai bukti rujukan otoritatif.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Profiling Dossier 1 */}
                    <div className="p-5 bg-[#0D1527] rounded-xl border border-[#1E2E4A] space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">
                            @akun_contoh_a
                          </span>
                          {caseId === "KAS-101" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                              Target Kasus {caseId}
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          RISIKO: 88/100 (KRITIS)
                        </span>
                      </div>
                      <div className="text-xs space-y-1.5 text-slate-300">
                        <div>
                          Peran: <strong>Inisiator Cuitan Jadwal Palsu</strong>
                        </div>
                        <div>
                          Dialek Terdeteksi: <strong>Jawa Tengah (Semarang)</strong>
                        </div>
                        <div>
                          Lokasi Sinyal BTS: <strong>Krapyak, Semarang Barat</strong>
                        </div>
                        <div>
                          Kandidat NIK Dukcapil: <code>3374************</code>
                        </div>
                      </div>
                      {hasDossierA ? (
                        <div className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-bold text-xs text-center flex items-center justify-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Dossier @akun_contoh_a Sudah Ada di Kasus</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleIngestDossier("@akun_contoh_a")}
                          className="w-full mt-2 py-2 px-3 rounded-lg bg-[#151E36] hover:bg-[#1f2b4c] text-[#F0BC79] font-bold text-xs border border-[#2A3756] transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-[#F0BC79]" />
                          <span>Tarik Paket Profiling @akun_contoh_a ke Kasus</span>
                        </button>
                      )}
                    </div>

                    {/* Profiling Dossier 2 */}
                    <div className="p-5 bg-[#0D1527] rounded-xl border border-[#1E2E4A] space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">
                            @akun_contoh_b
                          </span>
                          {caseId === "KAS-101" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                              Klaster Bot {caseId}
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          RISIKO: 74/100 (TINGGI)
                        </span>
                      </div>
                      <div className="text-xs space-y-1.5 text-slate-300">
                        <div>
                          Peran: <strong>Botnet Klaster Amplifikasi Cepat</strong>
                        </div>
                        <div>
                          Interval Retweet: <strong>&lt; 2 Detik (Otomatis)</strong>
                        </div>
                        <div>
                          Jangkauan Audiens: <strong>34.100 Pengikut</strong>
                        </div>
                        <div>
                          Status Forensik: <strong>Botnet Farm API Scripted</strong>
                        </div>
                      </div>
                      {hasDossierB ? (
                        <div className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-bold text-xs text-center flex items-center justify-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Dossier @akun_contoh_b Sudah Ada di Kasus</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleIngestDossier("@akun_contoh_b")}
                          className="w-full mt-2 py-2 px-3 rounded-lg bg-[#151E36] hover:bg-[#1f2b4c] text-[#F0BC79] font-bold text-xs border border-[#2A3756] transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-[#F0BC79]" />
                          <span>Tarik Paket Profiling @akun_contoh_b ke Kasus</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INPUT DOKUMEN INTERNAL / MANUAL */}
              {intakeTab === "manual" && (
                <form onSubmit={handleRecordEvidenceSubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-emerald-200">
                    Formulir ini khusus untuk mendaftarkan <strong>Naskah Dinas Fisik</strong>{" "}
                    (Surat Edaran Rahasia Kodiklat, Dokumen Rencana Latihan) yang tidak tersedia di
                    jaringan publik.
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Jenis Bahan Bukti:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewKind("internal_document");
                          setNewSourceId("SRC-INT");
                        }}
                        className={`p-2.5 rounded-lg border font-bold text-left transition-colors ${
                          newKind === "internal_document"
                            ? "bg-emerald-950/70 border-emerald-500 text-emerald-200"
                            : "bg-[#0D1527] border-[#1E2E4A] text-slate-400 hover:text-white"
                        }`}
                      >
                        📄 Dokumen Internal / Naskah Dinas Sah
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewKind("public_post");
                          setNewSourceId("SRC-PUB");
                        }}
                        className={`p-2.5 rounded-lg border font-bold text-left transition-colors ${
                          newKind === "public_post"
                            ? "bg-blue-950/70 border-blue-500 text-blue-200"
                            : "bg-[#0D1527] border-[#1E2E4A] text-slate-400 hover:text-white"
                        }`}
                      >
                        🌐 Dokumen Publik Ad-Hoc
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Judul Bukti:</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Contoh: Surat Edaran Komandan Kodiklat Jadwal Latihan Resmi"
                      className="w-full p-2.5 rounded-lg border border-[#1E2E4A] bg-[#0D1527] text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-[#F0BC79]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nomor Arsip / Tautan Rujukan:
                    </label>
                    <input
                      type="text"
                      value={newSourceRef}
                      onChange={(e) => setNewSourceRef(e.target.value)}
                      placeholder="Contoh: DOC-DEMO-03 atau NOMOR-SE-KODIKLAT-2026"
                      className="w-full p-2.5 rounded-lg border border-[#1E2E4A] bg-[#0D1527] text-white placeholder-slate-500 font-mono text-xs focus:outline-hidden focus:border-[#F0BC79]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Cuplikan Rujukan Resmi:
                    </label>
                    <textarea
                      rows={3}
                      value={newExcerpt}
                      onChange={(e) => setNewExcerpt(e.target.value)}
                      placeholder="Tuliskan bunyi poin naskah dinas resmi..."
                      className="w-full p-2.5 rounded-lg border border-[#1E2E4A] bg-[#0D1527] text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-[#F0BC79]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Waktu Kejadian / Penetapan (WIB):
                      </label>
                      <input
                        type="text"
                        value={newOccurredAt}
                        onChange={(e) => setNewOccurredAt(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-[#1E2E4A] bg-[#0D1527] text-white font-mono text-xs focus:outline-hidden"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Cakupan Wilayah:
                      </label>
                      <select
                        value={newRegion || ""}
                        onChange={(e) =>
                          setNewRegion(
                            (e.target.value as "Barat" | "Tengah" | "Timur" | "")
                              ? (e.target.value as "Barat" | "Tengah" | "Timur")
                              : null
                          )
                        }
                        className="w-full p-2.5 rounded-lg border border-[#1E2E4A] bg-[#0D1527] text-slate-200 text-xs focus:outline-hidden"
                      >
                        <option value="">Nasional / Berlaku Seluruh Wilayah</option>
                        <option value="Barat">Wilayah Barat</option>
                        <option value="Tengah">Wilayah Tengah</option>
                        <option value="Timur">Wilayah Timur</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E2E4A]">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold rounded-lg shadow-xs cursor-pointer"
                    >
                      Simpan Dokumen Fisik
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ajukan Permintaan Verifikasi */}
      {requestVerificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111A2E] text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#1E2E4A] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#F0BC79]" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Ajukan Permintaan Verifikasi Lapangan
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Kasus: <strong className="text-[#F0BC79]">{caseItem.id}</strong> —{" "}
                    {caseItem.title}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestVerificationModalOpen(false)}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestVerificationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Petugas Verifikasi Ditugaskan:
                </label>
                <select
                  value={reqAssignee}
                  onChange={(e) => setReqAssignee(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#1E2E4A] bg-[#0D1527] text-slate-200 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="U-VF">Petugas Verifikasi Demo (U-VF / Mayor Cpm)</option>
                  <option value="U-BACKGROUND-VF">Petugas Latar Demo (U-BACKGROUND-VF)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Pertanyaan yang Perlu Dijawab Petugas:
                </label>
                <textarea
                  rows={3}
                  value={reqQuestion}
                  onChange={(e) => setReqQuestion(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#1E2E4A] bg-[#0D1527] text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-[#F0BC79]"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">
                    Bukti Kasus {caseItem.id} yang Dilampirkan:
                  </label>
                  {evidenceList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = evidenceList.every((e) =>
                          reqEvidenceIds.includes(e.id)
                        );
                        if (allSelected) {
                          setReqEvidenceIds([]);
                        } else {
                          setReqEvidenceIds(evidenceList.map((e) => e.id));
                        }
                      }}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      {evidenceList.every((e) => reqEvidenceIds.includes(e.id))
                        ? "Batal Pilih Semua"
                        : "Pilih Semua Bukti"}
                    </button>
                  )}
                </div>

                {evidenceList.length === 0 ? (
                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs">
                    Kasus ini belum memiliki bukti di linimasa. Harap tarik bukti terlebih dahulu
                    melalui menu Intake & Scraper sebelum mengajukan verifikasi.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-[#1E2E4A] bg-[#0D1527] p-2.5 rounded-lg">
                    {evidenceList.map((ev) => (
                      <label
                        key={ev.id}
                        className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer hover:bg-white/5 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={reqEvidenceIds.includes(ev.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setReqEvidenceIds([...reqEvidenceIds, ev.id]);
                            } else {
                              setReqEvidenceIds(reqEvidenceIds.filter((id) => id !== ev.id));
                            }
                          }}
                          className="rounded text-[#F0BC79]"
                        />
                        <span className="font-mono font-bold text-[#F0BC79]">[{ev.id}]</span>
                        <span className="truncate">{ev.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E2E4A]">
                <button
                  type="button"
                  onClick={() => setRequestVerificationModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={evidenceList.length === 0 || reqEvidenceIds.length === 0}
                  className="px-4 py-2 bg-[#F0BC79] hover:bg-[#e0ac69] disabled:bg-slate-700 disabled:text-slate-500 text-[#151E36] font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Kirim Permintaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
