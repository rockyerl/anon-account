"use client";

import React, { useState } from "react";
import { useDigitalAnalysis } from "../context";
import { VerificationRequest } from "../types";
import {
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { EvidenceViewerModal } from "./EvidenceViewerModal";

export function VerificationQueueView({ selectedRequestId }: { selectedRequestId?: string }) {
  const { actions, currentRole, switchRole, demoActionsConfig } = useDigitalAnalysis();
  const queueRes = actions.listVerificationRequests();
  const requests = ("requests" in queueRes ? queueRes.requests : []) as VerificationRequest[];

  // Fetch all cases to show accurate case titles across requests
  const casesRes = actions.listCases();
  const casesList = "cases" in casesRes ? casesRes.cases : [];
  const getCaseTitle = (cId: string) => casesList.find((c) => c.id === cId)?.title || cId;

  const [activeReqId, setActiveReqId] = useState<string | null>(
    selectedRequestId || (requests.length > 0 ? requests[0].id : null)
  );

  const [statusInput, setStatusInput] = useState<"verified" | "inconclusive">("verified");
  const [outcomeNote, setOutcomeNote] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [viewingEvidenceId, setViewingEvidenceId] = useState<string | null>(null);

  const activeReq = requests.find((r) => r.id === activeReqId);

  // Use authoritative getVerificationRequest to load exact caseItem & attachedEvidence
  const reqDetailRes = activeReqId ? actions.getVerificationRequest(activeReqId) : null;
  const activeCaseItem =
    reqDetailRes && "caseItem" in reqDetailRes
      ? reqDetailRes.caseItem
      : casesList.find((c) => c.id === activeReq?.caseId);

  const attachedEvidence =
    reqDetailRes && "attachedEvidence" in reqDetailRes ? reqDetailRes.attachedEvidence || [] : [];

  const modalEvidence = attachedEvidence.find((e) => e.id === viewingEvidenceId) || null;

  const getSuggestedOutcome = () => {
    if (!activeReq) return "";
    if (activeReq.caseId === "KAS-101") {
      return demoActionsConfig.verificationResult.outcomeNote;
    }
    const cat = activeCaseItem?.category;
    if (activeReq.caseId === "KAS-102" || cat === "tautan") {
      return "Tervalidasi resmi: Staf Personel & IT Kodiklat TNI mengonfirmasi bahwa tautan formulir pendaftaran tersebut adalah domain tiruan ilegal (phishing). Saluran pendaftaran resmi hanya melalui portal rekrutmen-tni.mil.id.";
    }
    if (activeReq.caseId === "KAS-103" || cat === "konteks_video") {
      return "Tervalidasi resmi: Rekaman pergerakan kendaraan taktis merupakan arsip gladi rutin terdahulu. Tidak ada pembatalan latihan tempur dan seluruh alutsista Puslatpur beroperasi normal.";
    }
    return `Tervalidasi resmi: Petugas verifikasi telah melakukan konfirmasi faktual ke unit kerja terkait atas bukti digital pada kasus "${activeCaseItem?.title || activeReq.caseId}". Isu terbukti tidak sesuai fakta kedinasan.`;
  };

  const handleUseSimulationResult = () => {
    setStatusInput("verified");
    setOutcomeNote(getSuggestedOutcome());
    setErrorMessage("");
  };

  const handleResolve = () => {
    if (!activeReq) return;
    setErrorMessage("");
    setSuccessMessage("");

    const res = actions.resolveVerification({
      requestId: activeReq.id,
      status: statusInput,
      outcomeNote,
    });

    if ("error" in res) {
      setErrorMessage(res.message || "Gagal menyimpan hasil verifikasi");
    } else {
      // Advance report to submitted (naik ke Reviewer)
      if (statusInput === "verified") {
        actions.submitReport(activeReq.caseId);
        setSuccessMessage(
          "Fakta lapangan telah berhasil divalidasi dan disetujui (Approved)! Berkas laporan investigasi telah dinaikkan ke Meja Reviewer (Kolonel Inf)."
        );
      } else {
        setSuccessMessage("Hasil verifikasi lapangan berhasil dicatat sebagai Tidak Konklusif.");
      }
    }
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

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#151E36] text-white p-6 rounded-2xl shadow-md border border-[#2A3756]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Jalur Verifikasi Otoritatif Kodiklat</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Antrean Penugasan Verifikasi
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Petugas memeriksa bukti, mencocokkan dokumen rujukan sah, dan menetapkan kesimpulan
              resmi.
            </p>
          </div>
          <div className="bg-[#1f2b4c] p-3 rounded-xl border border-white/10 text-xs text-right">
            <div className="text-slate-400">Total Tugas Aktif</div>
            <div className="text-xl font-black text-[#F0BC79]">
              {requests.filter((r) => r.status === "pending").length}
            </div>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-[#111A2E] rounded-2xl border border-[#1E2E4A] p-12 text-center shadow-xs text-slate-100">
          <FileCheck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Antrean Verifikasi Kosong</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            {currentRole === "petugas_verifikasi"
              ? "Tidak ada permintaan verifikasi yang ditugaskan kepada Anda saat ini. Pada simulasi awal KAS-101, analis perlu mengajukan verifikasi terlebih dahulu."
              : "Belum ada permintaan verifikasi aktif pada kasus yang Anda ikuti."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Daftar Permintaan ({requests.length})
            </h3>
            {requests.map((req) => {
              const isSelected = activeReqId === req.id;
              const isPending = req.status === "pending";
              return (
                <button
                  key={req.id}
                  onClick={() => {
                    setActiveReqId(req.id);
                    setSuccessMessage("");
                    setErrorMessage("");
                    if (req.outcomeNote) {
                      setOutcomeNote(req.outcomeNote);
                      setStatusInput(req.status as "verified" | "inconclusive");
                    } else {
                      setOutcomeNote("");
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-[#15223D] border-[#F0BC79] ring-2 ring-[#F0BC79]/30 shadow-md text-white"
                      : "bg-[#111A2E] border-[#1E2E4A] hover:border-[#F0BC79]/60 shadow-xs text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E2E4A]">
                    <span className="font-mono font-bold text-xs text-[#F0BC79]">{req.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isPending
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : req.status === "verified"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isPending
                        ? "Menunggu Hasil"
                        : req.status === "verified"
                          ? "✓ Terverifikasi"
                          : "Belum Konklusif"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-100 line-clamp-2">
                    {req.question}
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#1E2E4A] flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[180px]">
                      Kasus: <strong className="text-slate-200">{req.caseId}</strong> (
                      {getCaseTitle(req.caseId)})
                    </span>
                    <span>{formatWib(req.createdAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Request Detail & Action Form */}
          <div className="lg:col-span-2">
            {activeReq ? (
              <div className="bg-[#111A2E] rounded-2xl border border-[#1E2E4A] p-6 shadow-xs space-y-6 text-slate-100">
                {/* Request Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2E4A] gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-[#0D1527] border border-[#1E2E4A] text-white px-2 py-0.5 rounded">
                        {activeReq.id}
                      </span>
                      <span className="text-xs text-slate-300 font-semibold">
                        Kasus: <strong className="text-[#F0BC79]">{activeReq.caseId}</strong> —{" "}
                        <span className="text-white font-bold">
                          {activeCaseItem?.title || getCaseTitle(activeReq.caseId)}
                        </span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Diajukan oleh:{" "}
                      <strong className="text-slate-200">{activeReq.requestedBy}</strong> pada{" "}
                      {formatWib(activeReq.createdAt)}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        activeReq.status === "pending"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : activeReq.status === "verified"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-800 text-slate-200 border-slate-700"
                      }`}
                    >
                      Status: {activeReq.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Question Callout */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <span>Pertanyaan / Bahan yang Perlu Dikonfirmasi:</span>
                  </h4>
                  <div className="bg-blue-950/40 border-l-4 border-blue-500 p-4 rounded-r-xl text-slate-100 text-sm font-semibold">
                    {activeReq.question}
                  </div>
                </div>

                {/* Attached Evidence List */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Bukti yang Dilampirkan ({attachedEvidence.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachedEvidence.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setViewingEvidenceId(ev.id)}
                        className="p-3 bg-[#0D1527] hover:bg-[#152038] border border-[#1E2E4A] rounded-xl cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#F0BC79]">{ev.id}</span>
                          <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                            Lihat <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="font-semibold text-white mt-1">{ev.title}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-2 italic">
                          &ldquo;{ev.excerpt}&rdquo;
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Resolution Form */}
                {activeReq.status === "pending" ? (
                  <div className="pt-6 border-t border-[#1E2E4A] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Formulir Penetapan Hasil Verifikasi
                      </h4>
                      {/* Context-aware Quick Recommendation Fill */}
                      <button
                        type="button"
                        onClick={handleUseSimulationResult}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Isi Rekomendasi Hasil ({activeReq.caseId})</span>
                      </button>
                    </div>

                    {errorMessage && (
                      <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {successMessage && (
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Kesimpulan Verifikasi
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setStatusInput("verified")}
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                            statusInput === "verified"
                              ? "bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30"
                              : "bg-[#0D1527] border-[#1E2E4A] text-slate-300 hover:bg-[#152038]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span>Tervalidasi (Verified)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal mt-1">
                            Informasi jadwal atau dokumen telah terkonfirmasi rujukan resmi sah.
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusInput("inconclusive")}
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                            statusInput === "inconclusive"
                              ? "bg-slate-800 border-slate-500 text-white ring-2 ring-slate-500/30"
                              : "bg-[#0D1527] border-[#1E2E4A] text-slate-300 hover:bg-[#152038]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                            <span>Belum Konklusif</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal mt-1">
                            Bukti belum mencukupi atau masih ada ketidakpastian fakta.
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Catatan Resmi & Dasar Verifikasi <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={outcomeNote}
                        onChange={(e) => setOutcomeNote(e.target.value)}
                        placeholder="Tuliskan temuan dan rujukan resmi hasil verifikasi..."
                        className="w-full p-3 rounded-xl bg-[#0D1527] border border-[#1E2E4A] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F0BC79]"
                      />
                    </div>

                    {successMessage && (
                      <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span>{successMessage}</span>
                        <button
                          type="button"
                          onClick={() => switchRole("reviewer")}
                          className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1"
                        >
                          <span>Beralih ke Reviewer (Kolonel Inf)</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleResolve}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Validasi & Setujui (Naik ke Reviewer)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Resolved view */
                  <div className="pt-6 border-t border-[#1E2E4A] space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Hasil Verifikasi Tersimpan
                    </h4>
                    <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4 text-xs text-slate-100">
                      <div className="font-bold text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>
                          Status:{" "}
                          {activeReq.status === "verified" ? "TERVALIDASI" : "BELUM KONKLUSIF"}
                        </span>
                      </div>
                      <div className="mt-2 text-slate-200 font-sans leading-relaxed">
                        &ldquo;{activeReq.outcomeNote}&rdquo;
                      </div>
                      <div className="mt-2 pt-2 border-t border-emerald-800/40 text-[10px] text-slate-400">
                        Diselesaikan pada:{" "}
                        {activeReq.resolvedAt ? formatWib(activeReq.resolvedAt) : "-"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Evidence Viewer Modal */}
      <EvidenceViewerModal evidence={modalEvidence} onClose={() => setViewingEvidenceId(null)} />
    </div>
  );
}
