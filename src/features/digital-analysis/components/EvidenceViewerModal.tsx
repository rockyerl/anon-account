"use client";

import React from "react";
import { Evidence } from "../types";
import {
  X,
  Calendar,
  MapPin,
  FileText,
  Globe,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Share2,
  Heart,
  MessageSquare,
} from "lucide-react";

interface EvidenceViewerModalProps {
  evidence: Evidence | null;
  onClose: () => void;
}

export function EvidenceViewerModal({ evidence, onClose }: EvidenceViewerModalProps) {
  if (!evidence) return null;

  const isPublic = evidence.kind === "public_post";

  const formatWib = (iso: string) => {
    try {
      const d = new Date(iso);
      return (
        d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-[#111A2E] border border-[#1E2E4A] rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="bg-[#151E36] text-white px-6 py-4 flex items-center justify-between border-b border-[#2A3756]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isPublic
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-[#F0BC79]/20 text-[#F0BC79] border border-[#F0BC79]/30"
              }`}
            >
              {isPublic ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs bg-white/20 px-2 py-0.5 rounded text-white tracking-wider">
                  {evidence.id}
                </span>
                <span className="text-xs text-slate-300 font-mono">Kasus: {evidence.caseId}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {isPublic ? "Kanal Publik" : "Dokumen Kodiklat"}
                </span>
              </div>
              <h3 className="font-bold text-base text-white mt-0.5">{evidence.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#0D1527] p-4 rounded-2xl border border-[#1E2E4A] text-xs">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Kategori Dokumen</div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {isPublic ? "🌐 Postingan Publik Medsos" : "📄 Surat Edaran / Naskah Dinas"}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Kode Sumber Data</div>
              <div className="font-semibold font-mono text-white mt-0.5">{evidence.sourceId}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Sebaran Wilayah</div>
              <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {evidence.broadRegion
                  ? `Wilayah ${evidence.broadRegion}`
                  : "Nasional / Belum Terpetakan"}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                Waktu Kejadian (WIB)
              </div>
              <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatWib(evidence.occurredAt)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                Waktu Masuk Intake
              </div>
              <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatWib(evidence.recordedAt)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                Nomor / Tautan Rujukan
              </div>
              <div
                className="font-semibold font-mono text-cyan-400 mt-0.5 truncate"
                title={evidence.sourceRef}
              >
                {evidence.sourceRef}
              </div>
            </div>
          </div>

          {/* Cuplikan */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Cuplikan Bukti Terdokumentasi
            </h4>
            <div className="bg-[#0D1527] border-l-4 border-[#F0BC79] p-4 rounded-r-xl text-slate-200 text-sm leading-relaxed font-sans italic">
              &ldquo;{evidence.excerpt}&rdquo;
            </div>
          </div>

          {/* High-Fidelity Local Mockup Visual */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Simulasi Penampil Bukti Otoritatif (100% Offline)</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400 bg-[#0D1527] border border-[#1E2E4A] px-2 py-0.5 rounded">
                Hash Autentikasi: SHA256-SIMULASI
              </span>
            </div>

            {isPublic ? (
              /* Social Media Post Mockup */
              <div className="border border-[#1E2E4A] rounded-2xl p-5 bg-[#0D1527] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                      {evidence.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{evidence.title}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-950" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        @kanal_publik_simulasi · {evidence.sourceRef}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatWib(evidence.occurredAt)}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-[#111A2E] p-4 rounded-xl border border-[#1E2E4A]">
                  {evidence.excerpt}
                </div>

                {/* Simulated Disinformation Flag */}
                <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="font-semibold">
                    KODIKLAT ALERT: Unggahan ini sedang diinvestigasi karena terindikasi menyebarkan
                    perubahan jadwal fiktif.
                  </span>
                </div>

                {/* Engagement Bar */}
                <div className="pt-3 border-t border-[#1E2E4A] flex items-center justify-between text-slate-400 text-xs px-2">
                  <span className="flex items-center gap-1.5 hover:text-cyan-400 cursor-pointer">
                    <MessageSquare className="w-4 h-4" /> 148 Komentar
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer">
                    <Share2 className="w-4 h-4" /> 1.420 Bagikan
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-rose-400 cursor-pointer">
                    <Heart className="w-4 h-4" /> 8.940 Suka
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /> 142.3K Tayangan
                  </span>
                </div>
              </div>
            ) : (
              /* Official Military Memorandum Mockup */
              <div className="border border-[#1E2E4A] rounded-2xl p-6 sm:p-8 bg-[#0D1527] shadow-sm relative font-sans text-slate-200">
                {/* Official Stamp */}
                <div className="absolute top-6 right-6 border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest rotate-3 opacity-90 shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>RUJUKAN SAH · KODIKLAT TNI</span>
                </div>

                {/* Official Letterhead */}
                <div className="text-center pb-4 border-b border-[#1E2E4A] mb-4">
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider">
                    MARKAS BESAR TENTARA NASIONAL INDONESIA
                  </div>
                  <div className="text-sm font-black text-white tracking-widest mt-0.5">
                    KOMANDO PEMBINAAN DOKTRIN, PENDIDIKAN DAN LATIHAN
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Jalan Hegarmanah No. 152, Bandung · Kode Arsip: {evidence.sourceRef}
                  </div>
                </div>

                <div className="space-y-3 py-2 text-xs text-slate-300">
                  <div className="flex justify-between font-mono text-[11px] text-slate-400 border-b border-[#1E2E4A] pb-2">
                    <span>
                      KLASIFIKASI: <strong className="text-white">TERBATAS</strong>
                    </span>
                    <span>
                      TANGGAL:{" "}
                      <strong className="text-white">{formatWib(evidence.occurredAt)}</strong>
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="font-bold text-sm text-white mb-1">{evidence.title}</div>
                    <div className="bg-[#111A2E] p-4 rounded-xl border border-[#1E2E4A] leading-relaxed font-sans text-xs text-slate-200">
                      {evidence.excerpt}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-end text-[11px] text-slate-400">
                    <div>
                      <div>
                        Status Otentikasi:{" "}
                        <strong className="text-emerald-400">
                          TERVERIFIKASI DI ARSIP KODIKLAT
                        </strong>
                      </div>
                      <div>
                        ID Verifikasi: <code>KODIKLAT-DOC-VERIFIED-01</code>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400">An. Komandan Kodiklat TNI</div>
                      <div className="font-bold text-white mt-4">Direktur Doktrin & Latihan</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0B1224] px-6 py-4 border-t border-[#1E2E4A] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Rujukan ID: {evidence.id} · Disimpan pada media terisolasi lokal
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#F0BC79] hover:bg-[#e0ac69] text-[#151E36] text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            Tutup Penampil Bukti
          </button>
        </div>
      </div>
    </div>
  );
}
