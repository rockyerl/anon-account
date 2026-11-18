"use client";

import React, { useState } from "react";
import { useDigitalAnalysis } from "../context";
import { DigitalCase, Evidence, Report, VerificationRequest, Role } from "../types";
import {
  FileText,
  CheckCircle2,
  RotateCcw,
  Printer,
  Sparkles,
  Lock,
  AlertCircle,
  FileCheck2,
  Award,
  Shield,
  QrCode,
  ArrowRight,
  UserCheck,
  Zap,
  Info,
} from "lucide-react";

interface ReportWorkspaceViewProps {
  caseItem: DigitalCase;
  evidenceList: Evidence[];
  verificationRequests: VerificationRequest[];
}

const ROLE_DISPLAY: Record<Role, { name: string; rank: string }> = {
  pimpinan: { name: "Pimpinan Demo", rank: "Mayjen TNI" },
  reviewer: { name: "Reviewer Demo", rank: "Kolonel Inf" },
  petugas_verifikasi: { name: "Petugas Verifikasi Demo", rank: "Mayor Cpm" },
  analis: { name: "Analis Demo", rank: "Letkol Kav" },
  admin_demo: { name: "Admin Demo", rank: "PNS IV/a" },
};

export function ReportWorkspaceView({
  caseItem,
  evidenceList,
  verificationRequests,
}: ReportWorkspaceViewProps) {
  const { currentRole, currentUser, switchRole, actions } = useDigitalAnalysis();

  const reportRes = actions.getReport(caseItem.id);
  const currentReport: Report | null = "report" in reportRes ? reportRes.report : null;
  const permittedEvidence = "permittedEvidence" in reportRes ? reportRes.permittedEvidence : null;

  // Form states for Analyst
  const [summary, setSummary] = useState(currentReport?.snapshot.summary || "");
  const [limitations, setLimitations] = useState(currentReport?.snapshot.limitations || "");
  const [proposedClarification, setProposedClarification] = useState(
    currentReport?.snapshot.proposedClarification || ""
  );
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>(
    currentReport?.snapshot.evidenceIds ||
      (caseItem.id === "KAS-101" ? ["EV-01", "EV-04"] : evidenceList.map((e) => e.id))
  );
  const [acknowledgedVerification, setAcknowledgedVerification] = useState(false);

  // Form states for Reviewer
  const [reviewNote, setReviewNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isVerified = verificationRequests.some((r) => r.status === "verified");
  const latestVerification =
    verificationRequests.find((r) => r.status === "verified") || verificationRequests[0];

  const isAssignedAnalyst = caseItem.analystIds.includes(currentUser.id);

  // Helper to generate deterministic summary
  const handleGenerateSummary = () => {
    const validEvidenceIds = selectedEvidenceIds.filter((id) =>
      evidenceList.some((e) => e.id === id)
    );
    const idsToUse = validEvidenceIds.length > 0 ? validEvidenceIds : evidenceList.map((e) => e.id);
    const generated = actions.generateDeterministicSummary(caseItem.id, idsToUse);
    setSummary(generated.summary);
    setLimitations(generated.limitations);
    setProposedClarification(generated.proposedClarification);
    setSelectedEvidenceIds(idsToUse);
    setErrorMessage("");
    setSuccessMessage("Ringkasan deterministik berhasil diisi dari bukti terpilih kasus ini.");
  };

  // 1-Click Fast Verification for demo convenience
  const handleFastVerification = () => {
    setErrorMessage("");
    const res = actions.simulateFastVerification(caseItem.id);
    if ("error" in res) {
      setErrorMessage(res.message || res.error);
    } else {
      setAcknowledgedVerification(true);
      setSuccessMessage(
        "Verifikasi lapangan berhasil disimulasikan secara resmi oleh Petugas Verifikasi (Mayor Cpm)!"
      );
    }
  };

  // Take over assignment for demo cases like KAS-102
  const handleTakeOverCase = () => {
    setErrorMessage("");
    const res = actions.takeOverCase(caseItem.id);
    if ("error" in res) {
      setErrorMessage(res.message || res.error);
    } else {
      setSuccessMessage(
        `Penugasan kasus ${caseItem.id} berhasil dialihkan kepada ${currentUser.name} (${currentUser.role}).`
      );
    }
  };

  // Submit report handler (Analyst)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Guard: Only analyst can submit
    if (currentRole !== "analis") {
      setErrorMessage(
        `Akses Ditolak: Peran aktif Anda adalah ${ROLE_DISPLAY[currentRole].name} (${ROLE_DISPLAY[currentRole].rank}). Pengajuan draf laporan merupakan wewenang khusus Analis Demo (Letkol Kav). Silakan beralih ke peran Analis.`
      );
      return;
    }

    if (!isAssignedAnalyst) {
      setErrorMessage(
        `Akses Ditolak: Anda belum terdaftar dalam penugasan kasus ini. Silakan klik tombol "Ambil Alih Penugasan" terlebih dahulu.`
      );
      return;
    }

    if (caseItem.verificationPolicy === "required" && !isVerified) {
      // 1. Save draft report
      const draftRes = actions.saveDraftReport({
        caseId: caseItem.id,
        summary,
        limitations,
        proposedClarification,
        evidenceIds: selectedEvidenceIds,
      });

      if ("error" in draftRes) {
        setErrorMessage(draftRes.message || draftRes.error);
        return;
      }

      // 2. Submit verification request to U-VF (Mayor Cpm)
      const vReq = actions.requestVerification({
        caseId: caseItem.id,
        assigneeId: "U-VF",
        question:
          "Verifikasi keabsahan dokumen edaran resmi Kodiklat dan fakta operasional terkait kasus ini.",
        evidenceIds: selectedEvidenceIds,
      });

      if ("error" in vReq && vReq.error !== "INVALID_TRANSITION") {
        setErrorMessage(vReq.message || vReq.error);
        return;
      }

      setSuccessMessage(
        "Draft laporan berhasil disimpan dan berkas bukti telah diajukan ke Petugas Verifikasi Lapangan (Mayor Cpm)! Silakan beralih ke peran Petugas Verifikasi untuk memvalidasi fakta."
      );
      return;
    }

    if (!acknowledgedVerification && caseItem.verificationPolicy === "required") {
      setErrorMessage(
        "Anda wajib mencentang pernyataan bahwa Anda telah membaca dan mengonfirmasi hasil verifikasi resmi."
      );
      return;
    }

    const res = actions.submitReport(caseItem.id, {
      summary,
      limitations,
      proposedClarification,
      evidenceIds: selectedEvidenceIds,
      verificationRequestId: latestVerification?.id,
    });

    if ("error" in res) {
      setErrorMessage(res.message || res.error);
    } else {
      setSuccessMessage(
        "Laporan berhasil diajukan ke Reviewer (Kolonel Inf) untuk penelaahan akhir! Status kasus kini telah diperbarui."
      );
    }
  };

  // Rapid Submit & Command Approval for quick demo presentation
  const handleRapidCommandApproval = () => {
    setErrorMessage("");
    setSuccessMessage("");

    // If analyst is not assigned, take over first
    if (!isAssignedAnalyst) {
      actions.takeOverCase(caseItem.id);
    }

    // Ensure fast verification exists
    let verId = latestVerification?.id;
    if (caseItem.verificationPolicy === "required" && !isVerified) {
      const verRes = actions.simulateFastVerification(caseItem.id);
      if ("request" in verRes) {
        verId = verRes.request.id;
        setAcknowledgedVerification(true);
      }
    }

    // Auto-generate deterministic content if empty
    let finalSummary = summary;
    let finalLimitations = limitations;
    let finalClarification = proposedClarification;
    let finalEvidenceIds = selectedEvidenceIds;

    if (!finalSummary.trim() || !finalLimitations.trim() || !finalClarification.trim()) {
      const validIds =
        selectedEvidenceIds.length > 0 ? selectedEvidenceIds : evidenceList.map((e) => e.id);
      const generated = actions.generateDeterministicSummary(caseItem.id, validIds);
      finalSummary = generated.summary;
      finalLimitations = generated.limitations;
      finalClarification = generated.proposedClarification;
      finalEvidenceIds = validIds;
      setSummary(finalSummary);
      setLimitations(finalLimitations);
      setProposedClarification(finalClarification);
      setSelectedEvidenceIds(finalEvidenceIds);
    }

    // Submit report as analyst
    const subRes = actions.submitReport(caseItem.id, {
      summary: finalSummary,
      limitations: finalLimitations,
      proposedClarification: finalClarification,
      evidenceIds: finalEvidenceIds,
      verificationRequestId: verId,
    });

    if ("error" in subRes) {
      setErrorMessage(subRes.message || subRes.error);
      return;
    }

    // Automatically review and approve report as Reviewer
    const revRes = actions.reviewReport({
      reportId: subRes.report.id,
      decision: "approved",
      note: "Disahkan resmi untuk penerbitan Naskah Dinas Komando Kodiklat TNI.",
    });

    if ("error" in revRes) {
      setErrorMessage(revRes.message || revRes.error);
    } else {
      setSuccessMessage(
        "Laporan berhasil diajukan dan langsung disahkan Komando! Naskah Dinas resmi ber-QR Code telah diterbitkan."
      );
      // Switch to pimpinan to view printed military memo
      switchRole("pimpinan");
    }
  };

  // Review handlers (Reviewer)
  const handleReviewAction = (decision: "approved" | "rejected") => {
    if (!currentReport) return;
    setErrorMessage("");
    setSuccessMessage("");

    const res = actions.reviewReport({
      reportId: currentReport.id,
      decision,
      note: reviewNote,
    });

    if ("error" in res) {
      setErrorMessage(res.message || res.error);
    } else {
      if (decision === "approved") {
        setSuccessMessage(
          "Laporan berhasil disetujui! Kasus resmi ditutup dan Naskah Dinas resmi siap diproyeksikan ke meja Pimpinan (Mayjen TNI)."
        );
      } else {
        setSuccessMessage(
          "Laporan berhasil dikembalikan ke Analis (Letkol Kav) dengan catatan revisi."
        );
      }
    }
  };

  const formatWib = (iso?: string) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return (
        d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) +
        " " +
        d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
        " WIB"
      );
    } catch {
      return iso;
    }
  };

  // =========================================================================
  // 1. Pimpinan Access Control & View (A-DEMO-09)
  // =========================================================================
  if (currentRole === "pimpinan") {
    if (!currentReport || currentReport.status !== "approved") {
      return (
        <div className="bg-[#111A2E] rounded-3xl border border-[#1E2E4A] p-8 sm:p-12 text-center shadow-xs space-y-6 text-slate-100">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#F0BC79] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">
              Materi Laporan Belum Disetujui Reviewer
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              Sesuai doktrin tata kelola komando Kodiklat TNI, materi draf laporan kasus{" "}
              <strong className="font-mono text-white">{caseItem.id}</strong> belum dapat
              diproyeksikan ke Meja Pimpinan karena masih dalam tahap penyusunan atau penelaahan
              Reviewer. Hanya snapshot laporan berstatus{" "}
              <strong className="text-emerald-400">Disetujui (Approved)</strong> yang akan
              diterbitkan sebagai Naskah Dinas resmi.
            </p>
          </div>

          <div className="p-4 bg-[#0D1527] rounded-2xl border border-[#1E2E4A] max-w-md mx-auto text-xs text-slate-300 space-y-3">
            <div className="font-semibold text-white flex items-center justify-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Jalur Simulasi Cepat (Demo Flow):</span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => switchRole("analis")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Beralih ke Analis (Letkol Kav) untuk Menyusun & Mengajukan</span>
              </button>
              <button
                type="button"
                onClick={() => switchRole("reviewer")}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-purple-300" />
                <span>Beralih ke Reviewer (Kolonel Inf) untuk Menelaah</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Approved view for Pimpinan (Print Ready Official Military Memo)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between print:hidden bg-[#151E36] text-white p-4 sm:p-5 rounded-2xl shadow-xl border border-[#2A3756]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-[#F0BC79]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Naskah Dinas Klarifikasi Pimpinan (Telah Disetujui)
              </div>
              <div className="text-xs text-slate-400">
                Kasus {caseItem.id} · Status Selesai / Siap Rilis
              </div>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F0BC79] hover:bg-[#e2aa63] text-[#151E36] font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Simpan sebagai PDF / Cetak</span>
          </button>
        </div>

        {/* Printable Official Document Sheet */}
        <div className="bg-white rounded-3xl border-2 border-slate-300 p-8 sm:p-14 shadow-2xl print:shadow-none print:border-none print:p-0 max-w-4xl mx-auto space-y-8 font-sans relative">
          {/* Official Letterhead */}
          <div className="text-center pb-6 border-b-2 border-slate-900 relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#151E36] flex items-center justify-center text-[#F0BC79] shadow-sm">
                <Shield className="w-7 h-7" />
              </div>
            </div>

            <div className="text-xs sm:text-sm font-bold text-slate-800 tracking-widest">
              MARKAS BESAR TENTARA NASIONAL INDONESIA
            </div>
            <div className="text-base sm:text-xl font-black text-slate-900 tracking-wider mt-0.5">
              KOMANDO PEMBINAAN DOKTRIN, PENDIDIKAN DAN LATIHAN
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Jalan Hegarmanah No. 152, Bandung 40141 · POKJA ANALISIS INFORMASI DAN JARINGAN
              DIGITAL
            </div>

            {/* Approved Stamp */}
            <div className="absolute top-0 right-0 border-2 border-emerald-700 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest rotate-6 opacity-90 hidden sm:flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>DISETUJUI PIMPINAN</span>
            </div>
          </div>

          {/* Document Title & Reference */}
          <div className="text-center">
            <div className="inline-block px-4 py-1 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-800 mb-2 border border-slate-200">
              NOMOR NASKAH: ND/KODIKLAT-TNI/{caseItem.id}/XI/2026
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              BAHAN PAPARAN & KLARIFIKASI RESMI PIMPINAN
            </h1>
            <div className="text-xs text-slate-500 mt-1.5 font-medium">
              Disetujui oleh Reviewer:{" "}
              <strong className="text-slate-800">{currentReport.approvedBy}</strong> pada{" "}
              {formatWib(currentReport.approvedAt)}
            </div>
          </div>

          {/* Section 1: Ringkasan Kejadian */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>I. Ringkasan Fakta & Disparitas Informasi</span>
              <span className="text-[10px] text-slate-500 font-mono">
                Klasifikasi: RAHASIA / TERBATAS
              </span>
            </h3>
            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-200">
              {currentReport.snapshot.summary}
            </div>
          </div>

          {/* Section 2: Hasil Verifikasi Otoritatif */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              II. Konfirmasi Jalur Verifikasi Resmi Kodiklat
            </h3>
            <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-2xl text-xs space-y-1.5">
              <div className="font-bold text-emerald-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>STATUS: TERVALIDASI SESUAI RUJUKAN SAH KODIKLAT TNI</span>
              </div>
              <p className="text-slate-800 leading-relaxed pt-1 font-sans">
                {latestVerification?.outcomeNote ||
                  "Hasil verifikasi otoritatif tercatat sah oleh Petugas Verifikasi."}
              </p>
            </div>
          </div>

          {/* Section 3: Rujukan Berizin Terlampir */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              III. Rujukan Bukti Sah (Proyeksi Pimpinan)
            </h3>
            <div className="space-y-2">
              {(permittedEvidence || []).map((pe) => (
                <div
                  key={pe.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900 mr-2 bg-slate-200 px-2 py-0.5 rounded">
                      [{pe.id}]
                    </span>
                    <span className="font-semibold text-slate-900">{pe.title}</span>
                    <span className="text-[10px] text-slate-500 ml-2">
                      ({pe.kind === "public_post" ? "Kanal Publik" : "Dokumen Internal Kodiklat"})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {formatWib(pe.occurredAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Batasan Temuan */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              IV. Batasan Temuan Intelijen Digital
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-200">
              {currentReport.snapshot.limitations}
            </p>
          </div>

          {/* Section 5: Usulan Keputusan & Klarifikasi */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 text-[#151E36]">
              V. Usulan Bahan Rilis Klarifikasi Pimpinan
            </h3>
            <div className="bg-amber-50/70 border-l-4 border-amber-500 p-5 rounded-r-2xl text-slate-900 text-xs leading-relaxed whitespace-pre-line font-medium shadow-xs">
              {currentReport.snapshot.proposedClarification}
            </div>
          </div>

          {/* Signatures & QR Code Footer */}
          <div className="pt-8 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-800">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <QrCode className="w-12 h-12 text-[#151E36]" />
              <div className="text-[10px] font-mono leading-tight">
                <div className="font-bold text-slate-900">VERIFIKASI INTEGRITAS DIGITAL</div>
                <div className="text-slate-500">ID: KODIKLAT-TNI-SEC-V1</div>
                <div className="text-emerald-700 font-bold mt-1">STATUS: OTENTIK (TERTUTUP)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <div className="text-slate-500 text-[11px]">Penyusun / Analis:</div>
                <div className="font-bold text-slate-900 mt-6">
                  {currentReport.authorId} (Analis Demo)
                </div>
                <div className="text-[10px] text-slate-400">Tim Intelijen Digital</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">Perwira Penelaah:</div>
                <div className="font-bold text-slate-900 mt-6">
                  {currentReport.approvedBy} (Reviewer Demo)
                </div>
                <div className="text-[10px] text-slate-400">Asisten Operasi Kodiklat</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. Reviewer View & Action Panel
  // =========================================================================
  if (currentRole === "reviewer") {
    return (
      <div className="space-y-6">
        {/* Role Notice */}
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-purple-900">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-purple-700 shrink-0" />
            <div>
              <span className="font-bold">Peran Aktif: Reviewer Demo (Kolonel Inf)</span>
              <p className="text-purple-700 text-[11px] mt-0.5">
                Anda bertugas memeriksa dan menyetujui draf laporan sebelum diserahkan kepada
                Pimpinan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchRole("analis")}
            className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shrink-0 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Beralih ke Analis (Letkol Kav)</span>
          </button>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center gap-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-2.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            {currentReport?.status === "approved" && (
              <button
                type="button"
                onClick={() => switchRole("pimpinan")}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>Beralih ke Pimpinan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* If Report is Submitted -> Reviewer Decision Form */}
        {currentReport && currentReport.status === "submitted" ? (
          <div className="bg-[#111A2E] border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-950/60 border border-purple-500/40 rounded-xl text-purple-300">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    Penelaahan Akhir Laporan Kasus {caseItem.id}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Versi Laporan: v{currentReport.version} · Diajukan oleh:{" "}
                    <strong className="text-white">{currentReport.authorId}</strong>
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-full uppercase">
                Menunggu Telaah
              </span>
            </div>

            {/* Snapshot Preview for Reviewer */}
            <div className="bg-[#0D1527] rounded-2xl p-5 border border-[#1E2E4A] space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Ringkasan Fakta & Kejadian:
                </span>
                <div className="bg-[#111A2E] p-3.5 rounded-xl border border-[#1E2E4A] text-slate-200 leading-relaxed">
                  {currentReport.snapshot.summary}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Batasan Temuan:
                </span>
                <div className="bg-[#111A2E] p-3.5 rounded-xl border border-[#1E2E4A] text-slate-300 italic">
                  {currentReport.snapshot.limitations}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Usulan Bahan Klarifikasi Pimpinan:
                </span>
                <div className="bg-[#111A2E] p-3.5 rounded-xl border border-[#1E2E4A] text-slate-200 leading-relaxed font-medium">
                  {currentReport.snapshot.proposedClarification}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Bukti yang Dirujuk ({currentReport.snapshot.evidenceIds.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentReport.snapshot.evidenceIds.map((eid) => (
                    <span
                      key={eid}
                      className="px-2.5 py-1 bg-[#111A2E] border border-[#1E2E4A] text-[#F0BC79] font-mono font-bold rounded-lg text-[11px]"
                    >
                      {eid}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Note Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Catatan Penelaahan Reviewer (Wajib diisi jika mengembalikan untuk revisi):
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Tuliskan catatan telaah resmi..."
                className="w-full p-3.5 rounded-xl border border-[#1E2E4A] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-400 bg-[#0D1527]"
              />
            </div>

            {/* Decision Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#1E2E4A]">
              <button
                type="button"
                onClick={() => handleReviewAction("rejected")}
                className="px-5 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kembalikan Laporan untuk Revisi</span>
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction("approved")}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui Laporan & Teruskan ke Pimpinan</span>
              </button>
            </div>
          </div>
        ) : currentReport && currentReport.status === "approved" ? (
          <div className="bg-[#111A2E] border-2 border-emerald-500/50 rounded-3xl p-8 text-center space-y-4 shadow-sm text-slate-100">
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Laporan Telah Disetujui (Approved)</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Laporan kasus ini telah disahkan oleh Reviewer dan resmi diproyeksikan ke Meja
              Pimpinan (Mayjen TNI) untuk pencetakan Naskah Dinas.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => switchRole("pimpinan")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <span>Beralih ke Meja Pimpinan untuk Melihat Naskah Dinas Cetak</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#111A2E] border border-[#1E2E4A] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xs text-slate-100">
            <div className="w-14 h-14 rounded-full bg-[#0D1527] border border-[#1E2E4A] text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">
              Draf Laporan Belum Diajukan oleh Analis
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Sesuai alur kerja Kodiklat TNI, draf materi laporan kasus{" "}
              <strong className="font-mono text-white">{caseItem.id}</strong> harus disusun dan
              diajukan oleh Analis Intelijen Digital (Letkol Kav) sebelum dapat ditelaah oleh
              Reviewer.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => switchRole("analis")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Beralih ke Peran Analis (Letkol Kav) untuk Menyusun Laporan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. Petugas Verifikasi Lapangan (Mayor Cpm) Validation Panel
  // =========================================================================
  if (currentRole === "petugas_verifikasi") {
    const handleVerifierApprove = () => {
      setErrorMessage("");
      setSuccessMessage("");

      // 1. Resolve verification
      let vId = latestVerification?.id;
      if (!vId) {
        const sim = actions.simulateFastVerification(caseItem.id);
        if ("request" in sim) {
          vId = sim.request.id;
        }
      } else {
        const res = actions.resolveVerification({
          requestId: vId,
          status: "verified",
          outcomeNote:
            latestVerification?.outcomeNote ||
            `Tervalidasi resmi: Petugas Lapangan (Mayor Cpm) mengonfirmasi keabsahan dokumen kedinasan dan membuktikan unggahan publik pada kasus ${caseItem.id} merupakan disinformasi.`,
        });
        if ("error" in res) {
          setErrorMessage(res.message || res.error);
          return;
        }
      }

      // 2. Advance report to submitted (naik ke Reviewer)
      const validIds =
        selectedEvidenceIds.length > 0 ? selectedEvidenceIds : evidenceList.map((e) => e.id);
      const generated = actions.generateDeterministicSummary(caseItem.id, validIds);

      actions.submitReport(caseItem.id, {
        summary: summary.trim() ? summary : generated.summary,
        limitations: limitations.trim() ? limitations : generated.limitations,
        proposedClarification: proposedClarification.trim()
          ? proposedClarification
          : generated.proposedClarification,
        evidenceIds: validIds,
        verificationRequestId: vId,
      });

      setSuccessMessage(
        "Fakta lapangan telah berhasil divalidasi dan disetujui (Approved)! Berkas laporan investigasi telah dinaikkan ke Meja Reviewer (Kolonel Inf)."
      );
    };

    const handleVerifierReject = () => {
      setErrorMessage("");
      setSuccessMessage("");
      if (latestVerification?.id) {
        actions.resolveVerification({
          requestId: latestVerification.id,
          status: "inconclusive",
          outcomeNote:
            "Hasil verifikasi lapangan: Tidak konklusif. Fakta di lapangan memerlukan penelusuran lebih lanjut.",
        });
        setSuccessMessage("Hasil verifikasi dicatat sebagai Tidak Konklusif.");
      }
    };

    return (
      <div className="space-y-6">
        {/* Role Banner */}
        <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <span className="font-bold">
                Peran Aktif: Petugas Verifikasi Lapangan (Mayor Cpm)
              </span>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Validasi keabsahan dokumen dan fakta di lapangan sebelum berkas dinaikkan ke
                Reviewer (Kolonel Inf).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchRole("analis")}
            className="px-3.5 py-1.5 rounded-xl bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold text-xs shrink-0 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Beralih ke Analis (Letkol Kav)</span>
          </button>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => switchRole("reviewer")}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Beralih ke Reviewer (Kolonel Inf) untuk Menelaah</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Validation Queue Card */}
        <div className="bg-[#111A2E] border-2 border-blue-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md text-slate-100">
          <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-950/60 border border-blue-500/40 rounded-xl text-blue-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">
                  Validasi Bukti & Fakta Lapangan: Kasus {caseItem.id}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tema: <strong className="text-white capitalize">{caseItem.category}</strong> ·
                  Status Kasus:{" "}
                  <strong className="text-[#F0BC79] uppercase">
                    {caseItem.status.replace("_", " ")}
                  </strong>
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full border uppercase ${
                isVerified
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-amber-950/60 border-amber-500/40 text-amber-300"
              }`}
            >
              {isVerified ? "Telah Disetujui (Verified)" : "Menunggu Validasi"}
            </span>
          </div>

          {/* Verification Question & Attached Evidence */}
          <div className="space-y-4 text-xs">
            <div className="bg-[#0D1527] p-4 rounded-2xl border border-[#1E2E4A] space-y-2">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Pertanyaan / Fokus Verifikasi Analis:
              </div>
              <div className="text-white font-semibold leading-relaxed">
                {latestVerification?.question ||
                  "Verifikasi keabsahan dokumen edaran kedinasan dan fakta operasional terkait temuan digital kasus ini."}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Daftar Bukti Digital yang Diajukan ({evidenceList.length} Bukti):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 bg-[#0D1527] rounded-xl border border-[#1E2E4A] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] bg-[#111A2E] text-[#F0BC79] px-2 py-0.5 rounded border border-[#1E2E4A] font-bold">
                        {ev.id}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {ev.kind === "public_post" ? "Unggahan Publik" : "Dokumen Internal"}
                      </span>
                    </div>
                    <div className="font-bold text-white line-clamp-1">{ev.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 italic">
                      &ldquo;{ev.excerpt}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Outcome Note */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
              <div className="text-emerald-300 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Konfirmasi Hasil Validasi Petugas Lapangan:</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {latestVerification?.outcomeNote ||
                  `Tervalidasi resmi: Petugas Lapangan (Mayor Cpm) mengonfirmasi keabsahan dokumen edaran asli Kodiklat TNI dan membuktikan bahwa disparitas jadwal pada unggahan publik merupakan disinformasi.`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1E2E4A]">
            <div className="text-xs text-slate-400">
              {isVerified
                ? "Fakta lapangan telah sah tervalidasi. Berkas telah naik ke Meja Reviewer."
                : "Klik Setujui untuk memvalidasi fakta lapangan dan langsung menaikkan berkas ke Reviewer."}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleVerifierReject}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                <span>Tidak Konklusif</span>
              </button>
              <button
                type="button"
                onClick={handleVerifierApprove}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✅ Validasi & Setujui (Naik ke Reviewer)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentRole === "admin_demo") {
    return (
      <div className="bg-[#111A2E] rounded-3xl border border-[#1E2E4A] p-8 sm:p-12 text-center shadow-xs space-y-6 text-slate-100">
        <div className="w-16 h-16 rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto">
          <Info className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-white">
            Penyusunan Laporan Terbatas untuk Analis & Reviewer
          </h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            Peran aktif Anda saat ini adalah{" "}
            <strong className="text-white">
              {ROLE_DISPLAY[currentRole].name} ({ROLE_DISPLAY[currentRole].rank})
            </strong>
            . Sesuai pemisahan kewenangan (Separation of Duties), silakan beralih peran untuk
            melanjutkan penelaahan.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => switchRole("analis")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Beralih ke Peran Analis (Letkol Kav)</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. Analyst View (Author of the Report)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          {caseItem.status === "awaiting_verification" ? (
            <button
              type="button"
              onClick={() => switchRole("petugas_verifikasi")}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Beralih ke Petugas Verifikasi (Mayor Cpm)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : currentReport?.status === "submitted" ? (
            <button
              type="button"
              onClick={() => switchRole("reviewer")}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Beralih ke Reviewer (Kolonel Inf) untuk Menelaah</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      )}

      {/* Case Assignment Alert if Analyst is not assigned */}
      {!isAssignedAnalyst && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Kompartemen Intelijen Tertutup:</span> Kasus ini tercatat
              ditugaskan kepada{" "}
              <strong className="font-mono text-slate-800">{caseItem.analystIds.join(", ")}</strong>
              .
            </div>
          </div>
          <button
            type="button"
            onClick={handleTakeOverCase}
            className="px-3.5 py-1.5 bg-[#151E36] hover:bg-[#1E293B] text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#F0BC79]" />
            <span>Ambil Alih Penugasan Kasus ke Letkol Kav</span>
          </button>
        </div>
      )}

      {/* Review History if any */}
      {currentReport?.reviewHistory && currentReport.reviewHistory.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Riwayat Penelaahan Reviewer:
          </div>
          {currentReport.reviewHistory.map((rev) => (
            <div
              key={rev.id}
              className="text-xs bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-2xs"
            >
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                  rev.action === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {rev.action === "approved" ? "Disetujui" : "Dikembalikan"}
              </span>
              <div>
                <div className="font-semibold text-slate-800">&ldquo;{rev.note}&rdquo;</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Oleh: {rev.reviewerId} pada {formatWib(rev.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Prerequisite Notice Card */}
      {caseItem.verificationPolicy === "required" && (
        <div
          className={`p-5 rounded-2xl border text-xs space-y-2 transition-colors ${
            isVerified
              ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
              : "bg-amber-50/80 border-amber-300 text-amber-950"
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-xs">
              {isVerified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700" />
              )}
              <span>
                {isVerified
                  ? "Verifikasi Lapangan Sah Terkonfirmasi"
                  : "Kasus Mewajibkan Verifikasi Lapangan Resmi (Kebijakan: Required)"}
              </span>
            </div>
            {!isVerified && (
              <button
                type="button"
                onClick={handleFastVerification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulasikan Verifikasi Cepat (Mayor Cpm)</span>
              </button>
            )}
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            {isVerified
              ? latestVerification?.outcomeNote ||
                "Hasil verifikasi otoritatif tercatat sah oleh Petugas Verifikasi."
              : "Sebelum mengajukan laporan ke Reviewer, analis wajib memastikan keabsahan data lapangan dari Petugas Verifikasi."}
          </p>
        </div>
      )}

      {/* Analyst Drafting Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#111A2E] rounded-3xl border border-[#1E2E4A] p-6 sm:p-8 shadow-xs space-y-6 text-slate-100"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2E4A] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Penyusunan Bahan Laporan & Klarifikasi
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-950/80 text-blue-300 border border-blue-500/40 rounded font-bold uppercase">
                Letkol Kav
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft v{currentReport?.version || 1} · Status:{" "}
              <span className="font-bold uppercase text-[#F0BC79]">
                {currentReport?.status || "Baru"}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateSummary}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[#F0BC79] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F0BC79]" />
            <span>Hasilkan Ringkasan Simulasi (Deterministik)</span>
          </button>
        </div>

        {/* Selected Evidence Multi-Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Bukti yang Dirujuk dalam Laporan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {evidenceList.map((ev) => {
              const isChecked = selectedEvidenceIds.includes(ev.id);
              return (
                <label
                  key={ev.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer text-xs transition-colors ${
                    isChecked
                      ? "bg-blue-950/50 border-blue-500/60 text-white"
                      : "bg-[#0D1527] border-[#1E2E4A] text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvidenceIds([...selectedEvidenceIds, ev.id]);
                      } else {
                        setSelectedEvidenceIds(selectedEvidenceIds.filter((id) => id !== ev.id));
                      }
                    }}
                    className="mt-0.5 rounded text-[#F0BC79]"
                  />
                  <div>
                    <span className="font-mono font-bold text-[#F0BC79] mr-1.5 bg-[#111A2E] px-2 py-0.5 rounded border border-[#1E2E4A]">
                      [{ev.id}]
                    </span>
                    <span className="font-semibold text-slate-200">{ev.title}</span>
                    <div className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                      &ldquo;{ev.excerpt}&rdquo;
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Ringkasan Temuan Kejadian & Disparitas <span className="text-red-400">*</span>
            </label>
            <span className="text-[10px] bg-[#0D1527] text-slate-400 border border-[#1E2E4A] px-2 py-0.5 rounded font-mono">
              Label: Ringkasan Simulasi
            </span>
          </div>
          <textarea
            rows={5}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Tuliskan ringkasan temuan atau gunakan tombol 'Hasilkan Ringkasan Simulasi' di atas..."
            className="w-full p-4 rounded-2xl border border-[#1E2E4A] bg-[#0D1527] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0BC79]"
            required
          />
        </div>

        {/* Limitations */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Batasan Temuan <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={2}
            value={limitations}
            onChange={(e) => setLimitations(e.target.value)}
            placeholder="Sebutkan cakupan dan batasan data yang diperoleh..."
            className="w-full p-4 rounded-2xl border border-[#1E2E4A] bg-[#0D1527] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0BC79]"
            required
          />
        </div>

        {/* Proposed Clarification */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Usulan Isi Bahan Klarifikasi Pimpinan <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={4}
            value={proposedClarification}
            onChange={(e) => setProposedClarification(e.target.value)}
            placeholder="Rumuskan poin-poin klarifikasi resmi pimpinan..."
            className="w-full p-4 rounded-2xl border border-[#1E2E4A] bg-[#0D1527] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0BC79]"
            required
          />
        </div>

        {/* Verification Acknowledgement Checkbox */}
        <div className="bg-[#0D1527] p-5 rounded-2xl border border-[#1E2E4A] space-y-2">
          <label className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledgedVerification}
              onChange={(e) => setAcknowledgedVerification(e.target.checked)}
              className="mt-0.5 rounded text-[#F0BC79]"
            />
            <span className="font-semibold">
              Saya menyatakan telah membaca hasil konfirmasi petugas verifikasi secara seksama dan
              menyertakan rujukan dokumen yang sah.
            </span>
          </label>
          <div className="text-[11px] text-slate-400 pl-7 flex items-center gap-2">
            <span>Status verifikasi kasus:</span>
            <strong
              className={`font-semibold ${isVerified ? "text-emerald-400" : "text-amber-400"}`}
            >
              {isVerified ? "Tervalidasi Resmi (Verified)" : "Belum diverifikasi"}
            </strong>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1E2E4A]">
          <div className="text-[11px] text-slate-400">
            Penyerahan draf akan mengubah status kasus menjadi{" "}
            <strong className="text-white font-mono">submitted</strong> untuk ditelaah Reviewer,
            atau gunakan alur cepat untuk langsung pengesahan Pimpinan.
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRapidCommandApproval}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Alur Cepat Demo: Langsung verifikasi, telaah, dan terbitkan Naskah Dinas Komando"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>🚀 Sahkan Langsung Komando (Alur Cepat)</span>
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#151E36]" />
              <span>
                {isVerified
                  ? "Ajukan Laporan ke Reviewer (Kolonel Inf)"
                  : "🚀 Kirim Laporan ke Verifikator Lapangan (Mayor Cpm)"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
