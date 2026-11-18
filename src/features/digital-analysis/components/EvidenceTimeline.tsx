"use client";

import React, { useState } from "react";
import { Evidence } from "../types";
import { Filter, Search, ExternalLink, Clock, MapPin } from "lucide-react";
import { EvidenceViewerModal } from "./EvidenceViewerModal";

interface EvidenceTimelineProps {
  evidenceList: Evidence[];
}

export function EvidenceTimeline({ evidenceList }: EvidenceTimelineProps) {
  const [kindFilter, setKindFilter] = useState<"all" | "public_post" | "internal_document">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEvidence, setActiveEvidence] = useState<Evidence | null>(null);

  // Filter application
  let filtered = [...evidenceList];

  if (kindFilter !== "all") {
    filtered = filtered.filter((e) => e.kind === kindFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.excerpt.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.sourceRef.toLowerCase().includes(q)
    );
  }

  // Sort occurredAt ascending, then id
  filtered.sort((a, b) => {
    const diff = new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });

  const formatWib = (iso: string) => {
    try {
      const d = new Date(iso);
      return (
        d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " · " +
        d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
        " WIB"
      );
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search Bar */}
      <div className="bg-[#111A2E] p-4 rounded-2xl border border-[#1E2E4A] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-300">Filter Jenis:</span>
          <div className="flex items-center bg-[#0D1527] p-1 rounded-xl border border-[#1E2E4A]">
            <button
              onClick={() => setKindFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                kindFilter === "all"
                  ? "bg-[#F0BC79] text-[#151E36] font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua ({evidenceList.length})
            </button>
            <button
              onClick={() => setKindFilter("public_post")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                kindFilter === "public_post"
                  ? "bg-[#F0BC79] text-[#151E36] font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🌐 Kanal Publik ({evidenceList.filter((e) => e.kind === "public_post").length})
            </button>
            <button
              onClick={() => setKindFilter("internal_document")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                kindFilter === "internal_document"
                  ? "bg-[#F0BC79] text-[#151E36] font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📄 Dokumen Kodiklat (
              {evidenceList.filter((e) => e.kind === "internal_document").length})
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari dalam bukti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 rounded-lg border border-[#1E2E4A] bg-[#0D1527] text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-[#F0BC79]"
          />
        </div>
      </div>

      {/* Timeline Stream */}
      {filtered.length === 0 ? (
        <div className="bg-[#111A2E] rounded-2xl border border-[#1E2E4A] p-12 text-center text-slate-400 text-xs">
          Tidak ada rekaman bukti yang sesuai dengan filter atau pencarian Anda.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-700 space-y-6 ml-3 sm:ml-4 py-2">
          {filtered.map((ev) => {
            const isPublic = ev.kind === "public_post";
            return (
              <div key={ev.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-4 w-5 h-5 rounded-full border-4 border-[#080D1A] flex items-center justify-center shadow-xs transition-transform group-hover:scale-125 ${
                    isPublic ? "bg-blue-500" : "bg-emerald-500"
                  }`}
                ></div>

                {/* Evidence Card */}
                <div
                  onClick={() => setActiveEvidence(ev)}
                  className="bg-[#111A2E] rounded-xl border border-[#1E2E4A] hover:border-[#F0BC79]/70 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer text-slate-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2E4A] gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs bg-[#0D1527] border border-[#1E2E4A] text-[#F0BC79] px-2 py-0.5 rounded">
                        {ev.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPublic
                            ? "bg-blue-950/60 text-blue-300 border-blue-500/40"
                            : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        {isPublic ? "🌐 Rekaman Kanal Publik" : "📄 Edaran Sah Internal"}
                      </span>
                      {ev.broadRegion && (
                        <span className="text-[10px] text-slate-300 bg-[#0D1527] border border-[#1E2E4A] px-2 py-0.5 rounded flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#F0BC79]" />
                          Wilayah {ev.broadRegion}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        Kejadian:{" "}
                        <strong className="text-slate-200">{formatWib(ev.occurredAt)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Title & Excerpt */}
                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#F0BC79] transition-colors">
                      {ev.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-slate-300 leading-relaxed font-sans bg-[#0D1527] p-3 rounded-lg border border-[#1E2E4A] italic">
                      &ldquo;{ev.excerpt}&rdquo;
                    </p>
                  </div>

                  {/* Card Footer: Metadata & Action */}
                  <div className="mt-4 pt-3 border-t border-[#1E2E4A] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>
                        Sumber: <strong className="font-mono text-slate-200">{ev.sourceId}</strong>
                      </span>
                      <span>
                        Rujukan:{" "}
                        <strong className="font-mono text-[#F0BC79] truncate max-w-xs">
                          {ev.sourceRef}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#F0BC79] font-bold text-xs group-hover:translate-x-1 transition-transform">
                      <span>Buka Penampil Bukti</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <EvidenceViewerModal evidence={activeEvidence} onClose={() => setActiveEvidence(null)} />
    </div>
  );
}
